from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session
from typing import List, Dict, Optional, Any, cast
from ..models.learning_path import LearningPath
from ..models.content import Content, DifficultyLevel
from ..models.user_progress import UserProgress
from ..models.prerequisites import Prerequisites
from ..core.logging import logger
from .ai_service import AIService
from .cache_manager import CacheManager
from .nlp_recommendation_service import NLPRecommendationService

class LearningPathService:
    def __init__(self, db: Session, cache_manager: CacheManager, ai_service: AIService):
        self.db = db
        self.cache = cache_manager
        self.ai_service = ai_service
        self.nlp_service = NLPRecommendationService(db, cache_manager, ai_service)

    async def generate_learning_path(self, user_id: int, category_id: int) -> Dict[str, Any]:
        cache_key = f"learning_path:user:{user_id}:category:{category_id}"
        
        try:
            return await self.cache.get_or_set(
                cache_key,
                lambda: self._create_personalized_path(user_id, category_id),
                cache_type="learning_path"
            )
        except Exception as e:
            logger.error(f"Error generating learning path: {str(e)}")
            return {"nodes": [], "edges": []}

    async def _create_personalized_path(self, user_id: int, category_id: int) -> Dict[str, Any]:
        # Get user's current progress
        progress_records = (
            self.db.query(UserProgress)
            .filter(UserProgress.user_id == user_id)
            .all()
        )
        
        # Convert to proper type for completed content
        completed_content: Dict[int, float] = {}
        for record in progress_records:
            content_id = getattr(record, 'content_id', None)
            score = getattr(record, 'score', None)
            if content_id is not None and score is not None:
                completed_content[content_id] = float(score)

        # Get category content
        content_items = (
            self.db.query(Content)
            .filter(Content.category_id == category_id)
            .all()
        )

        # Analyze prerequisites for each content
        nodes = []
        edges = []
        for content in content_items:
            # Get content attributes safely
            content_id = getattr(content, 'id', None)
            content_title = getattr(content, 'title', '')
            content_difficulty = getattr(content, 'difficulty', None)
            
            if not content_id:
                continue

            # Convert title to string for AI analysis
            title_str = str(content_title) if content_title else ""
            prereq_analysis = await self.ai_service.analyze_prerequisites(title_str)
            
            difficulty_str = content_difficulty.value if content_difficulty else "beginner"
            
            nodes.append({
                "id": content_id,
                "title": title_str,
                "difficulty": difficulty_str,
                "completed": content_id in completed_content,
                "score": completed_content.get(content_id, 0.0)
            })

            # Get prerequisites safely
            prerequisites = getattr(content, 'prerequisites', None)
            if prerequisites and isinstance(prerequisites, list):
                for prereq_id in prerequisites:
                    if isinstance(prereq_id, int):
                        edges.append({
                            "from": prereq_id,
                            "to": content_id,
                            "type": "prerequisite"
                        })

        recommended = await self._get_recommended_next(nodes, edges, completed_content)
        return {
            "nodes": nodes,
            "edges": edges,
            "recommended_next": recommended
        }

    async def _get_recommended_next(
        self, 
        nodes: List[Dict[str, Any]], 
        edges: List[Dict[str, Any]], 
        completed_content: Dict[int, float]
    ) -> List[Dict[str, Any]]:
        # Get prerequisite-based recommendations
        available_nodes = []
        for node in nodes:
            node_id = node.get("id")
            if node_id is not None and node_id not in completed_content:
                prerequisites_met = True
                for edge in edges:
                    if edge.get("to") == node_id:
                        prereq_id = edge.get("from")
                        if prereq_id is not None and prereq_id not in completed_content:
                            prerequisites_met = False
                            break
                if prerequisites_met:
                    available_nodes.append(node)

        # Get NLP-based recommendations
        try:
            # Only get NLP recommendations if we have completed content
            user_id = next(iter(completed_content.keys())) if completed_content else None
            nlp_recommendations = await self.nlp_service.get_nlp_recommendations(
                user_id=user_id if user_id is not None else 0  # Fallback to 0 for new users
            ) if user_id is not None else []
        except Exception as e:
            logger.error(f"Error getting NLP recommendations: {str(e)}")
            nlp_recommendations = []

        # Combine and score recommendations
        recommendations = []
        seen_ids = set()

        # Add prerequisite-based recommendations
        for node in available_nodes:
            node_id = node.get("id")
            if node_id and node_id not in seen_ids:
                recommendations.append({
                    **node,
                    "recommendation_type": "prerequisite",
                    "confidence": 1.0
                })
                seen_ids.add(node_id)

        # Add NLP-based recommendations
        for rec in nlp_recommendations:
            content = rec.get("content")
            if content and content.id not in seen_ids:
                recommendations.append({
                    "id": content.id,
                    "title": content.title,
                    "difficulty": getattr(content, "difficulty", "beginner"),
                    "recommendation_type": "nlp",
                    "confidence": rec.get("similarity", 0.0),
                    "reason": rec.get("reason", "")
                })
                seen_ids.add(content.id)

        # Sort by confidence and return top recommendations
        return sorted(
            recommendations,
            key=lambda x: x.get("confidence", 0),
            reverse=True
        )[:5]
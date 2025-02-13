from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from ..models.user_progress import UserProgress
from ..models.content import Content, Category
from ..models.quiz_result import QuizResult
from ..core.logging import logger
from .cache_manager import CacheManager
from .ai_service import AIService

class NLPRecommendationService:
    def __init__(self, db: Session, cache_manager: CacheManager, ai_service: AIService):
        self.db = db
        self.cache = cache_manager
        self.ai_service = ai_service

    async def get_nlp_recommendations(self, user_id: int) -> List[Dict]:
        cache_key = f"nlp_recommendations:user:{user_id}"
        
        try:
            return await self.cache.get_or_set(
                cache_key,
                lambda: self._generate_nlp_recommendations(user_id),
                cache_type="recommendations"
            )
        except Exception as e:
            logger.error(f"Error generating NLP recommendations: {str(e)}")
            return []

    async def _generate_nlp_recommendations(self, user_id: int) -> List[Dict]:
        try:
            # Get user's completed content
            completed_content = self.db.query(Content).join(
                UserProgress,
                and_(
                    UserProgress.content_id == Content.id,
                    UserProgress.user_id == user_id,
                    UserProgress.score >= 70
                )
            ).all()

            if not completed_content:
                return await self._get_beginner_recommendations()

            # Extract content texts for NLP analysis
            content_texts = [
                str(getattr(content, 'content', '')) 
                for content in completed_content
            ]

            # Get content embeddings and similarities
            content_analysis = await self.ai_service.analyze_content_relationships(content_texts)
            
            # Find similar content not yet completed
            similar_content = self.db.query(Content).filter(
                ~Content.id.in_([c.id for c in completed_content])
            ).all()

            recommendations = []
            for content in similar_content:
                content_text = str(getattr(content, 'content', ''))
                similarity_score = await self.ai_service.calculate_content_similarity(
                    content_text,
                    content_texts
                )
                if similarity_score > 0.7:  # Threshold for similarity
                    recommendations.append({
                        "content": content,
                        "type": "nlp_recommended",
                        "similarity": similarity_score,
                        "reason": "Based on your learning patterns"
                    })

            return sorted(
                recommendations, 
                key=lambda x: x["similarity"], 
                reverse=True
            )[:5]

        except Exception as e:
            logger.error(f"Error in NLP recommendations: {str(e)}")
            return []

    async def _get_beginner_recommendations(self) -> List[Dict]:
        try:
            beginner_content = self.db.query(Content).filter(
                Content.difficulty == "beginner"
            ).limit(5).all()

            return [
                {
                    "content": content,
                    "type": "beginner",
                    "similarity": 1.0,
                    "reason": "Recommended for beginners"
                }
                for content in beginner_content
            ]
        except Exception as e:
            logger.error(f"Error getting beginner recommendations: {str(e)}")
            return [] 
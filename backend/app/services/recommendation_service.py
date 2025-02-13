from sqlalchemy import func, and_, cast, Integer, text, literal, or_
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from ..models.user_progress import UserProgress
from ..models.content import Content, Category
from ..models.quiz_result import QuizResult
from ..models.learning_path import LearningPath
from ..core.logging import logger
from .cache_manager import CacheManager

class RecommendationService:
    def __init__(self, db: Session, cache_manager: CacheManager):
        self.db = db
        self.cache = cache_manager

    async def get_recommendations(self, user_id: int) -> List[Dict]:
        cache_key = f"recommendations:user:{user_id}"
        
        try:
            return await self.cache.get_or_set(
                cache_key,
                lambda: self._fetch_recommendations(user_id),
                cache_type="recommendations"
            )
        except Exception as e:
            logger.error(f"Error fetching recommendations: {str(e)}")
            return []

    async def _fetch_recommendations(self, user_id: int) -> List[Dict]:
        try:
            # Get user's progress with scores using explicit SQL conditions
            progress_records = (
                self.db.query(UserProgress)
                .filter(UserProgress.user_id == user_id)
                .filter(or_(
                    UserProgress.score.is_(None),
                    UserProgress.score >= 70
                ))
                .all()
            )
            
            # Process records in Python where type checking is more straightforward
            completed_content_ids = []
            for record in progress_records:
                score = getattr(record, 'score', None)
                if score is not None and isinstance(score, (int, float)) and score >= 70:
                    content_id = getattr(record, 'content_id', None)
                    if content_id is not None:
                        completed_content_ids.append(int(content_id))
            
            recommendations = []
            recommendations.extend(await self._get_next_level_recommendations(user_id, completed_content_ids))
            recommendations.extend(await self._get_similar_content_recommendations(user_id, completed_content_ids))
            recommendations.extend(await self._get_trending_recommendations(completed_content_ids))
            
            return recommendations[:10]
        except Exception as e:
            logger.error(f"Database error in recommendations: {str(e)}")
            return []

    async def _get_next_level_recommendations(self, user_id: int, completed_ids: List[int]) -> List[Dict]:
        user_levels = self.db.query(
            Content.category_id,
            func.max(Content.difficulty).label('current_level')
        ).join(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.score >= 70
        ).group_by(Content.category_id).subquery()

        next_level_content = self.db.query(Content).join(
            user_levels,
            and_(
                Content.category_id == user_levels.c.category_id,
                Content.difficulty > user_levels.c.current_level
            )
        ).filter(
            ~Content.id.in_(completed_ids)
        ).all()

        return [
            {
                "content": content,
                "type": "next_level",
                "reason": "Next difficulty level based on your progress"
            } for content in next_level_content
        ]

    async def _get_similar_content_recommendations(self, user_id: int, completed_ids: List[int]) -> List[Dict]:
        # Get user's interests based on completed content
        user_categories = self.db.query(Content.category_id).join(
            UserProgress
        ).filter(
            UserProgress.user_id == user_id
        ).distinct().all()
        
        category_ids = [cat[0] for cat in user_categories]
        
        similar_content = self.db.query(Content).filter(
            Content.category_id.in_(category_ids),
            ~Content.id.in_(completed_ids)
        ).order_by(func.random()).limit(5).all()
        
        return [
            {
                "content": content,
                "type": "similar",
                "reason": "Similar to topics you've enjoyed"
            } for content in similar_content
        ]

    async def _get_trending_recommendations(self, completed_ids: List[int]) -> List[Dict]:
        trending = self.db.query(
            Content,
            func.count(QuizResult.id).label('popularity')
        ).join(QuizResult).filter(
            ~Content.id.in_(completed_ids)
        ).group_by(Content.id).order_by(
            func.desc('popularity')
        ).limit(5).all()
        
        return [
            {
                "content": content,
                "type": "trending",
                "reason": f"Popular among learners ({popularity} completions)"
            } for content, popularity in trending
        ] 
from sqlalchemy import func, cast, Integer
from sqlalchemy.orm import Session
from typing import Dict, Optional
from ..models.user_progress import UserProgress
from ..models.content import Content

class DifficultyService:
    def __init__(self, db: Session):
        self.db = db
        self.difficulty_levels = ["beginner", "intermediate", "advanced", "expert"]

    async def get_recommended_difficulty(self, user_id: int, category_id: int) -> str:
        avg_score = self.db.query(
            func.avg(cast(UserProgress.score, Integer))
        ).join(Content).filter(
            UserProgress.user_id == user_id,
            Content.category_id == category_id
        ).scalar() or 0

        if avg_score >= 90:
            return self._get_next_difficulty("advanced")
        elif avg_score >= 75:
            return self._get_next_difficulty("intermediate")
        elif avg_score >= 60:
            return "intermediate"
        else:
            return "beginner"

    def _get_next_difficulty(self, current: str) -> str:
        try:
            current_idx = self.difficulty_levels.index(str(current))
            next_idx = min(current_idx + 1, len(self.difficulty_levels) - 1)
            return self.difficulty_levels[next_idx]
        except ValueError:
            return "beginner"

    async def adjust_content_difficulty(self, user_id: int, content_id: int, score: float) -> Dict:
        content = self.db.query(Content).filter(Content.id == content_id).first()
        if not content:
            return {
                "current_difficulty": "beginner",
                "recommended_difficulty": "beginner",
                "score": score
            }
            
        current_difficulty = str(content.difficulty)
        
        if score >= 90:
            recommended = self._get_next_difficulty(current_difficulty)
        elif score <= 40:
            current_idx = self.difficulty_levels.index(current_difficulty)
            recommended = self.difficulty_levels[max(0, current_idx - 1)]
        else:
            recommended = current_difficulty

        return {
            "current_difficulty": current_difficulty,
            "recommended_difficulty": recommended,
            "score": score
        } 
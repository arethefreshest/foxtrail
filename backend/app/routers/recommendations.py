from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
from ..database.connection import get_db
from ..core.auth import get_current_user
from ..services.recommendation_service import RecommendationService
from ..services.cache_manager import CacheManager
from ..core.dependencies import get_cache_manager

router = APIRouter()

@router.get("/recommendations/{user_id}", response_model=List[Dict])
async def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db),
    cache_manager: CacheManager = Depends(get_cache_manager)
):
    recommendation_service = RecommendationService(db, cache_manager)
    return await recommendation_service.get_recommendations(user_id) 
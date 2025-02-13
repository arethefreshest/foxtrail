from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ...database.connection import get_db
from ...models.user import User
from ...models.user_progress import UserProgress
from ...core.auth import get_current_user
from ...services.learning_path_service import LearningPathService
from ...services.ai_service import AIService
from ...services.cache_manager import CacheManager
from ...core.dependencies import get_cache_manager
from ...schemas.learning_path_schema import LearningPathResponse

router = APIRouter()

@router.get("/learning-paths/{category_id}", response_model=LearningPathResponse)
async def get_learning_path(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    cache_manager: CacheManager = Depends(get_cache_manager)
):
    """Get personalized learning path for a category"""
    try:
        user_id = getattr(current_user, 'id', None)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
            
        ai_service = AIService()
        learning_path_service = LearningPathService(db, cache_manager, ai_service)
        return await learning_path_service.generate_learning_path(
            user_id=user_id, 
            category_id=category_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating learning path: {str(e)}"
        )

@router.post("/learning-paths/{category_id}/progress")
async def update_learning_path_progress(
    category_id: int,
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user's progress in a learning path"""
    try:
        user_id = getattr(current_user, 'id', None)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )
            
        # Get existing progress
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.content_id == content_id
        ).first()
        
        if not progress:
            progress = UserProgress(
                user_id=user_id,
                content_id=content_id,
                score=0
            )
            db.add(progress)
        
        db.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating progress: {str(e)}"
        ) 
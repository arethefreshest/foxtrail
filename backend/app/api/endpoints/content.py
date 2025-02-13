from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ...database.connection import get_db
from ...services.ai_service import AIService
from ...core.auth import get_current_user
from ...models.user import User
from ...models.content import Content, Category, DifficultyLevel
from ...schemas.content_schema import ContentCreate, ContentResponse
from ...schemas.category_schema import CategoryCreate, CategoryResponse

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    categories = db.query(Category).all()
    return categories

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/content/{category_id}", response_model=List[ContentResponse])
async def get_content(
    category_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = db.query(Content).filter(Content.category_id == category_id).all()
    return contents

@router.post("/content/generate", response_model=ContentResponse)
async def create_ai_content(
    category_id: int,
    difficulty: DifficultyLevel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    ai_service = AIService()
    generated_content = await ai_service.generate_content(str(category.name), difficulty)
    
    content = Content(
        title=generated_content["title"],
        content=generated_content["content"],
        difficulty=difficulty,
        category_id=category_id
    )
    
    db.add(content)
    db.commit()
    db.refresh(content)
    return content 
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.category import Category
from ..schemas.category_schema import CategoryCreate, CategoryResponse

router = APIRouter()

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories/", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    parent = None
    if category.parent_id:
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
    
    new_category = Category(
        name=category.name,
        description=category.description,
        parent_id=category.parent_id,
        level=parent.level + 1 if parent else 0
    )
    db.add(new_category)
    db.commit()
    return new_category

@router.get("/categories/hierarchy", response_model=List[CategoryResponse])
async def get_category_hierarchy(db: Session = Depends(get_db)):
    root_categories = db.query(Category).filter(Category.parent_id.is_(None)).all()
    return [{"category": cat, "path": cat.get_hierarchy()} for cat in root_categories]

@router.get("/categories/{category_id}/subcategories", response_model=List[CategoryResponse])
def get_subcategories(category_id: int, db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.parent_id == category_id).all() 
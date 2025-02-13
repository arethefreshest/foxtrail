from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .category_schema import CategoryResponse
from ..models.content import DifficultyLevel

class ContentBase(BaseModel):
    title: str
    content: str
    difficulty: DifficultyLevel
    category_id: int

class ContentCreate(ContentBase):
    pass

class ContentResponse(ContentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse]

    class Config:
        orm_mode = True 
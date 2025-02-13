from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, ARRAY
from sqlalchemy.orm import relationship
from ..database.connection import Base
from datetime import datetime
import enum

class DifficultyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    parent_category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    contents = relationship("Content", back_populates="category")
    subcategories = relationship("Category")
    parent_category = relationship("Category", remote_side=[id])

class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    difficulty = Column(Enum(DifficultyLevel))
    category_id = Column(Integer, ForeignKey("categories.id"))
    prerequisites = Column(ARRAY(Integer), default=[])  # IDs of content that should be completed first
    complexity_score = Column(Integer, default=1)  # 1-10 score for sorting within same difficulty
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="contents")
    quizzes = relationship("Quiz", back_populates="content") 
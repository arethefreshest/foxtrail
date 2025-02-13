from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
from .content_schema import ContentResponse

class LearningPathNode(BaseModel):
    id: int
    title: str
    difficulty: str
    completed: bool
    score: float

class LearningPathEdge(BaseModel):
    from_: int
    to: int
    type: str

class LearningPathResponse(BaseModel):
    nodes: List[LearningPathNode]
    edges: List[LearningPathEdge]
    recommended_next: List[int]

    class Config:
        from_attributes = True 
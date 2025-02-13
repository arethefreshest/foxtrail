from pydantic import BaseModel
from datetime import datetime
from typing import Dict, List, Optional

class QuizBase(BaseModel):
    title: str
    content_id: int
    questions: List[Dict]

class QuizCreate(QuizBase):
    pass

class QuizResponse(QuizBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class QuizSubmission(BaseModel):
    answers: Dict[str, str]

class QuizResultResponse(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    feedback: str

    class Config:
        orm_mode = True 
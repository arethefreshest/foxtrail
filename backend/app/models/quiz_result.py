from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from ..database.connection import Base
from datetime import datetime

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    score = Column(Float)
    answers = Column(JSON)  # Store user's answers
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="quiz_results")
    quiz = relationship("Quiz", backref="results") 
from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from ..database.connection import Base
from datetime import datetime

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content_id = Column(Integer, ForeignKey("contents.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    score = Column(Float)
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="progress")
    content = relationship("Content", backref="user_progress")
    quiz = relationship("Quiz", backref="user_progress") 
from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from ..database.base import Base

class Prerequisites(Base):
    __tablename__ = "prerequisites"

    id = Column(Integer, primary_key=True, index=True)
    content_id = Column(Integer, ForeignKey("content.id"))
    prerequisite_id = Column(Integer, ForeignKey("content.id"))
    relationship_type = Column(String)  # e.g., "required", "recommended"

    content = relationship("Content", foreign_keys=[content_id])
    prerequisite = relationship("Content", foreign_keys=[prerequisite_id]) 
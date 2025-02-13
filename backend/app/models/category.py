from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database.base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    level = Column(Integer, default=0)  # Hierarchy level

    # Relationships
    parent = relationship("Category", remote_side=[id], backref="subcategories")
    content = relationship("Content", back_populates="category")

    def get_hierarchy(self):
        """Returns full category path"""
        if not self.parent:
            return [self.name]
        return self.parent.get_hierarchy() + [self.name] 
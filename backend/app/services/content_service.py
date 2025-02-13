from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from ..models.content import Content
from .ai_service import AIService
from difflib import SequenceMatcher

class ContentService:
    def __init__(self, db: Session, ai_service: AIService):
        self.db = db
        self.ai_service = ai_service

    async def generate_content(self, topic: str, category_id: int) -> Dict[str, Any]:
        # Check for duplicates first
        existing = await self.find_similar_content(topic)
        if existing:
            return {"content": existing, "is_duplicate": True}

        # Generate new content
        content = await self.ai_service.generate_content(topic, difficulty="beginner")
        
        # Store new content
        new_content = Content(
            title=content["title"],
            content=content["content"],
            category_id=category_id,
            is_generated=True
        )
        self.db.add(new_content)
        self.db.commit()
        
        return {"content": new_content, "is_duplicate": False}

    async def find_similar_content(self, topic: str, threshold: float = 0.85) -> Optional[Content]:
        existing_content = self.db.query(Content).all()
        
        for content in existing_content:
            similarity = SequenceMatcher(
                None, 
                topic.lower(), 
                content.title.lower()
            ).ratio()
            
            if similarity > threshold:
                return content
        
        return None 
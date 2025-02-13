from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models.content import Content
from ..models.category import Category
from .ai_service import AIService
from ..core.logging import logger
from fastapi import HTTPException

class SearchService:
    def __init__(self, db: Session, ai_service: AIService):
        self.db = db
        self.ai_service = ai_service

    async def search(self, query: str) -> List[Dict[str, Any]]:
        try:
            # AI-enhanced search
            enhanced_query = await self.ai_service.enhance_search_query(query)
            logger.info(f"Enhanced query: {enhanced_query} (original: {query})")
            
            # Search in categories and content
            results = self.db.query(Content).filter(
                Content.title.ilike(f"%{enhanced_query}%") |
                Content.content.ilike(f"%{enhanced_query}%")
            ).all()
            
            logger.info(f"Found {len(results)} results for query: {enhanced_query}")
            return [self.format_result(r) for r in results]
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail={"message": "Search failed", "error": str(e)}
            )

    def format_result(self, result: Content) -> Dict[str, Any]:
        return {
            "id": result.id,
            "title": result.title,
            "type": "content",
            "category_id": result.category_id,
            "preview": result.content[:200] + "..."
        } 
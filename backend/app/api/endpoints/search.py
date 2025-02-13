from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from ...database.connection import get_db
from ...services.ai_service import AIService
from ...services.quiz_generator import QuizGenerator
from ...models.category import Category
from ...models.content import Content
from ...schemas.search_schema import SearchQuery, SearchResponse
from ...services.search_service import SearchService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=SearchResponse)
async def search_topics(
    query: SearchQuery,
    db: Session = Depends(get_db)
):
    logger.info(f"Search request received - Query: {query.query}")
    try:
        # Initialize services
        ai_service = AIService()
        search_service = SearchService(db, ai_service)
        
        # Use search service
        logger.debug("Calling search service")
        search_results = await search_service.search(query.query)
        logger.info(f"Found {len(search_results)} results")
        
        return {
            "existingContent": search_results,
            "generatedContent": [],
            "categories": []
        }
    except Exception as e:
        logger.exception("Search failed with exception:")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Search operation failed",
                "error": str(e),
                "query": query.query
            }
        ) 
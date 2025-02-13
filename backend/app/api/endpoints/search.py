from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from ...database.connection import get_db
from ...services.ai_service import AIService
from ...services.quiz_generator import QuizGenerator
from ...models.category import Category
from ...models.content import Content
from ...schemas.search_schema import SearchQuery, SearchResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/search", response_model=SearchResponse)
async def search_topics(
    query: SearchQuery,
    db: Session = Depends(get_db)
):
    logger.info(f"Searching for topic: {query.query}")
    try:
        # Initialize services
        ai_service = AIService()
        quiz_generator = QuizGenerator(ai_service)
        
        # Search existing content
        existing_content = db.query(Content).filter(
            Content.title.ilike(f"%{query.query}%")
        ).all()
        logger.debug(f"Found {len(existing_content)} existing content items")

        # Generate new content if needed
        generated_content = []
        if not existing_content or query.generateContent:
            try:
                content = await ai_service.generate_content(
                    query.query, 
                    difficulty="beginner"
                )
                logger.info(f"Generated new content for: {query.query}")
                quiz = await quiz_generator.create_quiz(content["content"])
                
                # Save generated content
                new_content = Content(
                    title=content["title"],
                    content=content["content"],
                    category_id=content["category_id"],
                    is_generated=True
                )
                db.add(new_content)
                db.commit()
                
                generated_content.append(new_content)
            except Exception as e:
                logger.error(f"Content generation failed: {str(e)}")
                raise HTTPException(status_code=500, detail=str(e))

        # Get relevant categories
        categories = db.query(Category).filter(
            Category.name.ilike(f"%{query.query}%")
        ).all()

        return {
            "existingContent": existing_content,
            "generatedContent": generated_content,
            "categories": [cat.name for cat in categories]
        }
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Search operation failed") 
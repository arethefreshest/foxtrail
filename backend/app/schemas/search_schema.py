from pydantic import BaseModel
from typing import List
from .content_schema import ContentResponse

class SearchQuery(BaseModel):
    query: str
    generateContent: bool = True

class SearchResponse(BaseModel):
    existingContent: List[ContentResponse]
    generatedContent: List[ContentResponse]
    categories: List[str] 
from redis import Redis
from typing import Optional, Any
import json
from .ai_service import AIService

class CacheService:
    def __init__(self, ai_service: AIService):
        self.redis: Optional[Redis] = None
        self.ai_service = ai_service

    async def init_cache(self, redis_url: str):
        self.redis = Redis.from_url(redis_url, decode_responses=True)

    async def get_generated_content(self, query: str) -> Optional[dict]:
        if not self.redis:
            return await self.generate_content(query)
            
        cache_key = f"content:{query}"
        cached = self.redis.get(cache_key)
        
        if cached and isinstance(cached, str):
            try:
                return json.loads(cached)
            except json.JSONDecodeError:
                return None
            
        content = await self.generate_content(query)
        if content:
            self.redis.setex(cache_key, 3600, json.dumps(content))
        return content

    async def generate_content(self, query: str):
        return await self.ai_service.generate_content(query, "beginner") 
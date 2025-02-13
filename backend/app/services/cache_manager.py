from redis import Redis
from typing import Optional, Any, Dict, List, Callable
import json
from datetime import timedelta
from ..core.config import settings
from ..core.logging import logger

class CacheManager:
    def __init__(self):
        self.redis: Optional[Redis] = None
        self.cache_ttls = {
            "recommendations": timedelta(hours=1),
            "content": timedelta(days=1),
            "quiz": timedelta(days=7),
            "user_progress": timedelta(minutes=30)
        }

    async def init_cache(self):
        try:
            self.redis = Redis.from_url(
                settings.REDIS_URL, 
                decode_responses=True,
                socket_timeout=5
            )
            await self.redis.ping()
            logger.info("Cache connection established")
        except Exception as e:
            logger.error(f"Cache connection failed: {str(e)}")
            self.redis = None

    async def get_or_set(
        self, 
        key: str, 
        fetch_func: Callable[[], Any], 
        ttl: Optional[timedelta] = None,
        cache_type: str = "content"
    ) -> Any:
        if not self.redis:
            return await fetch_func()

        try:
            cached = await self.redis.get(key)
            if cached:
                logger.debug(f"Cache hit for key: {key}")
                return json.loads(cached)

            result = await fetch_func()
            ttl_seconds = int(ttl.total_seconds()) if ttl else int(self.cache_ttls[cache_type].total_seconds())
            
            if result is not None:
                await self.redis.setex(
                    key,
                    ttl_seconds,
                    json.dumps(result)
                )
            return result

        except Exception as e:
            logger.error(f"Cache error for key {key}: {str(e)}")
            return await fetch_func() 
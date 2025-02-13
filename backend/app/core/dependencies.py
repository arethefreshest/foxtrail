from ..services.cache_manager import CacheManager

cache_manager = CacheManager()

async def get_cache_manager() -> CacheManager:
    if not cache_manager.redis:
        await cache_manager.init_cache()
    return cache_manager 
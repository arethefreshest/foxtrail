from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from .api.endpoints import auth, content, quiz, search
from .core.config import settings
from .core.logging import logger

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    root_path="/api",
    # Add OpenAPI configuration with v1 prefix
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming Request: {request.method} {request.url.path}")
    logger.info(f"Full URL: {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    try:
        body = await request.body()
        if body:
            logger.info(f"Request Body: {body.decode()}")
    except Exception as e:
        logger.error(f"Error reading body: {e}")

    response = await call_next(request)
    logger.info(f"Response Status: {response.status_code}")
    return response

# Update CORS configuration
origins = [
    settings.FRONTEND_URL,
    "https://foxtrailai.com",
    "http://localhost:3000",
    "http://localhost:8080",
    "*"  # Temporarily allow all origins for testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add v1 prefix to router paths
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(content.router, prefix=f"{settings.API_V1_STR}/content", tags=["content"])
app.include_router(quiz.router, prefix=f"{settings.API_V1_STR}/quiz", tags=["quiz"])
app.include_router(search.router, prefix=f"{settings.API_V1_STR}/search", tags=["search"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Debug endpoint
@app.get("/debug-paths")
async def debug_paths():
    routes = []
    for route in app.routes:
        if isinstance(route, APIRoute):
            routes.append({
                "path": route.path,
                "methods": list(route.methods),
                "name": route.name
            })
    return {"routes": routes}

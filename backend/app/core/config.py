from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "FoxTrail"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Required settings with defaults from environment
    DATABASE_URL: str = Field(
        default=os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/foxtrail")
    )
    SECRET_KEY: str = Field(
        default=os.getenv("SECRET_KEY", "development-secret-key")
    )
    FRONTEND_URL: str = Field(
        default=os.getenv("FRONTEND_URL", "http://localhost:3000")
    )
    
    # OpenAI
    OPENAI_API_KEY: str = Field(
        default=os.getenv("OPENAI_API_KEY", ""),
        description="OpenAI API key for content generation"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    # Redis
    REDIS_URL: str = Field(
        default=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        description="Redis URL for caching"
    )
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 
from pydantic_settings import BaseSettings
import os
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Human Rights Monitor MIS"
    
    # MongoDB settings
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "human_rights_monitor")
  
    # Security settings
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        case_sensitive = True
        validate_by_name = True  

settings = Settings()

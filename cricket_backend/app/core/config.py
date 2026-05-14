from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Karachi Cricket Match Finder"
    API_V1_STR: str = "/api/v1"
    
    # MySQL Configuration
    MYSQL_SERVER: str = "localhost"
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_DB: str = "cricket_db"
    
    # JWT Settings
    SECRET_KEY: str = "your-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"   # ← This fixes the extra fields error


settings = Settings()
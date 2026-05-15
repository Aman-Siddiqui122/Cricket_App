from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Karachi Cricket"
    API_V1_STR: str = "/api/v1"
    
    # Defaults for easier local development
    DATABASE_URL: str = "sqlite:///./cricket.db"
    
    SECRET_KEY: str = "secret-key-for-dev-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
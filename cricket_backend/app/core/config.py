from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Karachi Cricket"
    API_V1_STR: str = "/api/v1"
    
    # These are required fields - they must come from .env
    DATABASE_URL: str
    SECRET_KEY: str
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"   # Ignore extra fields

settings = Settings()
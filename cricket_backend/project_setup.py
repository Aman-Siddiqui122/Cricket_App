import os

structure = {
    "cricket_backend": {
        "app": {
            "__init__.py": "",
            "main.py": '''from fastapi import FastAPI

app = FastAPI(title="Cricket App API")

@app.get("/")
def root():
    return {"message": "Cricket Backend Running"}
''',
            "core": {
                "config.py": '''from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
''',
                "database.py": '''from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
''',
                "security.py": '''from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
'''
            },
            "models": {
                "__init__.py": "",
                "user.py": '''from sqlalchemy import Column, Integer, String, Enum
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)
    password_hash = Column(String(255))
''',
                "ground.py": '''from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class Ground(Base):
    __tablename__ = "grounds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150))
    location = Column(Text)
''',
                "team.py": '''from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
''',
                "match.py": '''from sqlalchemy import Column, Integer, Date, Time
from app.core.database import Base

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    match_date = Column(Date)
    match_time = Column(Time)
''',
                "player.py": '''from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
''',
                "match_stat.py": '''from sqlalchemy import Column, Integer
from app.core.database import Base

class MatchStat(Base):
    __tablename__ = "match_stats"

    id = Column(Integer, primary_key=True, index=True)
    runs = Column(Integer, default=0)
''',
                "payment.py": '''from sqlalchemy import Column, Integer, DECIMAL
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(DECIMAL(10, 2))
'''
            },
            "schemas": {
                "__init__.py": "",
                "user.py": '''from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
''',
                "ground.py": '''from pydantic import BaseModel

class GroundCreate(BaseModel):
    name: str
    location: str
''',
                "team.py": '''from pydantic import BaseModel

class TeamCreate(BaseModel):
    name: str
''',
                "match.py": '''from pydantic import BaseModel

class MatchCreate(BaseModel):
    match_date: str
    match_time: str
''',
                "stats.py": '''from pydantic import BaseModel

class MatchStatsCreate(BaseModel):
    runs: int
'''
            },
            "api": {
                "__init__.py": "",
                "auth.py": '''from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.get("/")
def auth_home():
    return {"message": "Auth Route"}
''',
                "grounds.py": '''from fastapi import APIRouter

router = APIRouter(prefix="/grounds", tags=["Grounds"])

@router.get("/")
def get_grounds():
    return []
''',
                "teams.py": '''from fastapi import APIRouter

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("/")
def get_teams():
    return []
''',
                "matches.py": '''from fastapi import APIRouter

router = APIRouter(prefix="/matches", tags=["Matches"])

@router.get("/")
def get_matches():
    return []
''',
                "stats.py": '''from fastapi import APIRouter

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/")
def get_stats():
    return []
''',
                "payments.py": '''from fastapi import APIRouter

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/")
def get_payments():
    return []
'''
            },
            "services": {
                "match_service.py": '''def calculate_match_result():
    return "Match Calculated"
'''
            },
            "utils": {
                "excel_export.py": '''import pandas as pd

def export_excel(data, filename):
    df = pd.DataFrame(data)
    df.to_excel(filename, index=False)
'''
            },
            "dependencies.py": '''from app.core.database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
'''
        },
        "alembic": {},
        ".env": '''DATABASE_URL=mysql+pymysql://root:password@localhost/Cricker_app
SECRET_KEY=supersecretkey
''',
        "requirements.txt": '''fastapi
uvicorn
sqlalchemy
pymysql
python-dotenv
passlib[bcrypt]
pydantic
pydantic-settings
pandas
openpyxl
alembic
''',
        "Dockerfile": '''FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
''',
        "docker-compose.yml": '''version: '3.9'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
'''
    }
}


def create_structure(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)

        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)


create_structure(".", structure)

print("Cricket backend project created successfully!")





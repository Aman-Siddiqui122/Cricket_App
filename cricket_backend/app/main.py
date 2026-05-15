from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api import auth, grounds, teams, matches, stats, payments

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0"
)

# ==================== CORS FIX ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://karachi-cricket.onrender.com",   # Your frontend
        "http://localhost:3000",                  # Local development
        "http://127.0.0.1:3000",
        "*"                                       # Temporary (for testing)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(grounds.router, prefix=settings.API_V1_STR)
app.include_router(teams.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Karachi Cricket Backend API is Running ✅",
        "frontend": "https://karachi-cricket.onrender.com"
    }
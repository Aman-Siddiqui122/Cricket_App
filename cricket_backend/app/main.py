from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import routers
from app.api.auth import router as auth_router
from app.api.grounds import router as grounds_router
from app.api.teams import router as teams_router
from app.api.matches import router as matches_router
from app.api.stats import router as stats_router
from app.api.payments import router as payments_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Karachi Cricket Match Finder & Management System"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================== ROUTERS ======================
# Each router already has its own prefix (e.g. /auth, /teams)
# We include them under the API_V1_STR prefix (/api/v1)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(grounds_router, prefix=settings.API_V1_STR)
app.include_router(teams_router, prefix=settings.API_V1_STR)
app.include_router(matches_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Karachi Cricket Backend API is running ✅",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
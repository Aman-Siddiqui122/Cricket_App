from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Import routers
from app.api import auth, grounds, teams, matches, stats, payments

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
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(grounds.router, prefix=settings.API_V1_STR)
app.include_router(teams.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)

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
print('code written by aman siddiqui')
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api import auth, grounds, teams, matches, stats, payments

app = FastAPI(
    title="Karachi Cricket",
    version="1.0.0",
    description="Local Development Server"
)

# ==================== LOCAL CORS (Best for Development) ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "*"   # Allow all for local testing (safe for dev)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(grounds.router, prefix=settings.API_V1_STR)
app.include_router(teams.router, prefix=settings.API_V1_STR)
app.include_router(matches.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "✅ Karachi Cricket Backend is Running Locally",
        "docs": "/docs",
        "status": "OK"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
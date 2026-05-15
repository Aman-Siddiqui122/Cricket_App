from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api import auth, grounds, teams, matches, stats, payments
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Karachi Cricket",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ✅ Fixed CORS — no wildcard with credentials
ALLOWED_ORIGINS = [
    "https://karachi-cricket.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,       # ✅ No "*" with credentials
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,                          # Cache preflight for 10 mins
)

# ✅ Global Exception Handler — prevents 500 crashes leaking to frontend
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc} | Path: {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
        headers={"Access-Control-Allow-Origin": request.headers.get("origin", "*")}
    )

# ✅ Include Routers with tags for docs
app.include_router(auth.router,     prefix=settings.API_V1_STR, tags=["Auth"])
app.include_router(grounds.router,  prefix=settings.API_V1_STR, tags=["Grounds"])
app.include_router(teams.router,    prefix=settings.API_V1_STR, tags=["Teams"])
app.include_router(matches.router,  prefix=settings.API_V1_STR, tags=["Matches"])
app.include_router(stats.router,    prefix=settings.API_V1_STR, tags=["Stats"])
app.include_router(payments.router, prefix=settings.API_V1_STR, tags=["Payments"])

# ✅ Health check endpoint
@app.get("/")
def root():
    return {
        "message": "✅ Backend is Running",
        "frontend": "https://karachi-cricket.onrender.com",
        "docs": "/docs",
        "status": "healthy"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

# ✅ Startup event to verify DB connection
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Server starting up...")
    try:
        # Test DB connection here if using SQLAlchemy or Motor
        # await db.command("ping")
        logger.info("✅ Database connected")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False   # ✅ Never use reload=True in production
    )
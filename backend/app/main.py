
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.database import mongodb

# Import routers
from app.routes.cases import router as cases_router
from app.routes.reports import router as reports_router
from app.routes.victims import router as victims_router
from app.routes.analytics import router as analytics_router
from app.routes.auth import router as auth_router

# Initialize OAuth2 password bearer for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Connect to MongoDB on startup and store the instance in app state
@app.on_event("startup")
async def startup_db_client():
    mongodb.connect_to_mongodb()
    app.state.mongodb = mongodb  # <-- FIX ADDED HERE

# Close MongoDB connection on shutdown
@app.on_event("shutdown")
async def shutdown_db_client():
    mongodb.close_mongodb_connection()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to Human Rights Monitor MIS API"}

# Include API routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(cases_router, prefix=f"{settings.API_V1_STR}/cases", tags=["cases"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])
app.include_router(victims_router, prefix=f"{settings.API_V1_STR}/victims", tags=["victims"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])



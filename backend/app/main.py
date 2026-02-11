from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import council

app = FastAPI(
    title="Axis Council API",
    description="LLM Council deliberation service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(council.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "axis-council"}



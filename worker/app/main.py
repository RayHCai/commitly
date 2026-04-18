import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.create import router as create_router
from app.api.ingest import router as ingest_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Worker service starting up.")
    yield


app = FastAPI(
    title="Commitly Worker Service",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(ingest_router)
app.include_router(create_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

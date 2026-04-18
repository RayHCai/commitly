from celery import Celery

from app.config import settings

celery_app = Celery(
    "commitly",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_routes={
        "app.tasks.ingest.*": {"queue": "ingest"},
        "app.tasks.create.*": {"queue": "create"},
    },
)

celery_app.autodiscover_tasks(["app.tasks"])

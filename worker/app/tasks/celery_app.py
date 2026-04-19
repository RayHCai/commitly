import logging

from celery import Celery
from celery.signals import after_setup_logger

from app.config import settings


@after_setup_logger.connect
def setup_loggers(logger, *args, **kwargs):
    logging.basicConfig(level=logging.INFO)
    logging.getLogger("app").setLevel(logging.INFO)

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
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    broker_transport_options={
        "socket_keepalive": True,
        "socket_connect_timeout": 10,
        "socket_timeout": 30,
        "retry_on_timeout": True,
    },
    task_routes={
        "app.tasks.ingest.*": {"queue": "ingest"},
        "app.tasks.create.*": {"queue": "create"},
        "app.tasks.deliberate.*": {"queue": "ingest"},
    },
)

celery_app.conf.include = [
    "app.tasks.ingest",
    "app.tasks.create",
    "app.tasks.deliberate",
]

from fastapi import APIRouter, HTTPException

from app.schemas.ingest import IngestRequest, TaskResponse, TaskStatusResponse
from app.tasks.ingest import ingest_commits

router = APIRouter(tags=["ingest"])


@router.post("/ingest", response_model=TaskResponse)
async def start_ingest(request: IngestRequest):
    """Queue an ingestion job for the given repos."""
    try:
        task = ingest_commits.delay(request.user_id, request.repo_names)
        return TaskResponse(task_id=task.id)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Failed to queue task: {str(e)}")


@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """Poll the status of a Celery task."""
    result = ingest_commits.AsyncResult(task_id)
    response = TaskStatusResponse(
        task_id=task_id,
        status=result.status,
    )
    if result.ready():
        response.result = result.get()
    elif result.info and isinstance(result.info, dict):
        response.result = result.info
    return response

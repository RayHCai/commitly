from fastapi import APIRouter

from app.schemas.create import CreateRequest
from app.schemas.ingest import TaskResponse, TaskStatusResponse
from app.tasks.create import create_matched

router = APIRouter(tags=["create"])


@router.post("/create", response_model=TaskResponse)
async def start_create(request: CreateRequest):
    """Queue a create-matched-contributions job."""
    task = create_matched.delay(request.user_id, request.url, request.link_id)
    return TaskResponse(task_id=task.id)


@router.get("/create/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_create_task_status(task_id: str):
    """Poll the status of a create task."""
    result = create_matched.AsyncResult(task_id)
    response = TaskStatusResponse(
        task_id=task_id,
        status=result.status,
    )
    if result.ready():
        response.result = result.get()
    elif result.info and isinstance(result.info, dict):
        response.result = result.info
    return response

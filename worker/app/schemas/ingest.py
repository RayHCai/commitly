from pydantic import BaseModel


class IngestRequest(BaseModel):
    user_id: str
    repo_names: list[str]


class TaskResponse(BaseModel):
    task_id: str
    status: str = "queued"


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: dict | None = None

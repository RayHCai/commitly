from pydantic import BaseModel


class CreateRequest(BaseModel):
    user_id: str
    url: str
    link_id: str


class JobData(BaseModel):
    company: str
    job_title: str
    position_id: str | None = None
    requirements_summary: str
    nice_to_have_summary: str


class CreateResult(BaseModel):
    user_id: str
    url: str
    link_id: str
    job_data: JobData | None = None
    error: str | None = None

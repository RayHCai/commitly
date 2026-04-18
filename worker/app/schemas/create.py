from pydantic import BaseModel


class CreateRequest(BaseModel):
    user_id: str
    query: str


class MatchedContribution(BaseModel):
    commit_sha: str
    repo_name: str
    message: str
    relevance_score: float
    summary: str
    technologies: list[str] = []


class CreateResult(BaseModel):
    user_id: str
    query: str
    contributions: list[MatchedContribution]

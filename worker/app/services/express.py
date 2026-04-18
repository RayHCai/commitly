import httpx

from app.config import settings


async def fetch_commits(user_id: str, repo_name: str) -> list[dict]:
    """Fetch commits for a repo from the Express API."""
    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=60.0
    ) as client:
        response = await client.get(
            f"/api/commits/{user_id}/{repo_name}"
        )
        response.raise_for_status()
        return response.json()

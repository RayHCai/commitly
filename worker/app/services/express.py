import httpx
import logging

from app.config import settings

logger = logging.getLogger(__name__)

SERVICE_HEADERS = {"x-service-token": settings.SERVICE_TOKEN}


async def fetch_commits(
    user_id: str, repo_name: str, since: str | None = None
) -> list[dict]:
    """Fetch all commits for a repo from the Express API, paginating automatically.

    Args:
        user_id: The user whose GitHub token will be used.
        repo_name: Full repo name like "owner/repo".
        since: Optional ISO 8601 timestamp. Only commits after this date are returned.
    """
    owner, repo = repo_name.split("/", 1)

    all_commits: list[dict] = []
    page = 1
    per_page = 100

    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=60.0
    ) as client:
        while True:
            params: dict = {
                "userId": user_id,
                "page": str(page),
                "per_page": str(per_page),
            }
            if since:
                params["since"] = since

            response = await client.get(
                f"/github/repos/{owner}/{repo}/commits",
                params=params,
                headers=SERVICE_HEADERS,
            )
            response.raise_for_status()

            data = response.json().get("data", [])
            if not data:
                break

            all_commits.extend(data)

            if len(data) < per_page:
                break

            page += 1

    logger.info(
        f"Fetched {len(all_commits)} commits for {repo_name} "
        f"(since={since}, pages={page})"
    )
    return all_commits


async def get_repository(user_id: str, repo_name: str) -> dict | None:
    """Fetch repository metadata (including lastIngestedAt) from Express API."""
    owner, repo = repo_name.split("/", 1)

    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=30.0
    ) as client:
        response = await client.get(
            f"/repositories/{owner}/{repo}",
            params={"userId": user_id},
            headers=SERVICE_HEADERS,
        )
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return response.json().get("data")


async def update_last_ingested_at(
    user_id: str, repo_name: str, last_ingested_at: str
) -> None:
    """Update the repository's lastIngestedAt timestamp via Express API."""
    owner, repo = repo_name.split("/", 1)

    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=30.0
    ) as client:
        response = await client.patch(
            f"/repositories/{owner}/{repo}/ingested",
            params={"userId": user_id},
            headers=SERVICE_HEADERS,
            json={"lastIngestedAt": last_ingested_at},
        )
        response.raise_for_status()


async def fetch_shell_links(user_id: str) -> list[dict]:
    """Fetch custom links that haven't been processed yet."""
    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=30.0
    ) as client:
        response = await client.get(
            "/links/shell",
            headers=SERVICE_HEADERS,
            params={"userId": user_id},
        )
        response.raise_for_status()
        data = response.json()
        return data.get("data", [])

import asyncio

import httpx
import logging

from app.config import settings

logger = logging.getLogger(__name__)

SERVICE_HEADERS = {"x-service-token": settings.SERVICE_TOKEN}

MAX_RETRIES = 5
RETRY_BASE_DELAY = 1.0  # seconds


async def _request_with_retry(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    **kwargs,
) -> httpx.Response:
    """Make an HTTP request with retry + exponential backoff on 429 responses."""
    for attempt in range(MAX_RETRIES + 1):
        response = await client.request(method, url, **kwargs)
        if response.status_code != 429 or attempt == MAX_RETRIES:
            return response
        delay = RETRY_BASE_DELAY * (2 ** attempt)
        retry_after = response.headers.get("retry-after")
        if retry_after:
            try:
                delay = max(delay, float(retry_after))
            except ValueError:
                pass
        logger.warning(
            f"Rate limited (429) on {url}, retrying in {delay:.1f}s "
            f"(attempt {attempt + 1}/{MAX_RETRIES})"
        )
        await asyncio.sleep(delay)
    return response  # unreachable but satisfies type checker


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

            response = await _request_with_retry(
                client,
                "GET",
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


async def fetch_commit_details(
    user_id: str, repo_name: str, shas: list[str], max_concurrent: int = 10
) -> list[dict | Exception]:
    """Fetch full commit details (including file patches) for multiple SHAs concurrently.

    Returns a list parallel to `shas` — each entry is either the detail dict
    or an Exception if that particular fetch failed.
    """
    owner, repo = repo_name.split("/", 1)
    sem = asyncio.Semaphore(max_concurrent)

    async def _fetch_one(client: httpx.AsyncClient, sha: str) -> dict:
        async with sem:
            response = await _request_with_retry(
                client,
                "GET",
                f"/github/repos/{owner}/{repo}/commits/{sha}",
                params={"userId": user_id},
                headers=SERVICE_HEADERS,
            )
            response.raise_for_status()
            return response.json().get("data", {})

    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=60.0
    ) as client:
        return await asyncio.gather(
            *[_fetch_one(client, sha) for sha in shas],
            return_exceptions=True,
        )


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


async def create_general_link(user_id: str) -> dict | None:
    """Create a general profile link via the Express API (idempotent)."""
    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=30.0
    ) as client:
        response = await client.post(
            "/links/general",
            headers={**SERVICE_HEADERS, "Content-Type": "application/json"},
            params={"userId": user_id},
        )
        response.raise_for_status()
        return response.json().get("data")


async def complete_general_link(link_id: str, user_id: str) -> None:
    """Mark the general link as ACTIVE via the Express API."""
    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=30.0
    ) as client:
        response = await client.patch(
            f"/links/general/{link_id}/complete",
            headers={**SERVICE_HEADERS, "Content-Type": "application/json"},
            params={"userId": user_id},
        )
        response.raise_for_status()


async def replace_requirements(
    link_id: str, user_id: str, requirements: list[dict]
) -> None:
    """Replace requirements + matched commits for a link via the Express API."""
    async with httpx.AsyncClient(
        base_url=settings.EXPRESS_API_URL, timeout=60.0
    ) as client:
        response = await client.put(
            "/requirements",
            headers={**SERVICE_HEADERS, "Content-Type": "application/json"},
            json={
                "linkId": link_id,
                "userId": user_id,
                "requirements": requirements,
            },
        )
        response.raise_for_status()

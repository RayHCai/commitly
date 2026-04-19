import asyncio
import logging
from datetime import datetime, timezone

from celery import group

from app.config import settings
from app.services import express, weaviate_client
from app.services.gemini import count_tokens
from app.services.pipeline import prepare_commit_text
from app.tasks.celery_app import celery_app
from app.tasks.create import create_matched
from app.tasks.deliberate import deliberate_commit

logger = logging.getLogger(__name__)


def _get_since(user_id: str, repo_name: str) -> str | None:
    """Look up the repository's lastIngestedAt cursor."""
    try:
        repo_info = asyncio.run(express.get_repository(user_id, repo_name))
        if repo_info and repo_info.get("lastIngestedAt"):
            return repo_info["lastIngestedAt"]
    except Exception as e:
        logger.warning(f"Could not fetch lastIngestedAt for {repo_name}: {e}")
    return None


def _update_cursor(user_id: str, repo_name: str, timestamp: str) -> None:
    """Update the repository's lastIngestedAt cursor after ingestion."""
    try:
        asyncio.run(
            express.update_last_ingested_at(user_id, repo_name, timestamp)
        )
    except Exception as e:
        logger.warning(f"Failed to update lastIngestedAt for {repo_name}: {e}")


@celery_app.task(
    bind=True,
    name="app.tasks.ingest.ingest_commits",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    max_retries=2,
)
def ingest_commits(self, user_id: str, repo_names: list[str]) -> dict:
    """Fetch commits from Express API, fan out a deliberation task per commit."""
    errors = []

    weaviate_client.ensure_tenant(user_id)

    # Capture timestamp before fetching so we don't miss commits
    # pushed during processing.
    ingestion_timestamp = datetime.now(timezone.utc).isoformat()

    subtasks = []
    for repo_name in repo_names:
        try:
            since = _get_since(user_id, repo_name)
            commits = asyncio.run(
                express.fetch_commits(user_id, repo_name, since=since)
            )
        except Exception as e:
            logger.error(f"Failed to fetch commits for {repo_name}: {e}")
            errors.append({"repo": repo_name, "error": str(e)})
            continue

        token_budget = settings.MAX_TOKENS_PER_REPO
        tokens_used = 0
        for commit in commits:
            commit_text = prepare_commit_text(commit)
            token_count = count_tokens(commit_text)
            if tokens_used + token_count > token_budget:
                logger.warning(
                    f"Token budget exhausted for {repo_name}: "
                    f"{tokens_used} tokens used, skipping remaining commits"
                )
                break
            tokens_used += token_count
            subtasks.append(
                deliberate_commit.s(user_id, repo_name, commit)
            )

    if not subtasks:
        # Advance cursors even when no new commits, so the next run
        # doesn't re-scan the same window.
        for repo_name in repo_names:
            _update_cursor(user_id, repo_name, ingestion_timestamp)
        return {"status": "completed", "total_ingested": 0, "errors": errors}

    result = group(subtasks).apply_async()
    result.get(disable_sync_subtasks=False)

    total_ingested = 0
    for r in result.results:
        if r.successful():
            total_ingested += r.result.get("chunks_stored", 0)
        else:
            total_ingested += 0
            errors.append({"error": str(r.result)})

    # Advance cursors after successful ingestion
    for repo_name in repo_names:
        _update_cursor(user_id, repo_name, ingestion_timestamp)

    # Trigger create tasks for any shell custom links
    try:
        shell_links = asyncio.run(express.fetch_shell_links(user_id))
        for link in shell_links:
            if link.get("jobUrl") and link.get("id"):
                create_matched.delay(user_id, link["jobUrl"], link["id"])
                logger.info(f"Queued create task for {link['jobUrl']}")
    except Exception as e:
        logger.error(f"Failed to fetch/queue shell links: {e}")
        errors.append({"shell_links": str(e)})

    return {
        "status": "completed",
        "total_ingested": total_ingested,
        "errors": errors,
    }

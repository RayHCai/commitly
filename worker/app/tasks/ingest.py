import asyncio
import logging
from datetime import datetime, timezone

from celery import group

from app.config import settings
from app.services import express, weaviate_client
from app.services.pipeline import prepare_commit_text
from app.services import gemini
from app.tasks.celery_app import celery_app
from app.tasks.create import create_matched, create_general_link
from app.tasks.deliberate import deliberate_batch, BATCH_SIZE

logger = logging.getLogger(__name__)


def _build_diff(detail: dict) -> str:
    """Reconstruct a unified diff from GitHub commit detail file patches."""
    files = detail.get("files", [])
    parts = []
    for f in files:
        patch = f.get("patch", "")
        if patch:
            parts.append(f"diff --git a/{f['filename']} b/{f['filename']}\n{patch}")
    return "\n".join(parts)


def _count_tokens_batch(texts: list[str]) -> list[int]:
    """Count tokens for multiple texts with a single API call + proportional split."""
    if not texts:
        return []
    combined = "\n---\n".join(texts)
    try:
        total = gemini.count_tokens(combined)
    except Exception as e:
        logger.warning(f"Token counting failed, falling back to estimate: {e}")
        return [len(t) // 4 for t in texts]
    lengths = [len(t) for t in texts]
    total_len = sum(lengths)
    if total_len == 0:
        return [0] * len(texts)
    return [round(total * l / total_len) for l in lengths]


async def _fetch_repo(
    user_id: str, repo_name: str
) -> tuple[str, list[dict], list[str]]:
    """Fetch commits + details for one repo. Runs concurrently with other repos."""
    # Get cursor
    since = None
    try:
        repo_info = await express.get_repository(user_id, repo_name)
        if repo_info and repo_info.get("lastIngestedAt"):
            since = repo_info["lastIngestedAt"]
    except Exception as e:
        logger.warning(f"Could not fetch lastIngestedAt for {repo_name}: {e}")

    # Fetch commit list
    commits = await express.fetch_commits(user_id, repo_name, since=since)
    if not commits:
        return repo_name, [], []

    # Fetch commit details (already concurrent via semaphore inside)
    shas = [c["sha"] for c in commits]
    details = await express.fetch_commit_details(user_id, repo_name, shas)

    # Enrich commits with diffs
    errors = []
    for commit, detail in zip(commits, details):
        if isinstance(detail, Exception):
            errors.append(f"Failed to fetch detail for {commit['sha']}: {detail}")
            continue
        commit["diff"] = _build_diff(detail)

    for err in errors:
        logger.warning(err)

    return repo_name, commits, errors


async def _update_cursors(
    user_id: str, repo_names: list[str], timestamp: str
) -> None:
    """Update lastIngestedAt for all repos concurrently."""
    async def _update_one(repo_name: str):
        try:
            await express.update_last_ingested_at(user_id, repo_name, timestamp)
        except Exception as e:
            logger.warning(f"Failed to update lastIngestedAt for {repo_name}: {e}")

    await asyncio.gather(*[_update_one(rn) for rn in repo_names])


async def _post_processing(user_id: str):
    """Fetch shell links and create general link concurrently."""
    return await asyncio.gather(
        express.fetch_shell_links(user_id),
        express.create_general_link(user_id),
        return_exceptions=True,
    )


@celery_app.task(
    bind=True,
    name="app.tasks.ingest.ingest_commits",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    max_retries=2,
)
def ingest_commits(self, user_id: str, repo_names: list[str]) -> dict:
    """Fetch commits from Express API, fan out batch deliberation tasks."""
    errors = []

    weaviate_client.ensure_collection()
    weaviate_client.ensure_tenant(user_id)

    # Capture timestamp before fetching so we don't miss commits
    # pushed during processing.
    ingestion_timestamp = datetime.now(timezone.utc).isoformat()

    # --- Fetch all repos in parallel (single event loop) ---
    self.update_state(
        state="PROGRESS",
        meta={"step": "fetching", "repos_done": 0, "repos_total": len(repo_names)},
    )

    async def _fetch_all_repos():
        return await asyncio.gather(
            *[_fetch_repo(user_id, rn) for rn in repo_names],
            return_exceptions=True,
        )

    try:
        repo_results = asyncio.run(_fetch_all_repos())
    except Exception as e:
        logger.error(f"Parallel repo fetch failed: {e}")
        repo_results = [e for _ in repo_names]

    # Collect commits from all repos, applying token budget per repo
    subtasks = []
    for result in repo_results:
        if isinstance(result, Exception):
            errors.append({"error": str(result)})
            continue

        repo_name, commits, fetch_errors = result
        for err in fetch_errors:
            errors.append({"repo": repo_name, "error": err})

        if not commits:
            continue

        # Accurate token counting: batch all commit texts, count once
        commit_texts = [prepare_commit_text(c) for c in commits]
        token_counts = _count_tokens_batch(commit_texts)

        token_budget = settings.MAX_TOKENS_PER_REPO
        tokens_used = 0
        budget_commits = []
        for commit, token_count in zip(commits, token_counts):
            if tokens_used + token_count > token_budget:
                logger.warning(
                    f"Token budget exhausted for {repo_name}: "
                    f"{tokens_used} tokens used, skipping remaining commits"
                )
                break
            tokens_used += token_count
            budget_commits.append(commit)

        # Group commits into batches for deliberate_batch
        for i in range(0, len(budget_commits), BATCH_SIZE):
            batch = budget_commits[i : i + BATCH_SIZE]
            subtasks.append(deliberate_batch.s(user_id, repo_name, batch))

    if not subtasks:
        # Advance cursors even when no new commits
        asyncio.run(_update_cursors(user_id, repo_names, ingestion_timestamp))
        return {"status": "completed", "total_ingested": 0, "errors": errors}

    self.update_state(
        state="PROGRESS",
        meta={"step": "deliberating", "batches_total": len(subtasks)},
    )

    result = group(subtasks).apply_async()
    result.get(disable_sync_subtasks=False)

    total_ingested = 0
    for r in result.results:
        if r.successful():
            total_ingested += r.result.get("chunks_stored", 0)
        else:
            errors.append({"error": str(r.result)})

    self.update_state(state="PROGRESS", meta={"step": "finalizing"})

    # Advance cursors + post-processing in a single event loop
    async def _finalize():
        await _update_cursors(user_id, repo_names, ingestion_timestamp)
        return await _post_processing(user_id)

    try:
        shell_links_result, general_link_result = asyncio.run(_finalize())
    except Exception as e:
        logger.error(f"Finalize failed: {e}")
        shell_links_result, general_link_result = e, e

    if isinstance(shell_links_result, Exception):
        logger.error(f"Failed to fetch shell links: {shell_links_result}")
        errors.append({"shell_links": str(shell_links_result)})
    else:
        for link in shell_links_result:
            if link.get("jobUrl") and link.get("id"):
                create_matched.delay(user_id, link["jobUrl"], link["id"])
                logger.info(f"Queued create task for {link['jobUrl']}")

    if isinstance(general_link_result, Exception):
        logger.error(f"Failed to create/queue general link: {general_link_result}")
        errors.append({"general_link": str(general_link_result)})
    elif general_link_result and general_link_result.get("id"):
        create_general_link.delay(user_id, general_link_result["id"])
        logger.info(f"Queued general link creation for user {user_id}")

    return {
        "status": "completed",
        "total_ingested": total_ingested,
        "errors": errors,
    }

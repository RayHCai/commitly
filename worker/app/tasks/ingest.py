import asyncio
import logging

from app.services import express, weaviate_client
from app.services.pipeline import ingest_document, prepare_commit_text
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name="app.tasks.ingest.ingest_commits")
def ingest_commits(self, user_id: str, repo_names: list[str]) -> dict:
    """Fetch commits from Express API, embed each one, store in Weaviate."""
    total_ingested = 0
    errors = []

    weaviate_client.ensure_tenant(user_id)

    for repo_name in repo_names:
        try:
            commits = asyncio.run(
                express.fetch_commits(user_id, repo_name)
            )
        except Exception as e:
            logger.error(f"Failed to fetch commits for {repo_name}: {e}")
            errors.append({"repo": repo_name, "error": str(e)})
            continue

        for commit in commits:
            try:
                text = prepare_commit_text(commit)
                metadata = {
                    "sha": commit["sha"],
                    "repo_name": repo_name,
                    "message": commit.get("message", ""),
                    "diff": commit.get("diff", ""),
                    "author": commit.get("author", ""),
                }
                chunks_stored = ingest_document(text, metadata, user_id)
                total_ingested += chunks_stored
            except Exception as e:
                logger.error(
                    f"Failed to process commit {commit.get('sha', '?')}: {e}"
                )
                errors.append({
                    "repo": repo_name,
                    "sha": commit.get("sha", "?"),
                    "error": str(e),
                })

        self.update_state(
            state="PROGRESS",
            meta={"ingested": total_ingested, "current_repo": repo_name},
        )

    return {
        "status": "completed",
        "total_ingested": total_ingested,
        "errors": errors,
    }

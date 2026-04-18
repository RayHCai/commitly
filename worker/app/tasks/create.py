import json
import logging

from app.services import gemini, weaviate_client
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

SCORING_PROMPT = """You are analyzing a developer's commit history to find contributions most relevant to a job query.

For each commit provided, assess its relevance and produce a JSON array of objects with these fields:
- commit_sha: string
- repo_name: string
- message: string (the original commit message)
- relevance_score: float between 0.0 and 1.0
- summary: string (2-3 sentence summary of what the commit does and why it's relevant)
- technologies: list of strings (technologies/languages/frameworks evident in the commit)

Job query: {query}

Return ONLY valid JSON, no markdown fences or extra text."""


@celery_app.task(bind=True, name="app.tasks.create.create_matched")
def create_matched(self, user_id: str, query: str) -> dict:
    """Retrieve relevant commits via vector search, score with Gemini."""
    self.update_state(state="PROGRESS", meta={"step": "embedding_query"})
    query_vector = gemini.embed_text(query)

    self.update_state(state="PROGRESS", meta={"step": "searching_weaviate"})
    matches = weaviate_client.search_similar(query_vector, user_id, limit=20)

    if not matches:
        return {
            "user_id": user_id,
            "query": query,
            "contributions": [],
        }

    context = "\n\n---\n\n".join(
        f"SHA: {m['commit_sha']}\nRepo: {m['repo_name']}\n"
        f"Message: {m['message']}\nDiff:\n{m['diff'][:2000]}"
        for m in matches
    )

    self.update_state(state="PROGRESS", meta={"step": "scoring_with_gemini"})
    prompt = SCORING_PROMPT.format(query=query)
    raw_response = gemini.generate(prompt, context)

    try:
        contributions = json.loads(raw_response)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Gemini response: {raw_response[:500]}")
        contributions = []

    contributions.sort(key=lambda c: c.get("relevance_score", 0), reverse=True)

    return {
        "user_id": user_id,
        "query": query,
        "contributions": contributions,
    }

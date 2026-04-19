import json
import logging

import httpx

from app.config import settings
from app.services import gemini, scraper
from app.services.scraper import ScrapeError
from app.services.weaviate_client import search_top_commits
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

EXTRACT_JOB_PROMPT = """You are extracting structured data from a job posting.

Return ONLY a valid JSON object with these exact keys:
{
  "company": "<company name>",
  "job_title": "<job title / role name>",
  "position_id": "<position/requisition ID if mentioned, otherwise null>",
  "requirements": [
    {
      "keyword": "<1-3 word label for the requirement>",
      "description": "<single sentence LLM description of what this requirement entails>"
    }
  ]
}

Rules:
- Return ONLY the JSON object, no markdown fences, no explanation.
- For company: use the official company name as it appears in the posting.
- For job_title: use the exact title from the posting (e.g. "Senior Backend Engineer").
- For position_id: extract any requisition/job ID if present, otherwise use null.
- For requirements: extract EVERY distinct requirement from the posting (both required and nice-to-have).
  - keyword must be 1-3 words that concisely name the skill or requirement (e.g. "React", "System Design", "CI/CD Pipelines").
  - description must be a single sentence explaining what the posting expects for that requirement.
  - Include technical skills, soft skills, experience level requirements, and domain knowledge.
  - Order from most important to least important."""


def _callback_to_api(link_id: str, user_id: str, payload: dict) -> None:
    """Send the extracted data (or error) back to the Express API."""
    try:
        response = httpx.patch(
            f"{settings.EXPRESS_API_URL}/links/{link_id}/complete",
            json={**payload, "userId": user_id},
            headers={
                "Content-Type": "application/json",
                "X-Service-Token": settings.SERVICE_TOKEN,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        logger.info(f"Callback to API succeeded for link {link_id}")
    except httpx.HTTPError as e:
        logger.error(f"Callback to API failed for link {link_id}: {e}")


def _create_requirements(
    link_id: str, user_id: str, requirements: list[dict]
) -> None:
    """Send matched requirements + commits to the Express API."""
    try:
        response = httpx.post(
            f"{settings.EXPRESS_API_URL}/requirements",
            json={
                "linkId": link_id,
                "userId": user_id,
                "requirements": requirements,
            },
            headers={
                "Content-Type": "application/json",
                "X-Service-Token": settings.SERVICE_TOKEN,
            },
            timeout=60.0,
        )
        response.raise_for_status()
        logger.info(
            f"Created {len(requirements)} requirements for link {link_id}"
        )
    except httpx.HTTPError as e:
        logger.error(f"Failed to create requirements for link {link_id}: {e}")


@celery_app.task(
    bind=True,
    name="app.tasks.create.create_matched",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=120,
    max_retries=2,
)
def create_matched(self, user_id: str, url: str, link_id: str) -> dict:
    """Scrape a job posting, extract requirements, and match commits per requirement."""

    # Step 1: Scrape the page
    self.update_state(state="PROGRESS", meta={"step": "scraping"})
    try:
        page_text = scraper.fetch_page(url)
    except ScrapeError as e:
        logger.error(f"Scrape failed for {url}: {e}")
        error_msg = str(e)
        _callback_to_api(link_id, user_id, {"error": error_msg})
        return {"user_id": user_id, "url": url, "link_id": link_id, "error": error_msg}

    # Step 2: Extract structured requirements via Gemini
    self.update_state(state="PROGRESS", meta={"step": "extracting"})
    raw_response = gemini.generate(EXTRACT_JOB_PROMPT, page_text)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        job_data = json.loads(cleaned)
    except (json.JSONDecodeError, IndexError) as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        error_msg = "Failed to extract structured job data"
        _callback_to_api(link_id, user_id, {"error": error_msg})
        return {"user_id": user_id, "url": url, "link_id": link_id, "error": error_msg}

    if not job_data.get("company") or not job_data.get("job_title"):
        error_msg = "Gemini response missing required fields (company, job_title)"
        _callback_to_api(link_id, user_id, {"error": error_msg})
        return {"user_id": user_id, "url": url, "link_id": link_id, "error": error_msg}

    requirements = job_data.get("requirements", [])
    if not requirements:
        error_msg = "No requirements extracted from job posting"
        _callback_to_api(link_id, user_id, {"error": error_msg})
        return {"user_id": user_id, "url": url, "link_id": link_id, "error": error_msg}

    # Step 3: Complete the link (company, job_title, position_id)
    _callback_to_api(link_id, user_id, {
        "company": job_data["company"],
        "job_title": job_data["job_title"],
        "position_id": job_data.get("position_id"),
    })

    # Step 4: For each requirement, embed and search for top 3 matching commits
    self.update_state(
        state="PROGRESS",
        meta={"step": "matching", "total_requirements": len(requirements)},
    )

    matched_requirements = []
    for i, req in enumerate(requirements):
        keyword = req.get("keyword", "")
        description = req.get("description", "")
        query_text = f"{keyword}: {description}"

        try:
            query_vector = gemini.embed_text(query_text)
            top_commits = search_top_commits(query_vector, user_id, top_k=3)
        except Exception as e:
            logger.error(f"Search failed for requirement '{keyword}': {e}")
            top_commits = []

        formatted_commits = []
        for c in top_commits:
            commit_url = f"https://github.com/{c['repo_name']}/commit/{c['commit_sha']}"
            formatted_commits.append({
                "commitSha": c["commit_sha"],
                "repoName": c["repo_name"],
                "url": commit_url,
                "message": c.get("message", ""),
                "diff": c.get("diff", ""),
                "tags": c.get("tags", []),
                "score": c.get("weighted_score", 0),
            })

        matched_requirements.append({
            "name": keyword,
            "description": description,
            "matchedCommits": formatted_commits,
        })

        self.update_state(
            state="PROGRESS",
            meta={
                "step": "matching",
                "current_requirement": i + 1,
                "total_requirements": len(requirements),
            },
        )

    # Step 5: Send requirements + matched commits to API
    if matched_requirements:
        _create_requirements(link_id, user_id, matched_requirements)

    return {
        "user_id": user_id,
        "url": url,
        "link_id": link_id,
        "job_data": {
            "company": job_data["company"],
            "job_title": job_data["job_title"],
            "position_id": job_data.get("position_id"),
        },
        "requirements_matched": len(matched_requirements),
    }

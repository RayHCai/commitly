import json
import logging

import httpx

from app.config import settings
from app.services import gemini, scraper
from app.services.scraper import ScrapeError
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

EXTRACT_JOB_PROMPT = """You are extracting structured data from a job posting.

Return ONLY a valid JSON object with these exact keys:
{
  "company": "<company name>",
  "job_title": "<job title / role name>",
  "position_id": "<position/requisition ID if mentioned, otherwise null>",
  "requirements_summary": "<1-2 paragraph summary of required qualifications, skills, and experience>",
  "nice_to_have_summary": "<1-2 paragraph summary of preferred/nice-to-have qualifications, or empty string if none>"
}

Rules:
- Return ONLY the JSON object, no markdown fences, no explanation.
- For company: use the official company name as it appears in the posting.
- For job_title: use the exact title from the posting (e.g. "Senior Backend Engineer").
- For position_id: extract any requisition/job ID if present, otherwise use null.
- For requirements_summary: focus on technical skills, experience level, and domain knowledge.
- For nice_to_have_summary: include preferred but not required qualifications."""


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


@celery_app.task(
    bind=True,
    name="app.tasks.create.create_matched",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=120,
    max_retries=2,
)
def create_matched(self, user_id: str, url: str, link_id: str) -> dict:
    """Scrape a job posting URL, extract structured data, and callback to API."""

    # Step 1: Scrape the page
    self.update_state(state="PROGRESS", meta={"step": "scraping"})
    try:
        page_text = scraper.fetch_page(url)
    except ScrapeError as e:
        logger.error(f"Scrape failed for {url}: {e}")
        error_msg = str(e)
        _callback_to_api(link_id, user_id, {"error": error_msg})
        return {"user_id": user_id, "url": url, "link_id": link_id, "error": error_msg}

    # Step 2: Extract structured data via Gemini
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

    # Step 3: Callback to API with structured data
    _callback_to_api(link_id, user_id, {
        "company": job_data["company"],
        "job_title": job_data["job_title"],
        "position_id": job_data.get("position_id"),
        "requirements_summary": job_data.get("requirements_summary", ""),
        "nice_to_have_summary": job_data.get("nice_to_have_summary", ""),
    })

    return {
        "user_id": user_id,
        "url": url,
        "link_id": link_id,
        "job_data": job_data,
    }

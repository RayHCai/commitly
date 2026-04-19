import asyncio
import json
import logging
from concurrent.futures import ThreadPoolExecutor

import httpx

from app.config import settings
from app.services import gemini, scraper
from app.services.scraper import ScrapeError
from app.services import express
from app.services.weaviate_client import search_top_commits_batch, fetch_top_complex_commits
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

COMMIT_SUMMARY_PROMPT = """Write exactly ONE sentence (max 25 words) explaining what this commit demonstrates that is relevant to the job requirement.
Start with a strong action verb (e.g. "Built", "Implemented", "Optimized", "Designed").
Return ONLY the sentence — no quotes, no extra text."""

GENERAL_COMMIT_SUMMARY_PROMPT = """Write exactly ONE sentence (max 25 words) describing what this commit accomplished technically.
Use the commit message and tags to understand the work done.
Start with a strong action verb (e.g. "Built", "Implemented", "Optimized", "Designed").
Return ONLY the sentence — no quotes, no extra text."""

EXTRACT_JOB_PROMPT = """You are extracting structured data from a job posting.

Return ONLY a valid JSON object with these exact keys:
{
  "company": "<company name>",
  "job_title": "<job title / role name>",
  "position_id": "<position/requisition ID if mentioned, otherwise null>",
  "requirements": [
    {
      "keyword": "<specific technology or framework name>",
      "description": "<single sentence describing how the posting expects this technology to be used>"
    }
  ]
}

Rules:
- Return ONLY the JSON object, no markdown fences, no explanation.
- For company: use the official company name as it appears in the posting.
- For job_title: use the exact title from the posting (e.g. "Senior Backend Engineer").
- For position_id: extract any requisition/job ID if present, otherwise use null.
- For requirements: extract ONLY concrete technologies and frameworks — things a developer installs, imports, or configures.

INCLUDE (specific, nameable technologies):
  - Programming languages: Python, TypeScript, Go, Rust, Java, C++
  - Frameworks & libraries: React, Next.js, FastAPI, Django, Spring Boot, GraphQL
  - Databases & data stores: PostgreSQL, MySQL, Redis, MongoDB, Elasticsearch, DynamoDB
  - Cloud platforms & services: AWS, GCP, Azure, S3, Lambda, Kubernetes, Docker
  - Infrastructure & tooling: Terraform, CI/CD, GitHub Actions, Kafka, gRPC, Nginx
  - ML/data tools: PyTorch, TensorFlow, Spark, dbt, Airflow

EXCLUDE (too vague to match against code):
  - Generic concepts: "software development", "backend development", "distributed systems"
  - Soft skills: communication, collaboration, problem-solving, leadership
  - Process/methodology: agile, scrum, code review, SDLC
  - Experience levels: "5+ years", "senior-level", "strong fundamentals"
  - Vague domain knowledge: "system design", "architecture", "scalability"

- keyword must be the exact technology/framework name (e.g. "React", "PostgreSQL", "Kubernetes", "PyTorch").
- description must be a single sentence describing what the posting expects for that specific technology.
- If a requirement is too vague to name a specific technology, omit it entirely.
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

    # Batch-embed all requirement queries in a single API call
    query_texts = [
        f"{req.get('keyword', '')}: {req.get('description', '')}"
        for req in requirements
    ]
    try:
        query_vectors = gemini.embed_texts(query_texts)
    except Exception as e:
        logger.error(f"Batch embedding failed for requirements: {e}")
        query_vectors = [None] * len(requirements)

    # Batch-search all vectors in a single Weaviate connection
    valid_indices = [i for i, v in enumerate(query_vectors) if v is not None]
    valid_vectors = [query_vectors[i] for i in valid_indices]
    valid_keywords = [requirements[i].get("keyword") for i in valid_indices]

    try:
        batch_results = search_top_commits_batch(
            valid_vectors, user_id, top_k=3, query_keywords=valid_keywords
        )
    except Exception as e:
        logger.error(f"Batch search failed: {e}")
        batch_results = [[] for _ in valid_indices]

    # Map batch results back to all requirements
    search_results: list[list[dict]] = [[] for _ in requirements]
    for idx, result in zip(valid_indices, batch_results):
        search_results[idx] = result

    # Step 4b: Generate 1-sentence AI summaries for every matched commit in parallel
    self.update_state(state="PROGRESS", meta={"step": "summarizing"})
    company = job_data["company"]
    job_title_str = job_data["job_title"]

    # Collect all (req_index, commit_index, req, commit) tuples
    summary_tasks = [
        (i, j, requirements[i], c)
        for i, commits in enumerate(search_results)
        for j, c in enumerate(commits)
    ]

    def _summarize(task):
        i, j, req, c = task
        context = (
            f"Job: {job_title_str} at {company}\n"
            f"Requirement: {req.get('keyword', '')} — {req.get('description', '')}\n"
            f"Commit message: {c.get('message', '')}\n"
            f"Diff:\n{c.get('diff', '')[:2500]}"
        )
        try:
            return (i, j), gemini.generate(COMMIT_SUMMARY_PROMPT, context)
        except Exception as e:
            logger.error(f"Failed to generate commit summary ({i},{j}): {e}")
            return (i, j), ""

    summaries: dict[tuple[int, int], str] = {}
    if summary_tasks:
        with ThreadPoolExecutor(max_workers=min(len(summary_tasks), 12)) as executor:
            for key, summary in executor.map(_summarize, summary_tasks):
                summaries[key] = summary

    matched_requirements = []
    for i, req in enumerate(requirements):
        keyword = req.get("keyword", "")
        description = req.get("description", "")
        top_commits = search_results[i]

        formatted_commits = []
        for j, c in enumerate(top_commits):
            commit_url = f"https://github.com/{c['repo_name']}/commit/{c['commit_sha']}"
            formatted_commits.append({
                "commitSha": c["commit_sha"],
                "repoName": c["repo_name"],
                "url": commit_url,
                "message": c.get("message", ""),
                "diff": c.get("diff", ""),
                "tags": c.get("tags", []),
                "score": c.get("weighted_score", 0),
                "summary": summaries.get((i, j), ""),
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


@celery_app.task(
    bind=True,
    name="app.tasks.create.create_general_link",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=120,
    max_retries=2,
)
def create_general_link(self, user_id: str, link_id: str) -> dict:
    """Fetch top 10 most complex commits and store as a general profile link."""

    self.update_state(state="PROGRESS", meta={"step": "fetching_top_commits"})

    top_commits = fetch_top_complex_commits(user_id, top_k=20)

    if not top_commits:
        logger.warning(f"No commits found for user {user_id}")
        return {"user_id": user_id, "link_id": link_id, "error": "No commits found"}

    # Generate 1-sentence summaries for each commit in parallel
    self.update_state(state="PROGRESS", meta={"step": "summarizing"})

    def _summarize_general(c):
        tags = ", ".join(c.get("tags", []))
        context = (
            f"Commit message: {c.get('message', '')}\n"
            f"Tags: {tags}"
        )
        try:
            return gemini.generate(GENERAL_COMMIT_SUMMARY_PROMPT, context)
        except Exception as e:
            logger.error(f"Failed to generate general commit summary: {e}")
            return ""

    with ThreadPoolExecutor(max_workers=min(len(top_commits), 10)) as executor:
        summaries = list(executor.map(_summarize_general, top_commits))

    # Format as a single requirement with top matched commits
    formatted_commits = []
    for c, summary in zip(top_commits, summaries):
        commit_url = (
            f"https://github.com/{c['repo_name']}/commit/{c['commit_sha']}"
        )
        formatted_commits.append({
            "commitSha": c["commit_sha"],
            "repoName": c["repo_name"],
            "url": commit_url,
            "message": c.get("message", ""),
            "diff": "",
            "tags": c.get("tags", []),
            "score": c.get("complexity_score", 0),
            "summary": summary,
        })

    requirement = {
        "name": "Best Commits",
        "description": "Most complex commits across all repositories",
        "matchedCommits": formatted_commits,
    }

    # Replace requirements + mark link complete in a single event loop
    async def _finalize_general():
        await express.replace_requirements(link_id, user_id, [requirement])
        await express.complete_general_link(link_id, user_id)

    asyncio.run(_finalize_general())

    logger.info(
        f"General link {link_id} created with {len(formatted_commits)} commits"
    )
    return {
        "user_id": user_id,
        "link_id": link_id,
        "commits_matched": len(formatted_commits),
    }

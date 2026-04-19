import json
import logging
import threading
from concurrent.futures import ThreadPoolExecutor

from app.services.gemini import generate
from app.services.pipeline import (
    chunk_text,
    embed_chunks,
    prepare_commit_text,
)
from app.services.weaviate_client import batch_upsert_commits
from app.services.solana import send_memo
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

BATCH_SIZE = 5

# ---------------------------------------------------------------------------
# Combined scoring prompt — one LLM call returns all three scores + tags
# ---------------------------------------------------------------------------

COMBINED_PROMPT = (
    "You are an expert code-review agent. Evaluate the following commit on "
    "three independent dimensions and extract technology tags.\n\n"
    "Return ONLY a valid JSON object with exactly this structure:\n"
    "{\n"
    '  "complexity": {\n'
    '    "score": <float 0.0-1.0>,\n'
    '    "reasoning": "<brief explanation, max 200 chars>"\n'
    "  },\n"
    '  "quality": {\n'
    '    "score": <float 0.0-1.0>,\n'
    '    "reasoning": "<brief explanation, max 200 chars>"\n'
    "  },\n"
    '  "summary": {\n'
    '    "score": <float 0.0-1.0>,\n'
    '    "reasoning": "<brief explanation, max 200 chars>"\n'
    "  },\n"
    '  "tags": ["<technology/framework/language tag>", ...]\n'
    "}\n\n"
    "Scoring guidelines:\n"
    "- complexity: lines changed, files touched, algorithmic difficulty, "
    "cognitive load. 0.0 = trivial, 1.0 = very complex.\n"
    "- quality: readability, best practices, test coverage signals, "
    "documentation. 0.0 = very poor, 1.0 = excellent.\n"
    "- summary: significance, project impact, engineering judgment. "
    "0.0 = trivial/boilerplate, 1.0 = highly significant.\n\n"
    "Tag rules:\n"
    "- tags must be lowercase strings identifying technologies, programming "
    "languages, frameworks, libraries, tools, design patterns, and methods "
    'visible in the commit (e.g. "react", "typescript", "docker", '
    '"rest-api", "unit-testing").\n'
    "- Include only tags clearly evidenced by the diff. Max 15 tags.\n\n"
    "Return ONLY the JSON object, no markdown fences, no extra text."
)

MAX_MEMO_BYTES = 900


def _parse_combined_response(raw: str) -> dict:
    """Parse the combined LLM JSON response into structured scores + tags."""
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        data = json.loads(cleaned)

        result = {}
        for dimension in ("complexity", "quality", "summary"):
            section = data.get(dimension, {})
            score = max(0.0, min(1.0, float(section.get("score", 0.0))))
            reasoning = str(section.get("reasoning", ""))
            result[dimension] = {"score": score, "reasoning": reasoning}

        raw_tags = data.get("tags", [])
        result["tags"] = [str(t).lower().strip() for t in raw_tags if isinstance(t, str)][:15]
        return result
    except (json.JSONDecodeError, ValueError, IndexError, KeyError) as e:
        logger.warning(f"Failed to parse combined response: {e}. Raw: {raw[:200]}")
        fallback = {"score": 0.0, "reasoning": "Parse error: could not extract score"}
        return {
            "complexity": fallback.copy(),
            "quality": fallback.copy(),
            "summary": fallback.copy(),
            "tags": [],
        }


def _run_combined_scoring(context: str) -> dict:
    """Run a single combined LLM call that returns all three scores + tags."""
    try:
        raw_response = generate(COMBINED_PROMPT, context)
        return _parse_combined_response(raw_response)
    except Exception as e:
        logger.error(f"Combined scoring LLM call failed: {e}")
        fallback = {"score": 0.0, "reasoning": f"LLM call failed: {e}"}
        return {
            "complexity": fallback.copy(),
            "quality": fallback.copy(),
            "summary": fallback.copy(),
            "tags": [],
        }


def _build_memo_payload(agent_name: str, score: float, reasoning: str, sha: str, repo_name: str) -> str:
    """Build compact JSON memo string, truncating reasoning if too large."""
    payload = {
        "agent": agent_name,
        "sha": sha,
        "repo": repo_name,
        "score": score,
        "reasoning": reasoning,
    }
    encoded = json.dumps(payload, separators=(",", ":"))

    if len(encoded.encode("utf-8")) > MAX_MEMO_BYTES:
        overshoot = len(encoded.encode("utf-8")) - MAX_MEMO_BYTES
        trimmed_len = max(10, len(reasoning) - overshoot - 3)
        payload["reasoning"] = reasoning[:trimmed_len] + "..."
        encoded = json.dumps(payload, separators=(",", ":"))

    return encoded


def _send_memos_background(scores: dict, sha: str, repo_name: str) -> None:
    """Send Solana memos for all three dimensions in background threads."""
    def _send_all():
        agent_names = {
            "complexity": "complexity_agent",
            "quality": "quality_agent",
            "summary": "summary_agent",
        }
        with ThreadPoolExecutor(max_workers=3) as executor:
            for dimension, agent_name in agent_names.items():
                section = scores[dimension]
                memo_payload = _build_memo_payload(
                    agent_name, section["score"], section["reasoning"], sha, repo_name
                )
                executor.submit(_send_single_memo, agent_name, memo_payload, sha)

    thread = threading.Thread(target=_send_all, daemon=True)
    thread.start()


def _send_single_memo(agent_name: str, memo_payload: str, sha: str) -> None:
    """Send a single memo, logging errors without raising."""
    try:
        sig = send_memo(memo_payload)
        logger.info(f"Solana memo sent for {agent_name} on {sha}: {sig}")
    except Exception as e:
        logger.error(f"Solana memo failed for {agent_name} on commit {sha}: {e}")


def _build_metadata(commit: dict, scores: dict, repo_name: str) -> dict:
    """Build metadata dict for a single commit."""
    return {
        "sha": commit["sha"],
        "repo_name": repo_name,
        "message": (
            commit.get("commit", {}).get("message", "")
            if isinstance(commit.get("commit"), dict)
            else commit.get("message", "")
        ),
        "diff": commit.get("diff", ""),
        "author": (
            commit.get("author", {}).get("login", "")
            if isinstance(commit.get("author"), dict)
            else str(commit.get("author") or "")
        ),
        "tags": scores["tags"],
        "quality_score": scores["quality"]["score"],
        "complexity_score": scores["complexity"]["score"],
        "summary_score": scores["summary"]["score"],
        "quality_reasoning": scores["quality"]["reasoning"],
        "complexity_reasoning": scores["complexity"]["reasoning"],
        "summary_reasoning": scores["summary"]["reasoning"],
    }


@celery_app.task(bind=True, name="app.tasks.deliberate.deliberate_batch")
def deliberate_batch(
    self, user_id: str, repo_name: str, commits: list[dict]
) -> dict:
    """Score a batch of commits with parallel LLM calls, then batch embed + store.

    Optimizations over per-commit tasks:
    - Parallel LLM scoring via ThreadPoolExecutor
    - Single batch embedding API call for all chunks
    - Single Weaviate connection for all inserts
    """
    contexts = [prepare_commit_text(c) for c in commits]

    # --- Step 1: Parallel LLM scoring ---
    with ThreadPoolExecutor(max_workers=min(len(commits), BATCH_SIZE)) as executor:
        score_futures = [
            executor.submit(_run_combined_scoring, ctx) for ctx in contexts
        ]
        all_scores = [f.result() for f in score_futures]

    # --- Step 2: Fire Solana memos in background (non-blocking) ---
    for commit, scores in zip(commits, all_scores):
        _send_memos_background(scores, commit["sha"], repo_name)

    # --- Step 3: Batch chunk + embed + store ---
    all_chunks_data = []
    all_chunk_texts = []

    for commit, context, scores in zip(commits, contexts, all_scores):
        metadata = _build_metadata(commit, scores, repo_name)
        chunks = chunk_text(context)
        for i, chunk in enumerate(chunks):
            all_chunk_texts.append(chunk)
            all_chunks_data.append({
                **metadata,
                "user_id": user_id,
                "chunk_index": i,
                "chunk_text": chunk,
            })

    # Single embedding API call for all chunks across all commits
    vectors = embed_chunks(all_chunk_texts)

    # Single Weaviate connection for all inserts
    chunks_stored = batch_upsert_commits(all_chunks_data, vectors)

    return {
        "commits_processed": len(commits),
        "chunks_stored": chunks_stored,
        "shas": [c["sha"] for c in commits],
        "all_tags": [s["tags"] for s in all_scores],
        "all_scores": [
            {
                "sha": c["sha"],
                "scores": [
                    {"agent": "complexity_agent", "score": s["complexity"]["score"]},
                    {"agent": "quality_agent", "score": s["quality"]["score"]},
                    {"agent": "summary_agent", "score": s["summary"]["score"]},
                ],
            }
            for c, s in zip(commits, all_scores)
        ],
    }


@celery_app.task(bind=True, name="app.tasks.deliberate.deliberate_commit")
def deliberate_commit(
    self, user_id: str, repo_name: str, commit: dict
) -> dict:
    """Score a single commit. Delegates to deliberate_batch for consistency."""
    result = deliberate_batch(user_id, repo_name, [commit])
    # Reshape to match legacy per-commit return format
    scores = result["all_scores"][0] if result["all_scores"] else {}
    tags = result["all_tags"][0] if result["all_tags"] else []
    return {
        "sha": commit["sha"],
        "repo_name": repo_name,
        "chunks_stored": result["chunks_stored"],
        "tags": tags,
        "scores": scores.get("scores", []),
    }

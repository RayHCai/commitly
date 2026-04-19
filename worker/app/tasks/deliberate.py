import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from app.services.gemini import generate
from app.services.pipeline import ingest_document, prepare_commit_text
from app.services.solana import send_memo
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Scoring agents — each runs as an independent parallel LLM call
# ---------------------------------------------------------------------------

_TAGS_INSTRUCTION = (
    '  "tags": ["<technology/framework/language/method tag>", ...]\n'
)
_TAGS_RULES = (
    "- tags must be a list of lowercase strings identifying technologies, "
    "programming languages, frameworks, libraries, tools, design patterns, "
    "and methods visible in the commit (e.g. \"react\", \"typescript\", "
    "\"docker\", \"rest-api\", \"unit-testing\"). "
    "Include only tags clearly evidenced by the diff. Max 15 tags.\n"
)

AGENTS = [
    {
        "name": "quality_agent",
        "prompt": (
            "You are a code-quality scoring agent.\n"
            "Evaluate the following commit for code quality: readability, "
            "adherence to best practices, test coverage signals, and "
            "documentation.\n"
            "Also extract technology tags from the commit.\n\n"
            "Return ONLY a valid JSON object with exactly these keys:\n"
            '{\n  "score": <float between 0.0 and 1.0>,\n'
            '  "reasoning": "<brief explanation>",\n'
            + _TAGS_INSTRUCTION
            + "}\n\n"
            "Rules:\n"
            "- score must be a float from 0.0 (very poor) to 1.0 (excellent).\n"
            "- reasoning must be a single string, max 200 characters.\n"
            + _TAGS_RULES
            + "- Return ONLY the JSON object, no markdown fences, no extra text."
        ),
    },
    {
        "name": "complexity_agent",
        "prompt": (
            "You are a commit-complexity scoring agent.\n"
            "Evaluate the following commit for complexity: lines changed, "
            "number of files touched, algorithmic difficulty, and cognitive "
            "load required to review.\n"
            "Also extract technology tags from the commit.\n\n"
            "Return ONLY a valid JSON object with exactly these keys:\n"
            '{\n  "score": <float between 0.0 and 1.0>,\n'
            '  "reasoning": "<brief explanation>",\n'
            + _TAGS_INSTRUCTION
            + "}\n\n"
            "Rules:\n"
            "- score must be a float from 0.0 (trivial) to 1.0 (very complex).\n"
            "- reasoning must be a single string, max 200 characters.\n"
            + _TAGS_RULES
            + "- Return ONLY the JSON object, no markdown fences, no extra text."
        ),
    },
]

MAX_MEMO_BYTES = 900


def _parse_agent_response(raw: str) -> dict:
    """Parse LLM JSON response into {score, reasoning, tags} with fallback."""
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        data = json.loads(cleaned)
        score = max(0.0, min(1.0, float(data.get("score", 0.0))))
        reasoning = str(data.get("reasoning", ""))
        raw_tags = data.get("tags", [])
        tags = [str(t).lower().strip() for t in raw_tags if isinstance(t, str)][:15]
        return {"score": score, "reasoning": reasoning, "tags": tags}
    except (json.JSONDecodeError, ValueError, IndexError, KeyError) as e:
        logger.warning(f"Failed to parse agent response: {e}. Raw: {raw[:200]}")
        return {"score": 0.0, "reasoning": "Parse error: could not extract score", "tags": []}


def _run_agent(agent: dict, context: str) -> dict:
    """Run a single scoring agent via the Gemini LLM."""
    agent_name = agent["name"]
    try:
        raw_response = generate(agent["prompt"], context)
        parsed = _parse_agent_response(raw_response)
    except Exception as e:
        logger.error(f"Agent {agent_name} LLM call failed: {e}")
        parsed = {"score": 0.0, "reasoning": f"LLM call failed: {e}", "tags": []}

    return {
        "agent_name": agent_name,
        "score": parsed["score"],
        "reasoning": parsed["reasoning"],
        "tags": parsed["tags"],
    }


def _build_memo_payload(agent_result: dict, sha: str, repo_name: str) -> str:
    """Build compact JSON memo string, truncating reasoning if too large."""
    payload = {
        "agent": agent_result["agent_name"],
        "sha": sha,
        "repo": repo_name,
        "score": agent_result["score"],
        "reasoning": agent_result["reasoning"],
    }
    encoded = json.dumps(payload, separators=(",", ":"))

    if len(encoded.encode("utf-8")) > MAX_MEMO_BYTES:
        overshoot = len(encoded.encode("utf-8")) - MAX_MEMO_BYTES
        trimmed_len = max(10, len(agent_result["reasoning"]) - overshoot - 3)
        payload["reasoning"] = agent_result["reasoning"][:trimmed_len] + "..."
        encoded = json.dumps(payload, separators=(",", ":"))

    return encoded


@celery_app.task(bind=True, name="app.tasks.deliberate.deliberate_commit")
def deliberate_commit(
    self, user_id: str, repo_name: str, commit: dict
) -> dict:
    """Score a single commit with 2 parallel agents, write memos, then ingest."""

    sha = commit["sha"]
    context = prepare_commit_text(commit)

    # --- Step 1: Run 2 scoring agents in parallel ---
    agent_results = []
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = {
            executor.submit(_run_agent, agent, context): agent["name"]
            for agent in AGENTS
        }
        for future in as_completed(futures):
            agent_name = futures[future]
            try:
                result = future.result()
                agent_results.append(result)
            except Exception as e:
                logger.error(f"Agent {agent_name} unexpected error: {e}")
                agent_results.append({
                    "agent_name": agent_name,
                    "score": 0.0,
                    "reasoning": f"Unexpected error: {e}",
                    "tags": [],
                })

    # --- Step 2: Write each agent result as a Solana devnet memo ---
    tx_signatures = []
    for agent_result in agent_results:
        memo_payload = _build_memo_payload(agent_result, sha, repo_name)
        try:
            sig = send_memo(memo_payload)
            tx_signatures.append({
                "agent": agent_result["agent_name"],
                "signature": sig,
            })
        except Exception as e:
            logger.error(
                f"Solana memo failed for {agent_result['agent_name']} "
                f"on commit {sha}: {e}"
            )
            tx_signatures.append({
                "agent": agent_result["agent_name"],
                "signature": None,
                "error": str(e),
            })

    # --- Step 3: Combine tags from all agents into a deduplicated set ---
    combined_tags = sorted({tag for r in agent_results for tag in r["tags"]})

    # --- Step 4: Persist to vector store with scores as properties ---
    scores_by_agent = {r["agent_name"]: r for r in agent_results}
    metadata = {
        "sha": sha,
        "repo_name": repo_name,
        "message": commit.get("message", ""),
        "diff": commit.get("diff", ""),
        "author": commit.get("author", ""),
        "tags": combined_tags,
        "quality_score": scores_by_agent.get("quality_agent", {}).get("score", 0.0),
        "complexity_score": scores_by_agent.get("complexity_agent", {}).get("score", 0.0),
        "quality_reasoning": scores_by_agent.get("quality_agent", {}).get("reasoning", ""),
        "complexity_reasoning": scores_by_agent.get("complexity_agent", {}).get("reasoning", ""),
    }
    chunks_stored = ingest_document(context, metadata, user_id)

    return {
        "sha": sha,
        "repo_name": repo_name,
        "chunks_stored": chunks_stored,
        "tags": combined_tags,
        "scores": [
            {"agent": r["agent_name"], "score": r["score"]}
            for r in agent_results
        ],
        "transactions": tx_signatures,
    }

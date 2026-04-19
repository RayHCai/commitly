import logging
from concurrent.futures import ThreadPoolExecutor

from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


_retry = retry(
    stop=stop_after_attempt(4),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception_type(Exception),
    before_sleep=lambda rs: logger.warning(
        f"Gemini API call failed (attempt {rs.attempt_number}), retrying: {rs.outcome.exception()}"
    ),
    reraise=True,
)


@_retry
def embed_text(text: str) -> list[float]:
    """Generate an embedding vector for the given text."""
    response = _get_client().models.embed_content(
        model=settings.EMBEDDING_MODEL,
        contents=text,
    )
    return response.embeddings[0].values


_EMBED_BATCH_LIMIT = 100


@_retry
def _embed_batch(texts: list[str]) -> list[list[float]]:
    response = _get_client().models.embed_content(
        model=settings.EMBEDDING_MODEL,
        contents=texts,
    )
    return [e.values for e in response.embeddings]


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch-embed multiple texts, chunking into ≤100-item batches in parallel."""
    batches = [texts[i : i + _EMBED_BATCH_LIMIT] for i in range(0, len(texts), _EMBED_BATCH_LIMIT)]
    with ThreadPoolExecutor(max_workers=len(batches)) as executor:
        results = list(executor.map(_embed_batch, batches))
    return [v for batch in results for v in batch]


@_retry
def count_tokens(text: str) -> int:
    """Count the number of tokens in the given text."""
    response = _get_client().models.count_tokens(
        model=settings.GENERATION_MODEL,
        contents=text,
    )
    return response.total_tokens


@_retry
def generate(prompt: str, context: str) -> str:
    """Generate text using Gemini Flash given a prompt and context."""
    full_prompt = (
        f"Context:\n{context}\n\n"
        f"Instructions:\n{prompt}"
    )
    response = _get_client().models.generate_content(
        model=settings.GENERATION_MODEL,
        contents=full_prompt,
        config={},
    )
    return response.text

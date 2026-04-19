import logging

from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

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
    response = client.models.embed_content(
        model=settings.EMBEDDING_MODEL,
        contents=text,
    )
    return response.embeddings[0].values


@_retry
def count_tokens(text: str) -> int:
    """Count the number of tokens in the given text."""
    response = client.models.count_tokens(
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
    response = client.models.generate_content(
        model=settings.GENERATION_MODEL,
        contents=full_prompt,
    )
    return response.text

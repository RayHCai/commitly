from google import genai

from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def embed_text(text: str) -> list[float]:
    """Generate an embedding vector for the given text."""
    response = client.models.embed_content(
        model=settings.EMBEDDING_MODEL,
        contents=text,
    )
    return response.embeddings[0].values


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

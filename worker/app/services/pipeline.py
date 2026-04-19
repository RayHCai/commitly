import logging

from app.services import gemini, weaviate_client

logger = logging.getLogger(__name__)


def chunk_text(
    text: str, chunk_size: int = 1000, overlap: int = 200
) -> list[str]:
    """Split text into overlapping chunks, breaking at newlines when possible."""
    if not text or len(text) <= chunk_size:
        return [text] if text else []

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size

        if end >= len(text):
            chunks.append(text[start:])
            break

        # Try to break at a newline within the last 20% of the chunk
        search_start = end - chunk_size // 5
        newline_pos = text.rfind("\n", search_start, end)
        if newline_pos != -1:
            end = newline_pos + 1

        chunks.append(text[start:end])
        start = end - overlap

    return chunks


def embed_chunks(chunks: list[str]) -> list[list[float]]:
    """Generate embedding vectors for a list of text chunks."""
    return [gemini.embed_text(chunk) for chunk in chunks]


_SKIP_EXTENSIONS = {".md", ".markdown", ".txt", ".text", ".rst"}


def _strip_deletions(diff: str) -> str:
    """Remove deletion lines and skip markdown/text file sections from a unified diff."""
    lines = diff.splitlines()
    result = []
    skip_file = False

    for line in lines:
        if line.startswith("diff --git"):
            # Extract filename from 'diff --git a/path b/path'
            parts = line.rsplit(" b/", 1)
            filename = parts[1] if len(parts) == 2 else ""
            skip_file = any(filename.endswith(ext) for ext in _SKIP_EXTENSIONS)
            if skip_file:
                continue

        if skip_file:
            continue

        if not line.startswith("-") or line.startswith("---"):
            result.append(line)

    return "\n".join(result)


def prepare_commit_text(commit: dict) -> str:
    """Format a commit dict into a single string for embedding."""
    message = commit.get("message", "")
    diff = _strip_deletions(commit.get("diff", ""))
    return f"{message}\n\n{diff}"


def ingest_document(
    text: str, metadata: dict, user_id: str
) -> int:
    """Chunk text, embed each chunk, and store in Weaviate.

    Args:
        text: The full document text to ingest.
        metadata: Fields to store alongside each chunk
                  (e.g. sha, repo_name, message, diff, author).
        user_id: Weaviate tenant identifier.

    Returns:
        Number of chunks stored.
    """
    chunks = chunk_text(text)
    if not chunks:
        return 0

    vectors = embed_chunks(chunks)

    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        chunk_data = {
            **metadata,
            "user_id": user_id,
            "chunk_index": i,
            "chunk_text": chunk,
        }
        weaviate_client.upsert_commit(chunk_data, vector)

    return len(chunks)

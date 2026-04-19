import httpx


JINA_READER_PREFIX = "https://r.jina.ai/"


class ScrapeError(Exception):
    pass


def fetch_page(url: str) -> str:
    """Fetch a URL via Jina Reader and return the extracted text."""
    try:
        response = httpx.get(
            f"{JINA_READER_PREFIX}{url}",
            headers={"Accept": "text/plain"},
            timeout=30.0,
            follow_redirects=True,
        )
        response.raise_for_status()
    except httpx.HTTPError as e:
        raise ScrapeError(f"HTTP error fetching {url}: {e}") from e

    text = response.text.strip()
    if not text:
        raise ScrapeError(f"No content extracted from {url}")

    return text

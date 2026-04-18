import httpx
import trafilatura


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


class ScrapeError(Exception):
    pass


def fetch_page(url: str) -> str:
    """Fetch a URL and return the extracted main-content text."""
    try:
        response = httpx.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=10.0,
            follow_redirects=True,
        )
        response.raise_for_status()
    except httpx.HTTPError as e:
        raise ScrapeError(f"HTTP error fetching {url}: {e}") from e

    html = response.text
    if not html:
        raise ScrapeError(f"Empty response body from {url}")

    text = trafilatura.extract(html) or ""
    if not text.strip():
        raise ScrapeError(f"No main content extracted from {url}")

    return text

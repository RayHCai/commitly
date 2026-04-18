"""
Scrape a job posting URL and print an LLM-generated summary.

Usage:
    python -m scripts.scrape_test <url>
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services import gemini, scraper
from app.services.scraper import ScrapeError


SCRAPE_PROMPT = """You are summarizing a job posting for a developer-job-matching system.

Produce a dense 1-3 paragraph summary that captures:
- the role and seniority
- core technical requirements (languages, frameworks, tools)
- main responsibilities
- any domain or product context

Write in natural prose. No bullet lists, no markdown, no headings. The output will be used as a retrieval query against a developer's contribution history, so prioritize concrete technical signals over generic phrasing."""


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python -m scripts.scrape_test <url>", file=sys.stderr)
        return 2

    url = sys.argv[1]

    try:
        text = scraper.fetch_page(url)
    except ScrapeError as e:
        print(f"Scrape failed: {e}", file=sys.stderr)
        return 1

    summary = gemini.generate(SCRAPE_PROMPT, text)
    print(summary)
    return 0


if __name__ == "__main__":
    sys.exit(main())

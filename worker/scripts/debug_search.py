#!/usr/bin/env python3
"""Debug matching by running a test search and printing actual distances."""

import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.services import gemini
from app.services.weaviate_client import search_similar
from app.config import settings

USER_ID = "cmo5ybrb20001ythsk3gb0rzq"  # from check_vectors output

TEST_QUERIES = [
    "Python: backend development with Python",
    "React: frontend development with React",
    "TypeScript: building applications with TypeScript",
    "PostgreSQL: database queries and schema design",
    "Docker: containerization and deployment",
]


def main():
    print(f"Embedding model: {settings.EMBEDDING_MODEL}")
    print(f"User/tenant: {USER_ID}\n")

    for query in TEST_QUERIES:
        print(f"Query: '{query}'")
        try:
            vec = gemini.embed_text(query)
            print(f"  Embedded OK (dim={len(vec)})")

            # search_similar has no distance threshold — returns raw results
            results = search_similar(vec, USER_ID, limit=5)
            if not results:
                print("  ❌ No results at all (0 objects returned)")
            else:
                print(f"  Found {len(results)} results:")
                for r in results:
                    print(f"    dist={r['distance']:.4f}  sha={r['commit_sha'][:12]}  msg={r['message'][:60]!r}")
        except Exception as e:
            print(f"  ERROR: {e}")
        print()


if __name__ == "__main__":
    main()

"""
Initialize the Weaviate Commit collection with multi-tenancy enabled.

Usage:
    python -m scripts.weaviate_init [--force]

Options:
    --force    Drop and recreate the collection if it already exists.
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import weaviate
from weaviate.classes.config import Configure, DataType, Property

from app.config import settings
from app.services.weaviate_client import COLLECTION_NAME, get_client


def create_collection(client: weaviate.WeaviateClient) -> None:
    client.collections.create(
        name=COLLECTION_NAME,
        multi_tenancy_config=Configure.multi_tenancy(
            enabled=True,
            auto_tenant_creation=True,
            auto_tenant_activation=True,
        ),
        properties=[
            Property(name="commit_sha", data_type=DataType.TEXT),
            Property(name="repo_name", data_type=DataType.TEXT),
            Property(name="message", data_type=DataType.TEXT),
            Property(name="diff", data_type=DataType.TEXT),
            Property(name="author", data_type=DataType.TEXT),
            Property(name="chunk_index", data_type=DataType.INT),
            Property(name="chunk_text", data_type=DataType.TEXT),
            Property(name="tags", data_type=DataType.TEXT_ARRAY),
            Property(name="quality_score", data_type=DataType.NUMBER),
            Property(name="complexity_score", data_type=DataType.NUMBER),
            Property(name="quality_reasoning", data_type=DataType.TEXT),
            Property(name="complexity_reasoning", data_type=DataType.TEXT),
        ],
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize Weaviate Commit collection")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Drop and recreate the collection if it already exists",
    )
    args = parser.parse_args()

    client = get_client()
    try:
        exists = client.collections.exists(COLLECTION_NAME)

        if exists and args.force:
            print(f"Dropping existing '{COLLECTION_NAME}' collection...")
            client.collections.delete(COLLECTION_NAME)
            exists = False

        if exists:
            print(f"Collection '{COLLECTION_NAME}' already exists. Use --force to recreate.")
            return

        print(f"Creating '{COLLECTION_NAME}' collection (multi-tenant)...")
        create_collection(client)
        print("Done.")
    finally:
        client.close()


if __name__ == "__main__":
    main()

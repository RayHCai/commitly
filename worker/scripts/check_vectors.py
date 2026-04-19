#!/usr/bin/env python3
"""Check the dimension of stored vectors in Weaviate to detect embedding model mismatch."""

import sys
from pathlib import Path

project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import weaviate
from weaviate.auth import AuthApiKey
from app.config import settings

COLLECTION_NAME = "Commit"


def main():
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=settings.WEAVIATE_CLOUD_URL,
        auth_credentials=AuthApiKey(api_key=settings.WEAVIATE_API_KEY),
    )
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenants = collection.tenants.get()
        tenant_names = list(tenants.keys())
        print(f"Found {len(tenant_names)} tenant(s): {tenant_names[:5]}{'...' if len(tenant_names) > 5 else ''}")

        if not tenant_names:
            print("No tenants found.")
            return

        # Check first tenant
        tenant_id = tenant_names[0]
        print(f"\nChecking tenant: {tenant_id}")

        tenant_col = collection.with_tenant(tenant_id)
        result = tenant_col.query.fetch_objects(limit=1, include_vector=True)

        if not result.objects:
            print("No objects found in this tenant.")
            return

        obj = result.objects[0]
        vector = obj.vector

        # vector may be a dict (named vectors) or a list
        if isinstance(vector, dict):
            for name, vec in vector.items():
                print(f"  Named vector '{name}': dim={len(vec)}")
        elif isinstance(vector, list):
            print(f"  Vector dimension: {len(vector)}")
            if len(vector) == 768:
                print("  ❌ OLD model: text-embedding-004 (768-dim) — MISMATCH with gemini-embedding-001 (3072-dim)")
            elif len(vector) == 3072:
                print("  ✅ NEW model: gemini-embedding-001 (3072-dim) — correct")
            else:
                print(f"  ⚠️  Unknown dimension: {len(vector)}")
        else:
            print(f"  Vector type: {type(vector)}, value: {vector}")

        print(f"\n  Sample object SHA: {obj.properties.get('commit_sha', 'N/A')}")
        print(f"  Repo: {obj.properties.get('repo_name', 'N/A')}")

    finally:
        client.close()


if __name__ == "__main__":
    main()

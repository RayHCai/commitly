import logging
import uuid as uuid_lib

import weaviate
from weaviate.auth import AuthApiKey
from weaviate.classes.config import DataType, Property
from weaviate.classes.tenants import Tenant, TenantActivityStatus
from weaviate.exceptions import UnexpectedStatusCodeError

from app.config import settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "Commit"


def get_client() -> weaviate.WeaviateClient:
    return weaviate.connect_to_weaviate_cloud(
        cluster_url=settings.WEAVIATE_CLOUD_URL,
        auth_credentials=AuthApiKey(api_key=settings.WEAVIATE_API_KEY),
    )


def ensure_collection() -> None:
    """Create the Commit collection with multi-tenancy if it doesn't exist."""
    client = get_client()
    try:
        if not client.collections.exists(COLLECTION_NAME):
            client.collections.create(
                name=COLLECTION_NAME,
                multi_tenancy_config=weaviate.classes.config.Configure.multi_tenancy(
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
    finally:
        client.close()


def ensure_tenant(user_id: str) -> None:
    """Create a tenant for the user if it doesn't already exist."""
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        existing = collection.tenants.get()
        if user_id not in existing:
            collection.tenants.create([Tenant(name=user_id)])
    finally:
        client.close()


def _commit_uuid(sha: str, chunk_index: int) -> str:
    """Generate a deterministic UUID from commit sha and chunk index."""
    return str(uuid_lib.uuid5(uuid_lib.NAMESPACE_DNS, f"{sha}:{chunk_index}"))


def upsert_commit(commit_data: dict, vector: list[float]) -> None:
    """Store a commit chunk with its embedding vector in the user's tenant.

    Uses a deterministic UUID based on sha:chunk_index so that
    re-ingesting the same commit is idempotent (duplicates are skipped).
    """
    sha = commit_data["sha"]
    chunk_index = commit_data.get("chunk_index", 0)
    deterministic_uuid = _commit_uuid(sha, chunk_index)

    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenant_collection = collection.with_tenant(commit_data["user_id"])
        try:
            tenant_collection.data.insert(
                properties={
                    "commit_sha": sha,
                    "repo_name": commit_data["repo_name"],
                    "message": commit_data["message"],
                    "diff": commit_data.get("diff", ""),
                    "author": commit_data.get("author", ""),
                    "chunk_index": chunk_index,
                    "chunk_text": commit_data.get("chunk_text", ""),
                    "tags": commit_data.get("tags", []),
                    "quality_score": commit_data.get("quality_score", 0.0),
                    "complexity_score": commit_data.get("complexity_score", 0.0),
                    "quality_reasoning": commit_data.get("quality_reasoning", ""),
                    "complexity_reasoning": commit_data.get("complexity_reasoning", ""),
                },
                vector=vector,
                uuid=deterministic_uuid,
            )
        except UnexpectedStatusCodeError:
            logger.debug(f"Chunk {sha}:{chunk_index} already exists, skipping")
    finally:
        client.close()


def search_similar(
    query_vector: list[float], user_id: str, limit: int = 10
) -> list[dict]:
    """Search for commits similar to the query vector within the user's tenant."""
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenant_collection = collection.with_tenant(user_id)
        results = tenant_collection.query.near_vector(
            near_vector=query_vector,
            limit=limit,
            return_metadata=["distance"],
        )
        return [
            {
                "commit_sha": obj.properties["commit_sha"],
                "repo_name": obj.properties["repo_name"],
                "message": obj.properties["message"],
                "diff": obj.properties["diff"],
                "author": obj.properties["author"],
                "chunk_text": obj.properties.get("chunk_text", ""),
                "tags": obj.properties.get("tags", []),
                "quality_score": obj.properties.get("quality_score", 0.0),
                "complexity_score": obj.properties.get("complexity_score", 0.0),
                "quality_reasoning": obj.properties.get("quality_reasoning", ""),
                "complexity_reasoning": obj.properties.get("complexity_reasoning", ""),
                "distance": obj.metadata.distance,
            }
            for obj in results.objects
        ]
    finally:
        client.close()


def search_top_commits(
    query_vector: list[float],
    user_id: str,
    top_k: int = 3,
    complexity_weight: float = 0.65,
    quality_weight: float = 0.35,
    candidate_limit: int = 20,
) -> list[dict]:
    """Search for the top commits by weighted score (complexity > quality).

    Fetches `candidate_limit` similar chunks, deduplicates by commit SHA,
    ranks by weighted combination of complexity and quality scores,
    and returns the top `top_k` unique commits.
    """
    candidates = search_similar(query_vector, user_id, limit=candidate_limit)

    # Deduplicate by commit_sha, keeping the closest chunk per commit
    seen: dict[str, dict] = {}
    for c in candidates:
        sha = c["commit_sha"]
        if sha not in seen or c["distance"] < seen[sha]["distance"]:
            seen[sha] = c

    # Compute weighted rank from stored scores
    scored = []
    for commit in seen.values():
        quality = commit.get("quality_score", 0.0)
        complexity = commit.get("complexity_score", 0.0)
        weighted = complexity_weight * complexity + quality_weight * quality
        scored.append({
            "commit_sha": commit["commit_sha"],
            "repo_name": commit["repo_name"],
            "message": commit["message"],
            "diff": commit.get("diff", ""),
            "author": commit["author"],
            "tags": commit["tags"],
            "quality_score": quality,
            "complexity_score": complexity,
            "weighted_score": round(weighted, 4),
            "distance": commit["distance"],
        })

    # Sort by weighted score descending, break ties with lower distance
    scored.sort(key=lambda x: (-x["weighted_score"], x["distance"]))
    return scored[:top_k]

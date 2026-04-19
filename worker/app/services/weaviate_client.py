import logging
import uuid as uuid_lib

import weaviate
from weaviate.auth import AuthApiKey
from weaviate.classes.config import DataType, Property
from weaviate.classes.query import MetadataQuery, Sort
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
                    Property(name="summary_score", data_type=DataType.NUMBER),
                    Property(name="quality_reasoning", data_type=DataType.TEXT),
                    Property(name="complexity_reasoning", data_type=DataType.TEXT),
                    Property(name="summary_reasoning", data_type=DataType.TEXT),
                ],
            )
    finally:
        client.close()


def ensure_tenant(user_id: str) -> None:
    """Create a tenant for the user, or reactivate it if it exists but is inactive."""
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        existing = collection.tenants.get()
        if user_id not in existing:
            collection.tenants.create([
                Tenant(name=user_id, activity_status=TenantActivityStatus.ACTIVE)
            ])
            logger.info(f"Created tenant {user_id}")
        elif existing[user_id].activity_status != TenantActivityStatus.ACTIVE:
            collection.tenants.update([
                Tenant(name=user_id, activity_status=TenantActivityStatus.ACTIVE)
            ])
            logger.info(f"Reactivated tenant {user_id}")
    finally:
        client.close()


def _commit_uuid(sha: str, chunk_index: int) -> str:
    """Generate a deterministic UUID from commit sha and chunk index."""
    return str(uuid_lib.uuid5(uuid_lib.NAMESPACE_DNS, f"{sha}:{chunk_index}"))


def upsert_commit(commit_data: dict, vector: list[float]) -> bool:
    """Store a commit chunk with its embedding vector in the user's tenant.

    Uses a deterministic UUID based on sha:chunk_index so that
    re-ingesting the same commit is idempotent (duplicates are skipped).

    Returns True if the chunk was stored (or already existed), False on failure.
    """
    sha = commit_data["sha"]
    chunk_index = commit_data.get("chunk_index", 0)
    deterministic_uuid = _commit_uuid(sha, chunk_index)

    logger.info(f"Upserting chunk {sha}:{chunk_index} for tenant {commit_data['user_id']} (vector dim={len(vector)})")
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenant_collection = collection.with_tenant(commit_data["user_id"])
        try:
            tenant_collection.data.insert(
                properties={
                    "commit_sha": sha,
                    "repo_name": commit_data["repo_name"],
                    "message": commit_data.get("message", ""),
                    "diff": commit_data.get("diff", ""),
                    "author": str(commit_data.get("author") or ""),
                    "chunk_index": chunk_index,
                    "chunk_text": commit_data.get("chunk_text", ""),
                    "tags": commit_data.get("tags", []),
                    "quality_score": commit_data.get("quality_score", 0.0),
                    "complexity_score": commit_data.get("complexity_score", 0.0),
                    "summary_score": commit_data.get("summary_score", 0.0),
                    "quality_reasoning": commit_data.get("quality_reasoning", ""),
                    "complexity_reasoning": commit_data.get("complexity_reasoning", ""),
                    "summary_reasoning": commit_data.get("summary_reasoning", ""),
                },
                vector=vector,
                uuid=deterministic_uuid,
            )
            logger.info(f"Successfully stored chunk {sha}:{chunk_index}")
            return True
        except UnexpectedStatusCodeError as e:
            if "already exists" in str(e).lower() or "422" in str(e):
                logger.debug(f"Chunk {sha}:{chunk_index} already exists, skipping")
                return True
            else:
                logger.error(f"Weaviate insert failed for {sha}:{chunk_index}: {e}")
                raise
        except Exception as e:
            logger.error(f"Unexpected error inserting {sha}:{chunk_index}: {type(e).__name__}: {e}")
            raise
    finally:
        client.close()


def batch_upsert_commits(
    chunks_data: list[dict], vectors: list[list[float]]
) -> int:
    """Batch-insert multiple commit chunks in a single connection.

    Returns the number of chunks successfully stored.
    """
    if not chunks_data:
        return 0

    user_id = chunks_data[0]["user_id"]
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenant_collection = collection.with_tenant(user_id)

        with tenant_collection.batch.fixed_size(batch_size=len(chunks_data)) as batch:
            for chunk_data, vector in zip(chunks_data, vectors):
                sha = chunk_data["sha"]
                chunk_index = chunk_data.get("chunk_index", 0)
                deterministic_uuid = _commit_uuid(sha, chunk_index)
                batch.add_object(
                    properties={
                        "commit_sha": sha,
                        "repo_name": chunk_data["repo_name"],
                        "message": chunk_data.get("message", ""),
                        "diff": chunk_data.get("diff", ""),
                        "author": str(chunk_data.get("author") or ""),
                        "chunk_index": chunk_index,
                        "chunk_text": chunk_data.get("chunk_text", ""),
                        "tags": chunk_data.get("tags", []),
                        "quality_score": chunk_data.get("quality_score", 0.0),
                        "complexity_score": chunk_data.get("complexity_score", 0.0),
                        "summary_score": chunk_data.get("summary_score", 0.0),
                        "quality_reasoning": chunk_data.get("quality_reasoning", ""),
                        "complexity_reasoning": chunk_data.get("complexity_reasoning", ""),
                        "summary_reasoning": chunk_data.get("summary_reasoning", ""),
                    },
                    vector=vector,
                    uuid=deterministic_uuid,
                )

        failed = batch.number_errors
        if failed > 0:
            logger.error(f"Batch insert: {failed} of {len(chunks_data)} objects failed")
        return len(chunks_data) - failed
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
            return_metadata=MetadataQuery(distance=True),
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
                "summary_score": obj.properties.get("summary_score", 0.0),
                "quality_reasoning": obj.properties.get("quality_reasoning", ""),
                "complexity_reasoning": obj.properties.get("complexity_reasoning", ""),
                "summary_reasoning": obj.properties.get("summary_reasoning", ""),
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


def search_top_commits_batch(
    query_vectors: list[list[float]],
    user_id: str,
    top_k: int = 3,
    complexity_weight: float = 0.4,
    quality_weight: float = 0.2,
    semantic_weight: float = 0.4,
    candidate_limit: int = 30,
    distance_threshold: float = 0.35,
) -> list[list[dict]]:
    """Search for top commits for multiple queries using a single connection.

    Returns a list of result lists, one per query vector.
    Commits with distance > distance_threshold are filtered out as irrelevant.
    Final score combines semantic similarity with quality/complexity scores.
    """
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenant_collection = collection.with_tenant(user_id)

        all_results = []
        for query_vector in query_vectors:
            results = tenant_collection.query.near_vector(
                near_vector=query_vector,
                limit=candidate_limit,
                return_metadata=MetadataQuery(distance=True),
                distance=distance_threshold,
            )
            candidates = [
                {
                    "commit_sha": obj.properties["commit_sha"],
                    "repo_name": obj.properties["repo_name"],
                    "message": obj.properties["message"],
                    "diff": obj.properties.get("diff", ""),
                    "author": obj.properties.get("author", ""),
                    "tags": obj.properties.get("tags", []),
                    "quality_score": obj.properties.get("quality_score", 0.0),
                    "complexity_score": obj.properties.get("complexity_score", 0.0),
                    "distance": obj.metadata.distance,
                }
                for obj in results.objects
            ]

            # Deduplicate by commit_sha, keeping the closest chunk per commit
            seen: dict[str, dict] = {}
            for c in candidates:
                sha = c["commit_sha"]
                if sha not in seen or c["distance"] < seen[sha]["distance"]:
                    seen[sha] = c

            # Compute weighted score: semantic similarity + complexity + quality
            scored = []
            for commit in seen.values():
                quality = commit.get("quality_score", 0.0)
                complexity = commit.get("complexity_score", 0.0)
                semantic_similarity = 1.0 - commit["distance"]
                weighted = (
                    semantic_weight * semantic_similarity
                    + complexity_weight * complexity
                    + quality_weight * quality
                )
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

            scored.sort(key=lambda x: -x["weighted_score"])
            all_results.append(scored[:top_k])

        return all_results
    finally:
        client.close()


def fetch_top_complex_commits(
    user_id: str,
    top_k: int = 10,
    candidate_limit: int = 500,
) -> list[dict]:
    """Fetch the top commits by complexity_score from the user's tenant.

    No query vector needed — uses property-based sorting.
    Deduplicates by commit_sha (since commits are chunked).
    """
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenant_collection = collection.with_tenant(user_id)

        results = tenant_collection.query.fetch_objects(
            limit=candidate_limit,
            sort=Sort.by_property("complexity_score", ascending=False),
        )

        # Deduplicate by commit_sha, keeping highest complexity chunk
        seen: dict[str, dict] = {}
        for obj in results.objects:
            sha = obj.properties["commit_sha"]
            complexity = obj.properties.get("complexity_score", 0.0)
            if sha not in seen or complexity > seen[sha]["complexity_score"]:
                seen[sha] = {
                    "commit_sha": sha,
                    "repo_name": obj.properties["repo_name"],
                    "message": obj.properties["message"],
                    "diff": obj.properties.get("diff", ""),
                    "author": obj.properties.get("author", ""),
                    "tags": obj.properties.get("tags", []),
                    "quality_score": obj.properties.get("quality_score", 0.0),
                    "complexity_score": complexity,
                    "summary_score": obj.properties.get("summary_score", 0.0),
                    "quality_reasoning": obj.properties.get(
                        "quality_reasoning", ""
                    ),
                    "complexity_reasoning": obj.properties.get(
                        "complexity_reasoning", ""
                    ),
                    "summary_reasoning": obj.properties.get(
                        "summary_reasoning", ""
                    ),
                }

        ranked = sorted(
            seen.values(),
            key=lambda x: (-x["complexity_score"], -x["quality_score"]),
        )
        return ranked[:top_k]
    finally:
        client.close()

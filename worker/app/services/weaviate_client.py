import weaviate
from weaviate.classes.config import DataType, Property
from weaviate.classes.tenants import Tenant, TenantActivityStatus

from app.config import settings

COLLECTION_NAME = "Commit"


def get_client() -> weaviate.WeaviateClient:
    return weaviate.connect_to_custom(
        http_host=settings.WEAVIATE_URL.replace("http://", "").split(":")[0],
        http_port=int(settings.WEAVIATE_URL.split(":")[-1]),
        http_secure=False,
        grpc_host=settings.WEAVIATE_URL.replace("http://", "").split(":")[0],
        grpc_port=50051,
        grpc_secure=False,
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


def upsert_commit(commit_data: dict, vector: list[float]) -> None:
    """Store a commit with its embedding vector in the user's tenant."""
    client = get_client()
    try:
        collection = client.collections.get(COLLECTION_NAME)
        tenant_collection = collection.with_tenant(commit_data["user_id"])
        tenant_collection.data.insert(
            properties={
                "commit_sha": commit_data["sha"],
                "repo_name": commit_data["repo_name"],
                "message": commit_data["message"],
                "diff": commit_data.get("diff", ""),
                "author": commit_data.get("author", ""),
            },
            vector=vector,
        )
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
                "distance": obj.metadata.distance,
            }
            for obj in results.objects
        ]
    finally:
        client.close()

"""
Simple CLI GUI to inspect and manage the Weaviate Commit collection.

Usage:
    python -m scripts.weaviate_gui
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.weaviate_client import COLLECTION_NAME, get_client


def show_collection_info(client) -> None:
    if not client.collections.exists(COLLECTION_NAME):
        print(f"Collection '{COLLECTION_NAME}' does not exist.")
        return

    collection = client.collections.get(COLLECTION_NAME)
    config = collection.config.get()

    print(f"\n{'=' * 60}")
    print(f"  Collection: {COLLECTION_NAME}")
    print(f"  Multi-tenancy: {config.multi_tenancy_config.enabled}")
    print(f"{'=' * 60}")

    print(f"\n  Properties:")
    for prop in config.properties:
        print(f"    - {prop.name} ({prop.data_type.name})")


def list_tenants(client) -> list:
    collection = client.collections.get(COLLECTION_NAME)
    tenants = collection.tenants.get()
    tenant_list = list(tenants.keys())

    print(f"\n  Tenants ({len(tenant_list)}):")
    if not tenant_list:
        print("    (none)")
    for name in tenant_list:
        tenant_col = collection.with_tenant(name)
        count = len(list(tenant_col.iterator()))
        print(f"    - {name}  ({count} objects)")

    return tenant_list


def browse_tenant(client, tenant_name: str) -> None:
    collection = client.collections.get(COLLECTION_NAME)
    tenant_col = collection.with_tenant(tenant_name)

    objects = list(tenant_col.iterator(include_vector=False))
    print(f"\n  Objects in tenant '{tenant_name}': {len(objects)}")
    for i, obj in enumerate(objects[:20]):
        props = obj.properties
        print(f"\n  [{i + 1}] {props.get('commit_sha', '?')[:12]}")
        print(f"      repo:    {props.get('repo_name', '?')}")
        print(f"      message: {props.get('message', '?')[:80]}")
        print(f"      author:  {props.get('author', '?')}")

    if len(objects) > 20:
        print(f"\n  ... and {len(objects) - 20} more")


def delete_collection(client) -> None:
    confirm = input(f"\n  Delete collection '{COLLECTION_NAME}'? (yes/no): ").strip()
    if confirm.lower() != "yes":
        print("  Cancelled.")
        return
    client.collections.delete(COLLECTION_NAME)
    print(f"  Collection '{COLLECTION_NAME}' deleted.")


def delete_tenant(client, tenant_name: str) -> None:
    confirm = input(f"\n  Delete tenant '{tenant_name}' and all its data? (yes/no): ").strip()
    if confirm.lower() != "yes":
        print("  Cancelled.")
        return
    collection = client.collections.get(COLLECTION_NAME)
    collection.tenants.remove([tenant_name])
    print(f"  Tenant '{tenant_name}' deleted.")


def main_menu() -> None:
    client = get_client()
    try:
        while True:
            show_collection_info(client)

            if not client.collections.exists(COLLECTION_NAME):
                print("\n  No collection found. Run weaviate_init first.")
                break

            tenant_list = list_tenants(client)

            print(f"\n  Actions:")
            print(f"    [b] Browse a tenant")
            print(f"    [dt] Delete a tenant")
            print(f"    [dc] Delete entire collection")
            print(f"    [q] Quit")

            choice = input("\n  > ").strip().lower()

            if choice == "q":
                break
            elif choice == "b":
                name = input("  Tenant name: ").strip()
                if name in tenant_list:
                    browse_tenant(client, name)
                else:
                    print(f"  Tenant '{name}' not found.")
            elif choice == "dt":
                name = input("  Tenant name: ").strip()
                if name in tenant_list:
                    delete_tenant(client, name)
                else:
                    print(f"  Tenant '{name}' not found.")
            elif choice == "dc":
                delete_collection(client)
            else:
                print("  Unknown option.")

            input("\n  Press Enter to continue...")
    finally:
        client.close()


if __name__ == "__main__":
    main_menu()

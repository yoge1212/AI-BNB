from ..utils.supabase_client import supabase

def fetch_listings() -> list:
    """Retrieve all entries from the listings table.

    Returns:
        A list of all listing records from Supabase.
    """
    query = (
        supabase.table("listings")
        .select("*")
        .execute()
    )
    return query.data


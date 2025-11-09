from ..utils.supabase_client import supabase

def fetch_trips(user_id: str) -> list:
    """Retrieve all of user entries from the trips table.

    Returns:
        A list of all listing records from Supabase.
    """
    query = (
        supabase.table("trips")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    return query.data


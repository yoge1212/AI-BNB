from ..utils.supabase_client import supabase

def fetch_trip(trip_id: str):
    """Retrieve all of user entries from the trips table.

    Returns:
        A list of all listing records from Supabase.
    """
    query = (
        supabase.table("trips")
        .select("*")
        .eq("id", trip_id)
        .execute()
    )
    return query.data


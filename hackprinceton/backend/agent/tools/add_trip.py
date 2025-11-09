from ..utils.supabase_client import supabase


def add_trip_tool(trip_id: str, user_id: str, tripDetails: str):
    """create a new trip in the trips table."""
    
    response = (
        supabase.table("trips")
        .update({"user_id": user_id})
        .eq("id", trip_id)
        .execute()
    )

    return response.data
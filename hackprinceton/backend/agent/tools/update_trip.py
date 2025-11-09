from ..utils.supabase_client import supabase

def update_trip(trip_id: str, trip_data: dict) -> list:
    query = (
        supabase.table("trips")
        .update({"description": trip_data})
        .eq("id", trip_id)
        .execute()
    )
    return query.data

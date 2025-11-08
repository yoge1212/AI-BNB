from ..utils.supabase_client import supabase

def find_stays(destination: str, budget_per_night: float) -> list:
    """Find stays filtered by destination substring and maximum nightly budget.

    Args:
        destination: City or location substring to match against listing location.
        budget_per_night: Maximum price per night to include.

    Returns:
        A list of up to 3 matching listing records from Supabase.
    """
    query = (
        supabase.table("listings")
        .select("*")
        .ilike("location", f"%{destination}%")
        .lte("price", budget_per_night)
        .limit(3)
        .execute()
    )
    return query.data

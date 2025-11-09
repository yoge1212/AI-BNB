from ..utils.supabase_client import supabase


def add_trip_member(trip_id: str, user_email: str):
    """Invite a user to a trip."""
    query = (
        supabase.table("profiles")
        .select("user_id")
        .eq("email", user_email)
        .limit(1)
        .execute()
    )

    profiles = query.data or []
    if not profiles:
        raise ValueError(f"No user found for email '{user_email}'.")

    user_id = profiles[0].get("user_id")
    if not user_id:
        raise ValueError(f"Profile for '{user_email}' is missing a user_id.")

    response = (
        supabase.table("trips")
        .update({"user_id": user_id})
        .eq("id", trip_id)
        .execute()
    )

    return response.data
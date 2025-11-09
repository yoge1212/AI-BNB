from ..utils.supabase_client import supabase


def fetch_user(user_id: str):
    """Retrieve a user's auth profile from Supabase auth.users."""
    response = supabase.auth.admin.get_user_by_id(user_id)
    return getattr(response, "user", None)

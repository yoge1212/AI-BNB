from ..utils.supabase_client import supabase

def publish_listing(listing_data):
    response = supabase.table("listings").insert(listing_data).execute()
    print("Insert response:", response)
    # Return the actual data, not the APIResponse object
    if hasattr(response, 'data') and response.data:
        return response.data[0]  # Return the first (and only) inserted record
    return response

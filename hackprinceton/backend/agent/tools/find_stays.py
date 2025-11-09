import json
from typing import Optional, List
from ..utils.supabase_client import supabase

def find_stays(
    destination: Optional[str] = None,
    max_price: Optional[int] = None,
    min_guests: Optional[int] = None,
    min_beds: Optional[int] = None,
    min_baths: Optional[int] = None,
    required_amenities: Optional[List[str]] = None,
    pet_friendly: Optional[bool] = None
) -> str:
    """
    Finds and filters listings from the Supabase 'listings' table.
    All parameters are optional.

    Args:
        destination: City or location. Matches against the 'location' column.
        max_price: The maximum price per night (e.g., 300).
        min_guests: The minimum number of guests required (e.g., 4).
        min_beds: The minimum number of beds required.
        min_baths: The minimum number of baths required.
        required_amenities: A list of amenities the listing MUST have (e.g., ["pool", "wifi"]).
        pet_friendly: Whether the listing must be pet friendly.

    Returns:
        A JSON string of up to 15 matching listing records.
    """
    print(f"[Tool: find_stays] Running with args: {locals()}")
    
    try:
        query = supabase.table("listings").select("*")

        if destination:
            query = query.ilike("location", f"%{destination}%")
        
        if max_price:
            query = query.lte("price", max_price)
        
        if min_guests:
            query = query.gte("guests", min_guests)
        
        if min_beds:
            query = query.gte("beds", min_beds)
        
        if min_baths:
            query = query.gte("baths", min_baths)
        
        if pet_friendly is not None:
            query = query.eq("pet_friendly", pet_friendly)

        if required_amenities:
            query = query.cs("amenities", required_amenities)
            
        # We need a decent-sized list for the next step
        query = query.limit(15) 
        response = query.execute()

        print(f"[Tool: find_stays] Found {len(response.data)} listings.")
        
        # CRITICAL: Tool must return a STRING (JSON string).
        return json.dumps(response.data)

    # def view_trip(str: id) {
        
    # }

    # def view_summary(str: id) {

    # }

    # def update_summary(str: summary) {

    # }

    except Exception as e:
        print(f"[Tool Error: find_stays] {e}")
        return json.dumps({"error": str(e), "message": "Failed to query database."})
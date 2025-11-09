import json
import math
from typing import List, Dict, Any

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculates the "as-the-crow-flies" distance between two points
    on Earth using the Haversine formula. (Pure Python, no new packages)
    """
    R = 6371  # Earth radius in kilometers

    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance_km = R * c
    return distance_km

def find_most_central_listing(
    potential_listings: List[Dict[str, Any]],
    poi_coordinates: List[Dict[str, float]]
) -> str:
    """
    Finds the most optimal listing by calculating the total "as-the-crow-flies"
    distance from each listing to all points of interest.

    Args:
        potential_listings: A list of listing objects from Supabase.
                            Each object MUST have 'id', 'latitude', and 'longitude'.
        poi_coordinates: A list of coordinate objects for points of interest.
                         Each object MUST have 'latitude' and 'longitude'.

    Returns:
        A JSON string containing the 'id' of the most central listing
        and its total distance.
    """
    if not potential_listings:
        return json.dumps({"error": "No potential listings were provided."})
    if not poi_coordinates:
        return json.dumps({"error": "No points of interest were provided."})

    try:
        optimal_listing_id = None
        min_total_distance = float('inf')

        for listing in potential_listings:
            if 'latitude' not in listing or 'longitude' not in listing:
                continue # Skip listings with no location data

            listing_lat = listing['latitude']
            listing_lon = listing['longitude']
            current_total_distance = 0

            # Sum the distance from this listing to *every* POI
            for poi in poi_coordinates:
                poi_lat = poi['latitude']
                poi_lon = poi['longitude']
                current_total_distance += haversine_distance(listing_lat, listing_lon, poi_lat, poi_lon)
            
            # Check if this listing is the new best
            if current_total_distance < min_total_distance:
                min_total_distance = current_total_distance
                optimal_listing_id = listing['id']
        
        if optimal_listing_id is None:
            return json.dumps({"error": "Could not calculate optimal listing."})

        return json.dumps({
            "optimal_listing_id": optimal_listing_id,
            "total_distance_km": round(min_total_distance),
            "message": f"Listing {optimal_listing_id} is the most central, with a total travel distance of {round(min_total_distance)} km to all destinations."
        })

    except Exception as e:
        print(f"[Tool Error: find_most_central_listing] {e}")
        return json.dumps({"error": str(e)})
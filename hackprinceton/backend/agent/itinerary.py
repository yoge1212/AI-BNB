import asyncio
import json
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv
from dedalus_labs.utils.streaming import stream_async
from .tools.find_stays import find_stays
from .tools.optimizer import haversine_distance

# Load environment variables (like DEDALUS_API_KEY)
load_dotenv()

JSON_SCHEMA = {
  "trip_name": "Miami Winter Getaway",
  "summary": "Here's a simple plan for your trip to Miami!",
  
  "selected_airbnb": {
    "id": 456,
    "title": "Modern Apartment near Wynwood",
    "price_per_night": 220,
    "location": "Miami, FL, United States"
  },
  
  "daily_forecast": [
    {
      "day": 1,
      "date": "2025-12-20",
      "weather": "Sunny with a high of 82°F (28°C)."
    },
    {
      "day": 2,
      "date": "2025-12-21",
      "weather": "Partly cloudy, high of 80°F (27°C)."
    }
  ],
  
  "planned_activities": [
    {
      "day": 1,
      "time": "10:00 AM",
      "location_name": "Wynwood Walls",
      "description": "Explore outdoor street art."
    },
    {
      "day": 1,
      "time": "1:00 PM",
      "location_name": "Coyo Taco (Wynwood)",
      "description": "Lunch near the Walls."
    },
    {
      "day": 1,
      "time": "7:00 PM",
      "location_name": "Kaseya Center",
      "description": "Concert: 'The Lumineers'"
    },
    {
      "day": 2,
      "time": "11:00 AM",
      "location_name": "South Beach (Ocean Drive)",
      "description": "Walk and see Art Deco buildings."
    },
    {
      "day": 2,
      "time": "2:00 PM",
      "location_name": "Joe's Stone Crab",
      "description": "Classic Miami lunch."
    }
  ]
}

def make_prompt(input):
    # We build a simple text-based history for the prompt
    print(input)
    return f"""
        You are an AI assistant that will take trip details, creates a itinerary for a travel plan,
         and formats them as a clean JSON object.

        {input}

        ---
        RULES:
        ---
        1.  YOU WILL RETURN **ONLY** A VALID JSON OBJECT.
        2.  Do not include any text, comments, or markdown (like ```json)
            before or after the JSON.
        ---

        - Use the following MCP servers to get current information for the itinerary:
            - brave-search-mcp -> Useful for searching the web for current information.
            - ticketmaster-mcp -> Useful for finding concerts and events.
            - foursquare-places-mcp -> Useful for finding restaurants and attractions.
            - city-info-mcp -> Useful for getting information about cities.
            - exa-mcp -> Useful for searching the web for current information.

        - Use the following tools to try to get Airbnb listings:
            - find_stays -> Useful for finding Airbnb listings based on user preferences.
            - haversine_distance -> Useful for calculating distances between locations.

        JSON schema (for reference — do not include this in the output):
        {json.dumps(JSON_SCHEMA)}

        FIELDS TO OUTPUT:
        ---
           - trip_name (string)

           - summary (string)

        - selected_airbnb (object)

            -   daily_forecast (array)

            -   planned_activities (array)
    """

async def main(input):
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    result = await runner.run(
        make_prompt(input),
        tools = [find_stays, haversine_distance],
        model="gpt-4o",
        mcp_servers = [
            "brave-search-mcp",
            "ticketmaster-mcp",
            "foursquare-places-mcp",
            "city-info-mcp",
            "exa-mcp"
        ]
    )
    
    return result.final_output

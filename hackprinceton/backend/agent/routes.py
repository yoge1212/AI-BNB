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
  "type": "object",
  "required": [
    "user_id"
  ],
  "additionalProperties": False,
  "properties": {
    "user_id": {
      "type": "string",
      "description": "The UUID of the user."
    },
    "trip_name": {
      "type": "string",
      "description": "A user-friendly name for the trip."
    },
    "guest_count": {
      "type": "integer",
      "description": "The number of guests on the trip."
    },
    "status": {
      "type": "string",
      "description": "The current status of the trip (e.g., 'planning')."
    },
    "description": {
      "type": "string",
      "description": "A longer description of the trip's goals or notes."
    }
  }
}

def make_prompt(input, user_id):
    # We build a simple text-based history for the prompt
    print(input, user_id)
    return f"""
        You are an AI assistant that extracts trip details from a
        user's request and formats them as a clean JSON object.

        Here is the user's request:
        {input.strip('Thanks! I have all the information I need.')}

        You must set the 'user_id' to: {user_id}

        ---
        RULES:
        ---
        1.  YOU WILL RETURN **ONLY** A VALID JSON OBJECT.
        2.  Do not include any text, comments, or markdown (like ```json)
            before or after the JSON.
        3.  The `status` field should always be set to "planning".
        4.  If the user did not provide a `trip_name`, create a suitable one
            (e.g., "Trip to Miami").
        5.  It is OK to omit fields like `guest_count` or `description`
            if the user did not specify them.

        ---
        FIELDS TO OUTPUT:
        ---
        -   user_id (string, REQUIRED)
        -   trip_name (string)
        -   guest_count (integer)
        -   status (string, set to "planning")
        -   description (string)
    """

async def main(input, user_id):
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    result = await runner.run(
        make_prompt(input, user_id),
        tools = [],
        model="gpt-4o",
    )
    
    return result.final_output

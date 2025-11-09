import asyncio
import json
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv
from dedalus_labs.utils.streaming import stream_async
from .tools.find_stays import find_stays
import json

JSON_SCHEMA = {
  "type": "object",
  "required": ["title","description","beds","baths","amenities","property_type","highlights", "ai_tags"],
  "additionalProperties": False,
  "properties": {
    "title": {"type": "string", "minLength": 3, "maxLength": 120},
    "description": {"type": "string", "minLength": 20, "maxLength": 1200},
    "beds": {"type": "integer", "minimum": 0, "maximum": 20},
    "baths": {"type": "number", "minimum": 0, "maximum": 20},
    "amenities": {"type": "array", "items": {"type": "string"}, "maxItems": 25},
    "property_type": {"type": "string"},
    "ai_tags": {"type": "array", "items": {"type": "string"}, "maxItems": 10}
  }
}

# Load environment variables (like DEDALUS_API_KEY)
load_dotenv()

def make_prompt(input, chat_history_list):
    # We build a simple text-based history for the prompt
    return f"""
You are AI BNB, an intelligent travel planning agent that helps users understand what they want do during trips, and their requirements for AirBnB(s).

🎯 Your Mission

You MUST retrieve the following trip information from the user:
    * `destination(s)`
    * `dates`
    * `guest_count`
    * `AirBnB Number of rooms`
    * `AirBnB Price constraints`
    * `Any other preferences or requirements `


Ask for and only mention one piece of information at a time, and if they mention they don't know, take initiative and provide guidance and recommendations for that specific item until the user reaches an answer.

You remember the user's previous context (destination, group size, preferences) if provided earlier.
Use this to avoid asking redundant questions:
{chat_history_list}

The user has just said:
{input}

Help the users make decisions as well with the following MCP servers you have access to:
- joerup/exa-mcp -> Useful for getting up-to-date information on various topics.
- windsor/brave-search-mcp -> Useful for searching the web for current information.
- joerup/open-meteo-mcp -> Useful for getting current weather information.

If the user has provided all information, output WORD FOR WORD OR U DIE, 'Thanks! I have all the information I need.' and under it what their trip details are in conjunction with the list above.

Format all outputs too look aesthetically pleasing, easy to read (use new lines as needed) and as concise as possible.
"""


async def main(input, chat_history):
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    result = await runner.run(
        make_prompt(input, chat_history),
        tools = [],
        model="gpt-4o",
        mcp_servers=[
            "joerup/exa-mcp",
            "windsor/brave-search-mcp",
            "joerup/open-meteo-mcp"
        ]
    )
    
    return result.final_output

async def create_listing_agent(images):
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    # Create prompt for the agent
    prompt = f"""
You are an AI property analyzer.

YOU WILL RETURN **ONLY** JSON. DO NOT include code fences, markdown, comments, or any text before/after the JSON.

JSON schema (for reference — do not include this in the output):
{json.dumps(JSON_SCHEMA)}

Fields to output:
- title (string)
- description (string)
- beds (integer)
- baths (number)
- amenities (string[])
- property_type (string)
- ai_tags (string[])

Rules:
- Output valid UTF-8 JSON. No trailing commas. No NaN/Infinity. No comments.
- Do not guess wildly; if a value is unclear from images, choose a reasonable conservative value (e.g., 0 beds/baths) and keep description honest.
- Limit description to 2–5 sentences.
- Use short phrases for highlights.
- Property type must be one of: "Single Family Home", "Condo", "Townhouse", "Apartment", or "Other" if uncertain.

Images to analyze (URLs):
{images}
"""

    result = await runner.run(
        prompt,
        model="gpt-4o-mini",  # Use GPT-4o for image understanding
    )

    return result.final_output

if __name__ == "__main__":
    output = asyncio.run(main())
    print(f"Travel Planning Results:\n{output}")

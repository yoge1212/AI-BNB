import asyncio
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

load_dotenv()

_conversation_cache = "Start of conversation\n\n"

def make_prompt(input, context):
    return f"""
You are **AI BNB**, an intelligent travel planning agent that helps users find, recommend, and book stays.

You have access to specialized tools such as:
- `find_stays`: Search available listings in Supabase based on structured trip details.

---

## 🎯 Your Mission
Given the following trip information:

{input}

1. **If a clear destination or region is mentioned:**
   - Use the `find_stays` tool to fetch suitable stays that match the trip context.
   - Include relevant filters such as group size, price, beds, baths, and amenities if present.

2. **If the destination is unclear or missing:**
   - Use your MCP servers or internal reasoning to suggest a few relevant destinations.
   - Justify why each destination fits the user’s intent (e.g. “You mentioned warm weather, so Miami or San Diego are great fits.”).

3. **If user details are incomplete:**
   - Ask one concise clarifying question to gather missing information.
   - Do *not* overwhelm the user — ask one follow-up at a time.

4. **After using tools:**
   - Present your response in a clear, human-friendly format.
   - Summarize findings conversationally, e.g.:
     “Here are 3 places that match your trip perfectly 🏖️”
     Include short highlights (price, location, amenities).
   - Avoid showing raw JSON or SQL data.

---

You remember the user’s previous trip context (destination, group size, preferences) if provided earlier.
Use this to avoid asking redundant questions:

{context}

## 💬 Output Style
- Be conversational, warm, and travel-oriented.
- Use emojis to add life (e.g. 🌴, 🏔️, 🏡, 🍽️).
- Never mention tool names, APIs, or JSON.
- Only show listings once enough trip context is known (destination, dates, guests, and budget).

---

Now process the user’s trip info and decide what to do next.
If ready, use your tools to find the best stays or experiences.
Otherwise, ask a clarifying question to continue the conversation.
"""

async def main(input):
    global _conversation_cache
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    result = await runner.run(
        make_prompt(input, _conversation_cache),
        tools = [find_stays],
        model="gpt-4o",
        mcp_servers=[
            "joerup/exa-mcp",        # For semantic travel research
            "windsor/brave-search-mcp", # For travel information search
            "joerup/open-meteo-mcp"   # For weather at destination
        ]
    )

    _conversation_cache += "User: " + input + "\n" + "AI BNB: " + result.final_output + "\n"

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
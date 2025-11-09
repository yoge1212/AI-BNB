import asyncio
import json
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv
from dedalus_labs.utils.streaming import stream_async
from .tools.find_stays import find_stays

# Load environment variables (like DEDALUS_API_KEY)
load_dotenv()

def make_prompt(input):
    # We build a simple text-based history for the prompt
    return f"""
You are given information about a user's trip planning needs. Your goal is to help the user provide necessary details for booking AirBnB accommodations.

🎯 Your Mission
Take this information: {input}

Plan an ideal trip plan including AirBnB requirements.

Make the most optimized route closest to users requirements and favoring proximity to locations with the following MCP servers you have access to:
- mcp-google-map -> Useful for getting location and travel information.

Format all outputs too look aesthetically pleasing, easy to read (use new lines as needed) and as concise as possible.
"""


async def main(input):
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    result = await runner.run(
        make_prompt(input),
        tools = [find_stays],
        model="gpt-4o",
        mcp_servers=[
            "mcp-google-map"
        ]
    )
    
    return result.final_output

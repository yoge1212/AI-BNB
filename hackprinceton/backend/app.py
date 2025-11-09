from flask import Flask, request, jsonify
import asyncio
from .agent.tools.create_listing import publish_listing
from .agent.tools.fetch_listings import fetch_listings
import os
import sys

# --- Re-adding the robust import block ---
try:
    # This works when 'agent' is a direct sub-module
    from agent.agent import main as agent_main
except ModuleNotFoundError:
    try:
        # This might work in other local setups
        from backend.agent.agent import main as agent_main
    except ModuleNotFoundError:
        # This is the fallback for tricky path issues
        print("Could not find agent, modifying path...")
        # Get the directory where this app.py file lives
        current_dir = os.path.dirname(os.path.abspath(__file__))
        sys.path.append(current_dir)
        try:
            from agent.agent import main as agent_main
            print("Successfully imported agent from modified path.")
        except Exception as e:
            print(f"FATAL: Could not import agent after modifying path: {e}")
            agent_main = None # Make it fail loudly if import doesn't work

            # --- Re-adding the robust import block ---
try:
    # This works when 'agent' is a direct sub-module
    from agent.routes import main as routes_main
except ModuleNotFoundError:
    try:
        # This might work in other local setups
        from backend.agent.routes import main as routes_main
    except ModuleNotFoundError:
        # This is the fallback for tricky path issues
        print("Could not find agent, modifying path...")
        # Get the directory where this app.py file lives
        current_dir = os.path.dirname(os.path.abspath(__file__))
        sys.path.append(current_dir)
        try:
            from agent.routes import main as routes_main
            print("Successfully imported agent from modified path.")
        except Exception as e:
            print(f"FATAL: Could not import agent after modifying path: {e}")
            routes_main = None # Make it fail loudly if import doesn't work
# --- END ---

app = Flask(__name__)

@app.route('/')
def home():
    return ""

@app.route('/query-agent', methods=['POST'])
def query_agent():
    # Check if the import even worked
    if agent_main is None:
        print("ERROR: agent_main not imported, cannot process request.")
        return jsonify({"ok": False, "error": "Agent import failed on server."}), 500

    try:
        data = request.get_json()
        user_message = data.get('message')
        chat_history = data.get('history') # <-- 1. Get the history list

        # 2. Check for missing data
        if user_message is None or chat_history is None:
            return jsonify({"ok": False, "error": "Missing 'message' or 'history'"}), 400

        # 3. Pass BOTH arguments to the imported 'agent_main'
        ai_response_string = asyncio.run(agent_main(user_message, chat_history))

        if "Thanks! I have all the information" in ai_response_string:
            print("[Manager] Handoff signal detected! Calling Worker Agent...")
            print(chat_history)
            print(ai_response_string)
            # CALL ROUTES AGENT
            routes_response_string = asyncio.run(routes_main(ai_response_string))
            print(routes_response_string)

        # 4. Send back the AI's string reply
        return jsonify({"ok": True, "reply": ai_response_string})
    
    except Exception as e:
        print(f"Error in /query-agent: {e}") # Add server-side logging
        return jsonify({"ok": False, "error": str(e)}), 500
    


@app.route("/create-listing", methods=["POST"])
def create_listing_info():
    try:
        data = request.get_json()
        image_data = data.get("images")

        if not image_data:
            return jsonify({"ok": False, "error": "No images provided"}), 400

        try:
            from agent.agent import create_listing_agent
        except ModuleNotFoundError:
            import os, sys
            sys.path.append(os.path.dirname(__file__))
            from agent.agent import create_listing_agent

        output = asyncio.run(create_listing_agent(image_data))
        return jsonify({"ok": True, "listing": output})

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


@app.route("/publish-listing", methods=["POST"])
def insert_listing():
    try:
        data = request.get_json()
        listing_details = data.get("listing")

        if not listing_details:
            return jsonify({"ok": False, "error": "No listing data"}), 400

        output = publish_listing(listing_details)

        return jsonify({"ok": True, "listing": output}), 200

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
    

@app.route("/get-listing", methods=["GET"])
def get_listings():
    try:
        

        output = fetch_listings()

        return jsonify({"ok": True, "listings": output}), 200

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == '__main__':
    # This block runs when you use 'command: python app.py'
    app.run(host='0.0.0.0', port=5001, debug=True)
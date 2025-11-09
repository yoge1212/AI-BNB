from flask import Flask, request, jsonify
import asyncio
from .agent.tools.create_listing import publish_listing
from .agent.tools.fetch_listings import fetch_listings
app = Flask(__name__)

@app.route('/')
def home():
    return ""

@app.route('/query-agent', methods=['POST'])
def query_agent():
    try:
       data = request.get_json()
       user_message = data.get('message')

       try:
           from agent.agent import main as agent_main
       except ModuleNotFoundError:
           try:
               from backend.agent.agent import main as agent_main
           except ModuleNotFoundError:
               import os, sys
               sys.path.append(os.path.dirname(__file__))
               from agent.agent import main as agent_main

       output = asyncio.run(agent_main(user_message))
       return jsonify({"ok": True, "output": output})
    except Exception as e:
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
    app.run(debug=True)

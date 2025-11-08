from flask import Flask, request, jsonify
import asyncio


app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, Flask!"

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

if __name__ == '__main__':
    app.run(debug=True)

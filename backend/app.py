from flask import Flask, request, jsonify
from openai import OpenAI  # Using the new client import style
import os
from flask_cors import CORS
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()
# Initialize the OpenAI client with your API key.
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", "your-api-key-here"))

# Base system message to guide GPT‑3.5‑turbo for AI Career Advisor responses
BASE_SYSTEM_MESSAGE = {
    "role": "system",
    "content": (
        "You are an AI Career Advisor specializing in Artificial Intelligence and Data Science. "
        "Your goal is to guide users in choosing the best AI career path based on their background, skill level, and interests. "
        "You must provide clear, structured advice about career options, required skills, learning resources, projects, and certifications. "
        "Ensure responses are insightful, action-driven, and supportive of career growth."
    )
}

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    print(data)

    conversation_history = data.get("conversation", [])
    new_message = data.get("message", "")

    if not new_message:
        return jsonify({"error": "No new message provided."}), 400

    # Build the messages list for the OpenAI Chat API
    messages = [BASE_SYSTEM_MESSAGE]

    # Append conversation history.
    for msg in conversation_history:
        if msg["role"] == "user":
            messages.append({"role": "user", "content": msg["content"]})
        elif msg["role"] == "assistant":
            messages.append({"role": "assistant", "content": msg["content"]})

    # Add the user's new message
    messages.append({"role": "user", "content": new_message})

    print(messages)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        # Extract the answer using the updated extraction method.
        answer = response.choices[0].message.content.strip()
        return jsonify({"response": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/career_recommendation", methods=["POST"])
def career_recommendation():
    data = request.get_json()
    user_profile = {
        "role": data.get("role", ""),
        "aiKnowledge": data.get("aiKnowledge", ""),
        "careerInterests": data.get("careerInterests", []),
        "learningPreferences": data.get("learningPreferences", []),
        "availability": data.get("availability", ""),
        "goals": data.get("goals", "")
    }

    # Construct a structured prompt for career recommendations
    structured_prompt = (
        f"The user is a {user_profile['role']} with {user_profile['aiKnowledge']} AI knowledge. "
        f"They are interested in {', '.join(user_profile['careerInterests'])}. "
        f"They prefer learning via {', '.join(user_profile['learningPreferences'])} and can dedicate {user_profile['availability']} per week. "
        f"Their specific career goal is: {user_profile['goals']}. "
        "Based on this, provide a detailed AI career recommendation, including relevant skills, learning resources, projects, and certifications."
    )

    print("Structured Prompt:", structured_prompt)

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                BASE_SYSTEM_MESSAGE,
                {"role": "user", "content": structured_prompt}
            ],
        )
        answer = response.choices[0].message.content.strip()
        return jsonify({"recommendation": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return "Welcome to the AI Career Advisor Chatbot API. Use /chat for conversation and /career_recommendation for AI career guidance."

if __name__ == "__main__":
    app.run(port=5000, debug=True)

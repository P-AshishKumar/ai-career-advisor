from flask import Flask, request, jsonify
from flask_cors import CORS
import instructor
from openai import OpenAI
from models import CareerProfile, CareerAdvice
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

app = Flask(__name__)
CORS(app)

# Configure OpenAI API Client
api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=api_key)
instructor.patch(client)

BASE_SYSTEM_MESSAGE = {
    "role": "system",
    "content": "You are an AI Career Advisor specializing in AI and technology careers. Provide clear, actionable advice."
}

def construct_career_prompt(profile: CareerProfile) -> str:
    """Constructs a detailed prompt from user's career profile"""
    return f"""Please provide career guidance for a candidate with the following profile:

Education: {profile.education}
Technical Skills: {', '.join(profile.skills)}
Experience Level: {profile.experience_level}
Areas of Interest: {', '.join(profile.interests)}
Preferred Work Style: {profile.preferred_work_style}

Please analyze this profile and provide:
1. 3-5 specific recommended roles that match their background
2. A clear career progression path for the next 3-5 years
3. Key skill gaps they should address
4. Specific action items they can take immediately
5. A brief rationale for these recommendations

Focus on AI and technology careers that match their interests and current skill level."""

@app.route("/chat", methods=["POST"])
def chat():
    """Handles user chat requests for career advice."""
    data = request.get_json()
    message = data.get("message", "")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a career advisor helping with AI and technology careers. Provide specific, actionable advice."},
                {"role": "user", "content": message}
            ]
        )
        return jsonify({"response": response.choices[0].message.content})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/career_recommendation", methods=["POST"])
def get_career_recommendation():
    """Generates career recommendations based on the user's profile."""
    try:
        data = request.json
        profile = CareerProfile(
            skills=data.get("skills", []),
            experience_level=data.get("experience_level", ""),
            interests=data.get("interests", []),
            education=data.get("education", ""),
            preferred_work_style=data.get("preferred_work_style", "hybrid")
        )
        
        career_prompt = construct_career_prompt(profile)
        
        career_advice = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            response_model=CareerAdvice,
            messages=[
                {"role": "system", "content": "You are an expert career advisor specializing in AI and technology careers."},
                {"role": "user", "content": career_prompt}
            ]
        )

        return jsonify(career_advice.model_dump())
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/initial_assessment", methods=["POST"])
def initial_assessment():
    """Handles initial career assessment based on provided skills and interests."""
    try:
        data = request.json
        
        profile = CareerProfile(
            skills=data.get("skills", []),
            interests=data.get("interests", []),
            experience_level="To be determined",
            education="To be determined",
            preferred_work_style="hybrid"
        )

        # Generate initial response and follow-up questions
        career_advice = client.chat.completions.create(
            model="gpt-4",
            response_model=CareerAdvice,
            messages=[
                {"role": "system", "content": "You are a career advisor. Based on the skills and interests provided, generate initial career guidance."},
                {"role": "user", "content": f"Skills: {', '.join(profile.skills)}\nInterests: {', '.join(profile.interests)}"}
            ]
        )
        
        
        
        return jsonify({
            "profile": profile.model_dump(),
            "initial_advice": career_advice.model_dump(),
            "next_questions": [
                "What is your highest level of education?",
                "How many years of experience do you have?",
                "What type of work environment do you prefer?"
            ]
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    """Basic index route"""
    return "Welcome to the AI Career Advisor Chatbot API. Use /chat for conversation and /career_recommendation for AI career guidance."

if __name__ == "__main__":
    app.run(port=5000, debug=True)

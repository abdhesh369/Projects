import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

def generate_study_questions(topic, num_questions=5):
    """Generate study questions using OpenRouter API"""

    prompt = f"""Generate {num_questions} practice questions about {topic}.
    
    Format each question like this:
    Q1: [Question here]
    
    A1: [Answer here]
    
    Make questions clear and educational."""

    payload = {
        "model": "openai/gpt-4o-mini",  # you can change to another available model
        "messages": [
            {"role": "system", "content": "You are a helpful study assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(BASE_URL, headers=HEADERS, data=json.dumps(payload))
        resp_json = response.json()

        # Extract assistant reply
        return resp_json["choices"][0]["message"]["content"]

    except Exception as e:
        return f"Error: {str(e)}"

# Test it
if __name__ == "__main__":
    questions = generate_study_questions("Python Functions", 3)
    print(questions)
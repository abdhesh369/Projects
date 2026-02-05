import os
import requests
from requests.exceptions import RequestException
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost",
    "X-Title": "Study Buddy AI"
}


def generate_study_questions(topic, difficulty, num_questions=5):
    """Generate study questions using OpenRouter API"""

    if not API_KEY:
        return "Error: API key not configured."

    if difficulty not in ["easy", "medium", "hard"]:
        return "Error: Invalid difficulty value."

    prompt = f"""
Generate {num_questions} practice questions about {topic}.
Difficulty level: {difficulty}.

Format each question like this:
Q1: [Question here]
A1: [Answer here]

Make questions clear and educational.
"""

    payload = {
        "model": "openai/gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a helpful study assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(
            BASE_URL,
            headers=HEADERS,
            json=payload,
            timeout=30
        )
        response.raise_for_status()

        resp_json = response.json()
        return resp_json["choices"][0]["message"]["content"]

    except RequestException as e:
        return f"Error: API request failed - {str(e)}"
    except Exception as e:
        return f"Error: Unexpected failure - {str(e)}"

import os
import json
import requests
from requests.exceptions import RequestException
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
        response = requests.post(BASE_URL, headers=HEADERS, data=json.dumps(payload), timeout=30)
        response.raise_for_status() # Raise an error for bad status codes (4xx, 5xx)
        resp_json = response.json()

        # Extract assistant reply
        return resp_json["choices"][0]["message"]["content"]

    except requests.exceptions.Timeout:
        return "Error: Request timed out. Please try again later."
    except requests.exceptions.ConnectionError:
        return "Error: Connection failed. Please check your internet connection."
    except requests.exceptions.RequestException as e:
        return f"Error: API Request failed - {str(e)}"
    except Exception as e:
        return f"Error: An unexpected error occurred - {str(e)}"

# Test it
if __name__ == "__main__":
    questions = generate_study_questions("Python Functions", 3)
    print(questions)
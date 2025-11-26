import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = "gemini-2.0-flash"   # Google’s latest stable model

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL}:generateContent?key={API_KEY}"
)


def ask_gemini(message: str) -> str:
    """
    Send a text message to Gemini 2.0 Flash using REST API.
    """
    try:
        payload = {
            "contents": [
                {"parts": [{"text": message}]}
            ]
        }

        headers = {"Content-Type": "application/json"}

        response = requests.post(
            GEMINI_URL,
            headers=headers,
            json=payload,
            timeout=40,
        )

        data = response.json()

        # Debug print
        print("RAW GEMINI RESPONSE:", json.dumps(data, indent=2))

        # Error handling
        if "error" in data:
            return f"Gemini Error: {data['error'].get('message', 'Unknown error')}"

        # Extract text safely
        return data["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        print("GEMINI ERROR:", str(e))
        return "Sorry, the AI service is unavailable right now."

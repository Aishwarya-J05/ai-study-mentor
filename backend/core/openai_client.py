from openai import OpenAI
import os

# Load your OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError(
        "OPENAI_API_KEY not found. Set it as an environment variable."
    )

# Create OpenAI client
openai_client = OpenAI(api_key=OPENAI_API_KEY)

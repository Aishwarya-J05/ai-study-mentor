from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
import os

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OPENAI_API_KEY not found. Set it as an environment variable.")

openai_client = OpenAI(api_key=api_key)

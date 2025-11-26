import firebase_admin
from firebase_admin import credentials, firestore
import os

SERVICE_ACCOUNT_PATH = "firebase-adminsdk.json"

# Ensure service account exists
if not os.path.exists(SERVICE_ACCOUNT_PATH):
    raise FileNotFoundError(f"Firebase Admin JSON not found at: {SERVICE_ACCOUNT_PATH}")

# Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

# Firestore client (we still use this)
firestore_db = firestore.client()

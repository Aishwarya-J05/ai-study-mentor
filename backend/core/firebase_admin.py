import firebase_admin
from firebase_admin import credentials, firestore
import os

# Path to your Firebase Admin SDK JSON file
SERVICE_ACCOUNT_PATH = "firebase-adminsdk.json"

# Initialize Firebase Admin only once
if not firebase_admin._apps:
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        raise FileNotFoundError(
            f"Firebase Admin SDK JSON not found at: {SERVICE_ACCOUNT_PATH}\n"
            "Download it from Firebase → Project Settings → Service Accounts."
        )

    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

# Firestore client
firestore_db = firestore.client()

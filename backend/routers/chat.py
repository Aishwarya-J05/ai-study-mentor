from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from gemini_client import ask_gemini
from core.firebase_admin import firestore_db

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: str
    message: str


@router.post("/api/chat")
async def chat(req: ChatRequest):
    user_id = req.user_id
    message = req.message

    timestamp = datetime.utcnow().isoformat()

    # 1️⃣ Store USER message
    firestore_db.collection("user_chats").add({
        "user_id": user_id,
        "role": "user",
        "text": message,
        "timestamp": timestamp,
    })

    # 2️⃣ Get AI response
    ai_reply = ask_gemini(message)

    # 3️⃣ Store AI message
    firestore_db.collection("user_chats").add({
        "user_id": user_id,
        "role": "ai",
        "text": ai_reply,
        "timestamp": datetime.utcnow().isoformat(),
    })

    # 4️⃣ Return the reply to frontend
    return {"reply": ai_reply}

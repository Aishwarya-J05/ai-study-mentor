from fastapi import APIRouter
from firebase_admin import firestore

router = APIRouter()
db = firestore.client()

@router.get("/chats/{user_id}")
async def get_user_chats(user_id: str):
    chats_ref = db.collection("chat_messages").where("user_id", "==", user_id)
    docs = chats_ref.order_by("timestamp").stream()

    messages = []
    for d in docs:
        data = d.to_dict()
        messages.append({
            "id": d.id,
            "role": data.get("role"),
            "text": data.get("text"),
            "timestamp": data.get("timestamp")
        })

    return messages

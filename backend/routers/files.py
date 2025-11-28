from fastapi import APIRouter
from core.firebase_admin import firestore_db

router = APIRouter()

@router.get("/api/files/{user_id}")
async def get_files(user_id: str):
    docs = (
        firestore_db
        .collection("parsed_files")
        .where("user_id", "==", user_id)
        .stream()
    )

    files = []
    for d in docs:
        data = d.to_dict()
        files.append({
            "file_id": d.id,
            "filename": data.get("filename", "Untitled"),
            "chunks": data.get("chunks", 0),
            "url": data.get("url", "")
        })

    return files

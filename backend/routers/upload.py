from fastapi import APIRouter, UploadFile, File, HTTPException
from core.supabase_client import supabase
from core.firebase_admin import firestore_db
import uuid

router = APIRouter()

BUCKET_NAME = "uploads"   # your supabase bucket


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # read file
        file_bytes = await file.read()
        ext = file.filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{ext}"

        # ---- SUPABASE UPLOAD (CORRECT FOR supabase-py v2) ----
        res = supabase.storage.from_(BUCKET_NAME).upload(
            path=unique_name,
            file=file_bytes,
            file_options={
                "content-type": file.content_type
            }
        )

        if res is None:
            raise HTTPException(status_code=500, detail="Upload failed (null response).")

        # ---- GET PUBLIC URL ----
        url = supabase.storage.from_(BUCKET_NAME).get_public_url(unique_name)

        # ---- SAVE METADATA TO FIRESTORE ----
        firestore_db.collection("uploads").add({
            "filename": file.filename,
            "stored_as": unique_name,
            "url": url,
            "content_type": file.content_type,
        })

        return {
            "message": "Uploaded successfully",
            "url": url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

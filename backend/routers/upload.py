from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import os
import uuid
from services.pdf_reader import extract_text_from_pdf
from services.text_splitter import split_into_chunks
from services.embedder import generate_embeddings
from services.retriever import store_embeddings
from core.firebase_admin import firestore_db
import shutil

router = APIRouter()

UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # 1. Save PDF temporarily
        file_id = str(uuid.uuid4())
        temp_path = f"{UPLOAD_FOLDER}/{file_id}.pdf"

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Extract text
        text = extract_text_from_pdf(temp_path)

        # 3. Split into chunks
        chunks = split_into_chunks(text)

        # 4. Generate embeddings for chunks
        embeddings = generate_embeddings(chunks)

        # 5. Store embeddings in ChromaDB
        store_embeddings(file_id, chunks, embeddings)

        # 6. Save metadata in Firestore
        firestore_db.collection("files").document(file_id).set({
            "fileId": file_id,
            "name": file.filename,
            "createdAt": firestore_db.SERVER_TIMESTAMP,
            "chunkCount": len(chunks),
        })

        return JSONResponse({"status": "success", "fileId": file_id})

    except Exception as e:
        print("Error:", e)
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)

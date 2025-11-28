from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.pdf_reader import extract_text_from_pdf
from services.text_splitter import split_into_chunks
from services.embedder import generate_embeddings
from services.retriever import store_embeddings
from core.firebase_admin import firestore_db
import uuid
import requests
import os

router = APIRouter()

class ProcessRequest(BaseModel):
    url: str
    filename: str
    user_id: str

# Ensure temp folder exists
os.makedirs("temp_uploads", exist_ok=True)

@router.post("/api/process-file")
async def process_file(req: ProcessRequest):

    url = req.url
    filename = req.filename
    user_id = req.user_id

    try:
        # Download file
        resp = requests.get(url)
        if resp.status_code != 200:
            raise Exception("File download failed")

        local_path = f"temp_uploads/{uuid.uuid4()}.pdf"
        with open(local_path, "wb") as f:
            f.write(resp.content)

        # Extract text
        text = extract_text_from_pdf(local_path)
        if not text:
            raise Exception("Failed to extract text from PDF")

        # Split into chunks
        chunks = split_into_chunks(text)

        # Create embeddings
        embeddings = generate_embeddings(chunks)

        # Create unique file id
        file_id = str(uuid.uuid4())

        # Store in ChromaDB
        store_embeddings(file_id, chunks, embeddings)

        # Save metadata in Firestore
        firestore_db.collection("parsed_files").document(file_id).set({
            "user_id": user_id,
            "filename": filename,
            "url": url,
            "chunks": len(chunks),
        })

        return {"message": "File processed successfully", "file_id": file_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.retriever import collection
from gemini_client import ask_gemini

router = APIRouter()

class AskRequest(BaseModel):
    question: str
    user_id: str
    file_id: str | None = None   # optional for general chat

@router.post("/api/ask")
async def ask(req: AskRequest):

    # 1️⃣ If no file_id → general chatbot mode
    if not req.file_id:
        answer = ask_gemini(req.question)
        return {
            "answer": answer,
            "sources": []
        }

    # 2️⃣ Query vector database (RAG)
    try:
        results = collection.query(
            query_texts=[req.question],
            n_results=4,
            where={"file_id": req.file_id}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector DB error: {e}")

    # 3️⃣ Extract chunks
    retrieved_chunks = results.get("documents", [[]])[0]

    if not retrieved_chunks:
        return {
            "answer": "No related study notes found. Try uploading notes first.",
            "sources": []
        }

    # 4️⃣ Build context prompt
    context = "\n\n".join(retrieved_chunks)

    prompt = f"""
You are an AI Study Mentor.
Use ONLY the context provided below to answer.

------------------------
CONTEXT:
{context}
------------------------

QUESTION:
{req.question}

Explain clearly with examples.
"""

    # 5️⃣ Get answer from Gemini
    answer = ask_gemini(prompt)

    return {
        "answer": answer,
        "sources": retrieved_chunks
    }

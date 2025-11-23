import chromadb
from chromadb.config import Settings

# Initialize persistent ChromaDB
client = chromadb.Client(
    Settings(
        is_persistent=True,
        persist_directory="backend/vectordb"
    )
)

COLLECTION_NAME = "documents"

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

def store_embeddings(file_id: str, chunks: list[str], embeddings: list[list[float]]):
    """
    Store text chunks + embeddings into ChromaDB.
    """
    try:
        ids = [f"{file_id}_{i}" for i in range(len(chunks))]

        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=[{"file_id": file_id}] * len(chunks)
        )

        print(f"Stored {len(chunks)} items in ChromaDB")
    except Exception as e:
        print("ChromaDB store error:", e)

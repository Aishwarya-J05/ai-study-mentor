import chromadb
from chromadb.config import Settings

# Create / load persistent ChromaDB
client = chromadb.Client(
    Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory="backend/vectordb/chroma"
    )
)

# Collection name for storing embeddings
COLLECTION_NAME = "documents"

# Create collection if not exists
collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}   # cosine similarity
)


def store_embeddings(file_id: str, chunks: list, embeddings: list):
    """
    Save embeddings + chunks into ChromaDB for later retrieval.
    Each chunk is stored as a separate document.
    """
    try:
        ids = [f"{file_id}_{i}" for i in range(len(chunks))]

        collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=[{"file_id": file_id}] * len(chunks)
        )

        print("Stored embeddings in ChromaDB:", len(chunks))

    except Exception as e:
        print("ChromaDB store error:", e)

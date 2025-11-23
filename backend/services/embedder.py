from sentence_transformers import SentenceTransformer

# Load free local embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def generate_embeddings(chunks: list[str]) -> list[list[float]]:
    """
    Generate vector embeddings for text chunks using a local Transformer model.
    """
    try:
        embeddings = model.encode(chunks, convert_to_numpy=True).tolist()
        return embeddings
    except Exception as e:
        print("Embedding generation error:", e)
        return []

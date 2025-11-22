from core.openai_client import openai_client

def generate_embeddings(chunks):
    """
    Takes a list of text chunks and returns embeddings for each chunk.
    Uses OpenAI Embeddings model.
    """
    embeddings = []

    for chunk in chunks:
        try:
            response = openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=chunk
            )

            vector = response.data[0].embedding
            embeddings.append(vector)

        except Exception as e:
            print("Embedding error:", e)
            embeddings.append([])

    return embeddings

def split_into_chunks(text: str, chunk_size: int = 500, overlap: int = 100):
    """
    Splits extracted text into overlapping chunks for better RAG context.
    chunk_size = number of characters per chunk
    overlap    = repeated chars between chunks
    """

    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]

        chunks.append(chunk)

        # move start forward but keep some overlap
        start += chunk_size - overlap

    return chunks

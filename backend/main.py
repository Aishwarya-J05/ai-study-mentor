from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.chat import router as chat_router
from routers.upload import router as upload_router
from routers.process_file import router as process_router
from routers.rag_chat import router as rag_router
from routers.files import router as files_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(chat_router)
app.include_router(upload_router)          # ✅ FIX
app.include_router(process_router)         # ✅ FIX
app.include_router(rag_router)             # ✅ FIX
app.include_router(files_router)

@app.get("/")
def home():
    return {"status": "backend running"}

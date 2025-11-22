from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.upload import router as upload_router

app = FastAPI()

# CORS: allow frontend (Vite) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # in production, replace "*" with Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload_router, prefix="")

@app.get("/")
def home():
    return {"message": "AI Study Mentor Backend Running"}

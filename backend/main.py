from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from transformers import pipeline
from typing import List
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

summarizer = pipeline("summarization")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_location, "wb+") as file_object:
            file_object.write(file.file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail="File upload failed: " + str(e))
    return {"filename": file.filename}

@app.post("/summarize")
async def summarize(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(file_path, "r") as file:
            text = file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail="File read failed: " + str(e))
    
    summary = summarizer(text, max_length=150, min_length=40, do_sample=False)
    return JSONResponse(content={"summary": summary[0]['summary_text']})

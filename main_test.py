from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import random
import time

app = FastAPI()

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Mock prediction for testing
# -------------------------------
mock_breeds = [
    "Golden Retriever", "Labrador Retriever", "German Shepherd", 
    "French Bulldog", "Bulldog", "Poodle", "Beagle", "Rottweiler",
    "Yorkshire Terrier", "Dachshund", "Siberian Husky", "Boston Terrier"
]

@app.get("/")
async def root():
    return {"message": "Pawdentify API is running!"}

@app.post("/predict")
async def predict_breed(file: UploadFile = File(...)):
    try:
        # Simulate processing time
        time.sleep(1)
        
        # Mock prediction
        predicted_breed = random.choice(mock_breeds)
        confidence = round(random.uniform(0.75, 0.98), 3)
        
        return JSONResponse({
            "predicted_class": predicted_breed,
            "confidence": confidence,
            "status": "success"
        })
        
    except Exception as e:
        return JSONResponse({
            "error": str(e),
            "status": "error"
        }, status_code=500)

# Static files for frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    print("🐕 Pawdentify Backend Starting...")
    print("📍 Server running at: http://localhost:8000")
    print("🔗 API Documentation: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
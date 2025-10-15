from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import tensorflow as tf
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
from PIL import Image
import numpy as np
import io
import json
from datetime import datetime
from typing import Optional

# Load environment variables from .env file
load_dotenv()

# Import our database components (optional)
try:
    from database.connection import get_database, close_database_connection
    from database.services import ScanHistoryService, UserService
    from api_routes import router as api_router
    DATABASE_AVAILABLE = True
    print("✅ Database components imported successfully")
except ImportError as e:
    print(f"⚠️  Database components not available: {e}")
    DATABASE_AVAILABLE = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    if DATABASE_AVAILABLE:
        get_database()
        print("✅ Database connection established")
    else:
        print("⚠️  Running without database")
    yield
    # Shutdown
    if DATABASE_AVAILABLE:
        await close_database_connection()
        print("✅ Database connection closed")

app = FastAPI(
    title="Pawdentify API", 
    description="Dog breed identification with user data persistence",
    lifespan=lifespan
)

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes for database operations (if available)
if DATABASE_AVAILABLE:
    app.include_router(api_router, prefix="/api")

# -------------------------------
# Load model
# -------------------------------
MODEL_PATH = "model/final_model.keras"
model = tf.keras.models.load_model(MODEL_PATH)

# Automatically detect model input shape
input_shape = model.input_shape  # e.g., (None, 300, 300, 3)
IMG_HEIGHT, IMG_WIDTH = input_shape[1], input_shape[2]

# -------------------------------
# Load class indices (your format: "0": "Afghan_hound")
# -------------------------------
CLASS_INDICES_PATH = "model/class_indices.json"
with open(CLASS_INDICES_PATH, "r") as f:
    class_indices = json.load(f)

# Convert string keys to integers
idx_to_class = {int(k): v for k, v in class_indices.items()}

# -------------------------------
# Preprocess image
# -------------------------------
def preprocess_image(image_bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((IMG_WIDTH, IMG_HEIGHT))
        img_array = np.array(image)
        img_array = preprocess_input(img_array)  # EfficientNetV2 preprocessing
        img_array = np.expand_dims(img_array, axis=0)  # (1,H,W,3)
        return img_array
    except Exception as e:
        raise ValueError(f"Error processing image: {e}")

# -------------------------------
# Prediction endpoint with MongoDB integration
# -------------------------------
@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    user_id: Optional[str] = None  # Clerk user ID from frontend
):
    try:
        image_bytes = await file.read()
        img_array = preprocess_image(image_bytes)

        # Get predictions
        predictions = model.predict(img_array)
        predicted_index = int(np.argmax(predictions, axis=1)[0])
        confidence = float(np.max(predictions))
        predicted_class = idx_to_class.get(predicted_index, "Unknown")

        # Enhanced crossbreed detection logic
        top_indices = np.argsort(predictions[0])[-10:][::-1]  # Get top 10 for better analysis
        top_predictions = [
            {
                "breed": idx_to_class.get(int(idx), "Unknown"),
                "confidence": float(predictions[0][idx])
            }
            for idx in top_indices
        ]

        # Advanced crossbreed detection criteria
        confidence_threshold = 0.70
        secondary_threshold = 0.15  # Secondary breed must have at least 15% confidence
        confidence_gap = 0.30  # Gap between top 2 predictions should be less than 30%
        
        is_potential_crossbreed = False
        crossbreed_analysis = {}
        
        if len(top_predictions) >= 2:
            primary_conf = top_predictions[0]["confidence"]
            secondary_conf = top_predictions[1]["confidence"]
            confidence_gap_actual = primary_conf - secondary_conf
            
            # Determine crossbreed based on multiple criteria
            if (primary_conf < confidence_threshold or 
                (secondary_conf > secondary_threshold and confidence_gap_actual < confidence_gap)):
                is_potential_crossbreed = True
                
                crossbreed_analysis = {
                    "primary_breed": top_predictions[0]["breed"],
                    "primary_confidence": primary_conf,
                    "secondary_breed": top_predictions[1]["breed"],
                    "secondary_confidence": secondary_conf,
                    "confidence_gap": confidence_gap_actual,
                    "crossbreed_likelihood": min(1.0, (secondary_conf / primary_conf) + 0.3),
                    "suggested_mix": f"{top_predictions[0]['breed']} x {top_predictions[1]['breed']} Mix"
                }

        # Enhanced response with crossbreed analysis
        response_data = {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "is_potential_crossbreed": is_potential_crossbreed,
            "top_predictions": top_predictions[:5],  # Return top 5 for display
            "crossbreed_analysis": crossbreed_analysis if is_potential_crossbreed else None,
            "detection_metadata": {
                "confidence_threshold": confidence_threshold,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "algorithm_version": "1.1"
            },
            "timestamp": datetime.utcnow().isoformat()
        }

        # Save scan history to database if user_id provided
        if user_id:
            try:
                from database.models import ScanHistory, BreedPrediction
                
                # Create breed predictions objects
                breed_predictions = [
                    BreedPrediction(
                        breed_name=pred["breed"],
                        confidence=pred["confidence"]
                    )
                    for pred in top_predictions
                ]
                
                # Create scan history object
                scan_history = ScanHistory(
                    user_id=user_id,
                    predicted_breed=predicted_class,
                    confidence_score=confidence,
                    is_crossbreed=is_potential_crossbreed,
                    top_predictions=breed_predictions,
                    timestamp=datetime.utcnow(),
                    image_url=None,  # Could store image URL if implementing image storage
                    image_hash=None,  # Could calculate hash for deduplication
                    secondary_breed=top_predictions[1]["breed"] if len(top_predictions) > 1 and is_potential_crossbreed else None,
                    location=None,  # Could be added from frontend
                    user_feedback=None,  # Will be updated via separate endpoint
                    user_notes=None,  # Can be added later
                    user_confirmed_breed=None  # Will be updated if user corrects
                )
                
                # Save to database
                await ScanHistoryService.create_scan(scan_history)
                
                # Increment user's scan count
                await UserService.increment_scan_count(user_id)
                
                print(f"✅ Scan history saved for user: {user_id}")
            except Exception as db_error:
                print(f"⚠️ Failed to save scan history: {db_error}")
                # Don't fail the prediction if database save fails

        return JSONResponse(response_data)

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

# -------------------------------
# Static files & root route
# -------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount /static to serve CSS/JS/Assets
if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
async def root():
    index_path = os.path.join(STATIC_DIR, "index.html")
    return FileResponse(index_path)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Pawdentify API is running"}

@app.get("/api/health")
async def api_health_check():
    """API health check endpoint"""
    return {"status": "healthy", "database": "connected", "model": "loaded"}
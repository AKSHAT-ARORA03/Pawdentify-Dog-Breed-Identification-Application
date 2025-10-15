"""
Model Download Utility for Pawdentify
Downloads the AI model from cloud storage for deployment
"""

import os
import requests
import hashlib
from pathlib import Path
import time

def download_file_with_progress(url, filepath, expected_size=None):
    """Download a file with progress tracking"""
    print(f"📥 Downloading model from: {url}")
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        if expected_size and total_size != expected_size:
            print(f"⚠️ Warning: Expected size {expected_size}, got {total_size}")
        
        downloaded_size = 0
        chunk_size = 8192
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    
                    if total_size > 0:
                        progress = (downloaded_size / total_size) * 100
                        print(f"\r📊 Progress: {progress:.1f}% ({downloaded_size / 1024 / 1024:.1f}MB / {total_size / 1024 / 1024:.1f}MB)", end="")
        
        print(f"\n✅ Download completed: {filepath}")
        return True
        
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False

def verify_model_file(filepath, expected_hash=None):
    """Verify the downloaded model file"""
    if not os.path.exists(filepath):
        return False
    
    file_size = os.path.getsize(filepath)
    print(f"📊 Model file size: {file_size / 1024 / 1024:.1f}MB")
    
    if expected_hash:
        print("🔍 Verifying file integrity...")
        sha256_hash = hashlib.sha256()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        
        calculated_hash = sha256_hash.hexdigest()
        if calculated_hash == expected_hash:
            print("✅ File integrity verified")
            return True
        else:
            print(f"❌ File integrity check failed")
            print(f"Expected: {expected_hash}")
            print(f"Got: {calculated_hash}")
            return False
    
    return True

def download_model_if_missing():
    """Main function to download model if it doesn't exist"""
    model_dir = Path("model")
    model_path = model_dir / "final_model.keras"
    
    # Create model directory if it doesn't exist
    model_dir.mkdir(exist_ok=True)
    
    # Check if model already exists
    if model_path.exists():
        print(f"✅ Model already exists: {model_path}")
        return str(model_path)
    
    print("🔍 Model not found, attempting to download...")
    
    # Cloud storage URLs - can be configured via environment variables
    model_urls = [
        # Environment variable for custom model URL
        os.getenv("MODEL_DOWNLOAD_URL"),
        # GitHub Release (update after creating release)
        "https://github.com/AKSHAT-ARORA03/PAWDENTIFY-AI-Powered-Dog-Breed-Recognition-System/releases/download/v1.0/final_model.keras",
        # Backup URLs can be added here
    ]
    
    # Filter out None values
    model_urls = [url for url in model_urls if url]
    
    # Try downloading from each URL
    for url in model_urls:
        if url.startswith("https://your-storage-url") or "YOUR_GOOGLE_DRIVE_FILE_ID" in url:
            continue  # Skip placeholder URLs
            
        print(f"🔄 Trying to download from: {url}")
        
        try:
            if download_file_with_progress(url, str(model_path), expected_size=125000000):  # ~125MB
                if verify_model_file(str(model_path)):
                    print(f"✅ Model successfully downloaded and verified!")
                    return str(model_path)
                else:
                    print("❌ Model verification failed, trying next URL...")
                    os.remove(model_path)
                    continue
        except Exception as e:
            print(f"❌ Failed to download from {url}: {e}")
            continue
    
    print("❌ Could not download model from any source")
    return None

def create_dummy_model_for_testing():
    """Create a dummy model file for testing purposes"""
    print("🔧 Creating dummy model for testing...")
    
    model_dir = Path("model")
    model_path = model_dir / "final_model.keras"
    model_dir.mkdir(exist_ok=True)
    
    try:
        import tensorflow as tf
        from keras import layers, models
        
        # Create a simple dummy model with same architecture
        dummy_model = models.Sequential([
            layers.Input(shape=(300, 300, 3)),
            layers.GlobalAveragePooling2D(),
            layers.Dense(120, activation='softmax')
        ])
        
        dummy_model.save(str(model_path))
        print(f"✅ Dummy model created: {model_path}")
        print("⚠️ Note: This is a dummy model and won't give accurate predictions!")
        return str(model_path)
        
    except Exception as e:
        print(f"❌ Failed to create dummy model: {e}")
        return None

if __name__ == "__main__":
    # Download model when script is run directly
    model_path = download_model_if_missing()
    if not model_path:
        print("🔧 Creating dummy model for testing...")
        model_path = create_dummy_model_for_testing()
    
    if model_path:
        print(f"🎉 Model ready at: {model_path}")
    else:
        print("❌ Failed to prepare model")
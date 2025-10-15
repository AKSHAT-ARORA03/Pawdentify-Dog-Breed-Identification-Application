# AI Model Directory

## Model Information
- **File**: `final_model.keras`
- **Size**: 119MB (exceeds GitHub's 100MB limit)
- **Architecture**: EfficientNetV2
- **Classes**: 120 dog breeds
- **Accuracy**: 95%+

## Deployment Options

### Option 1: Git LFS (Recommended for Development)
The model is tracked with Git LFS. To download it:
```bash
git lfs pull
```

### Option 2: Cloud Storage (Recommended for Production)
For production deployment, consider storing the model in:
- **Google Drive**: Upload and use direct download link
- **AWS S3**: Store in S3 bucket with public access
- **Azure Blob Storage**: Use Azure storage for model hosting
- **Hugging Face Model Hub**: Upload to model repository

### Option 3: Model Download Script
Create a download script that fetches the model during deployment:
```python
import requests
import os

def download_model():
    """Download the trained model from cloud storage"""
    model_url = "YOUR_CLOUD_STORAGE_URL/final_model.keras"
    model_path = "model/final_model.keras"
    
    if not os.path.exists(model_path):
        print("Downloading model...")
        response = requests.get(model_url)
        with open(model_path, 'wb') as f:
            f.write(response.content)
        print("Model downloaded successfully!")
```

### For Development Without Model
If you don't have the model file, the application will show an error. You can:
1. Train your own model using the same architecture
2. Use a placeholder model for UI testing
3. Download from the provided cloud storage link

## Class Indices
The `class_indices.json` file maps breed names to model output indices and is included in the repository.
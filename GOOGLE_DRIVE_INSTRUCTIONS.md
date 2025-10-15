# Google Drive Model Upload Instructions

## Step 1: Upload to Google Drive

1. **Go to Google Drive**: https://drive.google.com
2. **Upload your `final_model.keras` file**
3. **Right-click the file → "Get link"**
4. **Change sharing to "Anyone with the link"**
5. **Copy the sharing link**

## Step 2: Convert to Direct Download Link

If your Google Drive link looks like:
```
https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing
```

Convert it to:
```
https://drive.google.com/uc?export=download&id=1ABC123xyz
```

## Step 3: Update Model Downloader

Replace the URL in `model_downloader.py`:

```python
model_urls = [
    "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID_HERE",
]
```

## Step 4: Environment Variable (Optional)

Add to your `.env` file:
```bash
MODEL_DOWNLOAD_URL=https://drive.google.com/uc?export=download&id=YOUR_FILE_ID_HERE
```

And update model_downloader.py to use:
```python
model_urls = [
    os.getenv("MODEL_DOWNLOAD_URL", "fallback_url_here"),
]
```
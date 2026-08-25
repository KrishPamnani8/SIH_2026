import os
from fastapi import UploadFile, HTTPException
from config import config

def validate_uploaded_files(files: list[UploadFile]) -> list[str]:
    """
    Validates uploaded files for valid extensions and non-empty presence.
    Returns a list of file names if valid, or raises HTTPException(400) if invalid.
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No image file provided. Please upload at least one image.")

    validated_names = []
    for file in files:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Uploaded file missing filename.")
        
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in config.ALLOWED_EXTENSIONS:
            allowed_str = ", ".join(config.ALLOWED_EXTENSIONS)
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format '{ext}' for file '{file.filename}'. Allowed formats: {allowed_str}"
            )
        validated_names.append(file.filename)
        
    return validated_names

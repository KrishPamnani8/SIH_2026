import os
import sys

# Ensure Windows UCRT DLLs can be resolved when running under MSYS2 Python
if sys.platform == "win32" and hasattr(os, "add_dll_directory"):
    ucrt_bin = "C:\\msys64\\ucrt64\\bin"
    if os.path.exists(ucrt_bin):
        try:
            os.add_dll_directory(ucrt_bin)
        except Exception:
            pass


class Config:
    PROJECT_NAME: str = "SatQuery AI Backend"
    VERSION: str = "0.1.0"
    
    # CORS configuration to allow connections from Next.js frontend
    CORS_ORIGINS: list = [
        "http://localhost:3010",
        "http://127.0.0.1:3010",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Supported file extensions
    ALLOWED_EXTENSIONS: set = {
        ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".npy"
    }

    # Optional Cloud GPU / Colab GPU / Hugging Face API keys & endpoints for heavy model inference
    HUGGINGFACE_API_TOKEN: str = os.getenv("HUGGINGFACE_API_TOKEN", "")
    CLOUD_GPU_ENDPOINT: str = os.getenv("CLOUD_GPU_ENDPOINT", "")
    COLAB_GPU_ENDPOINT: str = os.getenv("COLAB_GPU_ENDPOINT", "https://rmsru-34-105-44-69.run.pinggy-free.link/predict")

config = Config()



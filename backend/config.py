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
    VERSION: str = "0.2.0"

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
    COLAB_GPU_ENDPOINT: str = os.getenv("COLAB_GPU_ENDPOINT", "https://gxolw-136-85-84-182.run.pinggy-free.link/predict")
    CHANGE_ANALYSIS_ENDPOINT: str = os.getenv("CHANGE_ANALYSIS_ENDPOINT", "https://gxolw-136-85-84-182.run.pinggy-free.link/change")
    COLAB_SAR_OPTICAL_ENDPOINT: str = os.getenv("COLAB_SAR_OPTICAL_ENDPOINT", "https://gxolw-136-85-84-182.run.pinggy-free.link/croma")

    # LLM API Keys for LangGraph planner nodes
    # Primary: Google Gemini (recommended for SIH / GCP stack)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # Fallback: OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    # Fallback: Groq (free, LLaMA-3)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # Feature flag: set USE_LANGGRAPH=true to use LangGraph agent, false for legacy keyword router
    USE_LANGGRAPH: bool = os.getenv("USE_LANGGRAPH", "true").lower() == "true"

config = Config()

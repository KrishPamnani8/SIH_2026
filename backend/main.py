from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import config
from schemas import AnalysisResponse, HealthCheckResponse
from validators import validate_uploaded_files
from preprocessing import load_image_bytes
from agent import run_agent

app = FastAPI(
    title=config.PROJECT_NAME,
    version=config.VERSION,
    description="Agentic Vision-Language Assistant for Remote-Sensing Image Analysis"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=HealthCheckResponse)
def root():
    """Health check endpoint."""
    return HealthCheckResponse(
        status="ok",
        project=config.PROJECT_NAME,
        version=config.VERSION
    )

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_images(
    files: list[UploadFile] = File(...),
    query: str = Form("What is visible in this satellite image?")
):
    """
    Main analysis endpoint:
    - Accepts 1 or 2 satellite images (PNG, JPG, TIFF, NPY)
    - Accepts a natural language query
    - Runs input validation, task routing, specialist tool execution
    - Returns structured AnalysisResponse with evidence, confidence, and execution trace
    """
    # 1. Validate files
    file_names = validate_uploaded_files(files)
    
    # 2. Extract basic image metadata
    images_metadata = []
    for file in files:
        content = await file.read()
        meta = load_image_bytes(content, filename=file.filename or "")
        meta["filename"] = file.filename
        images_metadata.append(meta)
        
    # 3. Execute agent pipeline
    try:
        response = run_agent(query=query, images_metadata=images_metadata)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

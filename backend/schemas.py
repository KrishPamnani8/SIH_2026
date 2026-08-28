from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalysisResponse(BaseModel):
    success: bool = True
    task: str = Field(..., description="The classified task, e.g. vqa, captioning, grounding, change_analysis, optical_sar")
    # LangGraph additions
    image_type: str = Field("single", description="Classified input type: single | bi-temporal | optical_sar")
    intent: str = Field("vqa", description="LLM-parsed query intent: what_changed | describe | detect | vqa | ground")
    answer: str = Field(..., description="Natural language answer or analysis description")
    confidence: Optional[float] = Field(None, description="Confidence score between 0 and 1, or None if unavailable")
    evidence: List[str] = Field(default_factory=list, description="Extracted key features or highlighted evidence items")
    visual_evidence: List[str] = Field(default_factory=list, description="Base64 encoded visual overlay images/maps")
    execution_trace: List[str] = Field(default_factory=list, description="Step-by-step trace of how the decision & output were generated")
    model: str = Field("prototype", description="Model name or architecture used")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional contextual metadata")

class HealthCheckResponse(BaseModel):
    status: str = "ok"
    project: str = "SatQuery AI Backend"
    version: str = "0.2.0"

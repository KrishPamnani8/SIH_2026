"""
AgentState — shared state TypedDict passed between all LangGraph nodes.

Each node reads relevant fields and writes its outputs back.
The state is immutable between nodes (LangGraph passes a copy).
"""

from typing import TypedDict, List, Optional, Dict, Any


class AgentState(TypedDict):
    # ── Inputs (set by the API endpoint before graph entry)
    query: str                         # Raw natural language query from user
    images_metadata: List[Dict[str, Any]]  # List of image metadata dicts from preprocessing

    # ── Node 1 outputs: Input Classifier
    image_type: str                    # "single" | "bi-temporal" | "optical_sar"
    modality: str                      # "optical" | "sar" | "both" | "unknown"
    num_images: int                    # Number of images uploaded

    # ── Node 2 outputs: Query Understander (LLM)
    intent: str                        # "what_changed" | "describe" | "detect" | "vqa" | "ground"
    intent_confidence: float           # Confidence of LLM intent classification (0-1)
    intent_reasoning: str              # LLM's reasoning string (for trace)

    # ── Node 3 outputs: Task Planner
    task: str                          # "change_analysis" | "optical_sar" | "vqa" | "captioning" | "grounding"
    model_plan: str                    # Description of which model/pipeline will be used

    # ── Node 4 outputs: Tool Dispatcher
    tool_result: Dict[str, Any]        # Raw dict returned by the specialist tool

    # ── Accumulated across all nodes
    execution_trace: List[str]         # Observable step-by-step trace
    errors: List[str]                  # Non-fatal error/warning messages

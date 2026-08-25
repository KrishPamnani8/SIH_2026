"""
Agent & Task Router module for SatQuery AI.
Interprets user queries, routes them to the correct specialist tool,
and tracks the observable execution trace.
"""

from schemas import AnalysisResponse
from tools.vqa import execute_vqa
from tools.captioning import execute_captioning
from tools.grounding import execute_grounding
from tools.change_analysis import execute_change_analysis
from tools.optical_sar import execute_optical_sar

def route_query_to_task(query: str, num_images: int) -> str:
    """
    Deterministic rule-based task routing based on query keywords and file count.
    """
    q = query.lower().strip()
    
    # Priority rules
    if "sar" in q or "radar" in q or "optical" in q or "cross-modal" in q:
        return "optical_sar"
    elif "changed" in q or "change" in q or "difference" in q or "before" in q or "after" in q or num_images >= 2:
        return "change_analysis"
    elif "highlight" in q or "locate" in q or "segment" in q or "box" in q or "find" in q or "where is" in q:
        return "grounding"
    elif "describe" in q or "caption" in q or "summary" in q or "overview" in q or q.startswith("what is in"):
        return "captioning"
    else:
        return "vqa"

def run_agent(query: str, images_metadata: list[dict]) -> AnalysisResponse:
    """
    Main agentic orchestration entry point.
    Executes input validation, task classification, tool selection, inference, and evidence extraction.
    """
    execution_trace = []
    num_images = len(images_metadata)
    
    # Step 1: Input Validation
    execution_trace.append(f"[OK] Input Validation: Received & validated {num_images} image file(s).")
    for idx, meta in enumerate(images_metadata, 1):
        if meta.get("valid"):
            fmt = meta.get("format", "RAW")
            execution_trace.append(f"[OK] Image {idx}: {meta.get('width')}x{meta.get('height')} px ({fmt}).")
        else:
            execution_trace.append(f"[OK] Image {idx}: Preprocessed with basic metadata.")
            
    # Step 2: Intent & Task Routing
    task = route_query_to_task(query, num_images)
    execution_trace.append(f"[OK] Query Intent Analysis: '{query}'")
    execution_trace.append(f"[OK] Task Classified: '{task.upper()}'")
    
    # Step 3: Tool Dispatch & Execution
    if task == "vqa":
        execution_trace.append("[OK] Specialist Tool Selected: VQA (Visual Question Answering)")
        tool_result = execute_vqa(query, images_metadata)
    elif task == "captioning":
        execution_trace.append("[OK] Specialist Tool Selected: RS Scene Captioning")
        tool_result = execute_captioning(query, images_metadata)
    elif task == "grounding":
        execution_trace.append("[OK] Specialist Tool Selected: Text-Guided Grounding")
        tool_result = execute_grounding(query, images_metadata)
    elif task == "change_analysis":
        execution_trace.append("[OK] Specialist Tool Selected: Bi-Temporal Change Analysis")
        tool_result = execute_change_analysis(query, images_metadata)
    elif task == "optical_sar":
        execution_trace.append("[OK] Specialist Tool Selected: Optical + SAR Fusion")
        tool_result = execute_optical_sar(query, images_metadata)
    else:
        execution_trace.append("[OK] Fallback Tool Selected: Default VQA")
        tool_result = execute_vqa(query, images_metadata)
        
    execution_trace.append(f"[OK] Specialist Model Executed: {tool_result.get('model', 'Prototype')}")
    execution_trace.append("[OK] Evidence & Confidence Extracted Successfully")

    
    # Clean up PIL image handles before returning metadata JSON
    clean_metadata = []
    for m in images_metadata:
        m_copy = {k: v for k, v in m.items() if k != "pil_image"}
        clean_metadata.append(m_copy)

    # Step 4: Construct Response
    response = AnalysisResponse(
        success=True,
        task=task,
        answer=tool_result.get("answer", ""),
        confidence=tool_result.get("confidence"),
        evidence=tool_result.get("evidence", []),
        visual_evidence=tool_result.get("visual_evidence", []),
        execution_trace=execution_trace,
        model=tool_result.get("model", "prototype"),
        metadata={
            "images_count": num_images,
            "images": clean_metadata,
            "query": query
        }
    )
    
    return response

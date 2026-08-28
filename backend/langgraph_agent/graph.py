"""
LangGraph StateGraph definition for SatQuery AI.

Builds and compiles the 5-node agentic pipeline:
    classify_input → understand_query → plan_task → dispatch_tool → build_response

Exports:
    run_langgraph_agent(query, images_metadata) -> AnalysisResponse
"""

import sys
import os

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from langgraph.graph import StateGraph, END

from .state import AgentState
from .nodes import (
    classify_input_node,
    understand_query_node,
    plan_task_node,
    dispatch_tool_node,
    build_response_node,
)
from schemas import AnalysisResponse


# ─────────────────────────────────────────────────────────────────────────────
# Build the LangGraph StateGraph
# ─────────────────────────────────────────────────────────────────────────────

def _build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    # Register nodes
    graph.add_node("classify_input",   classify_input_node)
    graph.add_node("understand_query", understand_query_node)
    graph.add_node("plan_task",        plan_task_node)
    graph.add_node("dispatch_tool",    dispatch_tool_node)
    graph.add_node("build_response",   build_response_node)

    # Linear edges (no branching needed — routing is inside plan_task + dispatch_tool)
    graph.set_entry_point("classify_input")
    graph.add_edge("classify_input",   "understand_query")
    graph.add_edge("understand_query", "plan_task")
    graph.add_edge("plan_task",        "dispatch_tool")
    graph.add_edge("dispatch_tool",    "build_response")
    graph.add_edge("build_response",   END)

    return graph.compile()


# Compile once at import time
_compiled_graph = _build_graph()


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────────────────────

def run_langgraph_agent(query: str, images_metadata: list) -> AnalysisResponse:
    """
    Main agentic entry point using LangGraph.

    Args:
        query           : Natural language query from the user
        images_metadata : List of preprocessed image metadata dicts

    Returns:
        AnalysisResponse Pydantic model
    """
    # Seed the initial state
    initial_state: AgentState = {
        "query": query,
        "images_metadata": images_metadata,
        # Defaults — will be overwritten by nodes
        "image_type": "single",
        "modality": "optical",
        "num_images": len(images_metadata),
        "intent": "vqa",
        "intent_confidence": 0.0,
        "intent_reasoning": "",
        "task": "vqa",
        "model_plan": "",
        "tool_result": {},
        "execution_trace": [f"[LangGraph] ▶ Agent started — query='{query}', images={len(images_metadata)}"],
        "errors": [],
    }

    # Run the graph
    final_state: AgentState = _compiled_graph.invoke(initial_state)

    tool_result = final_state.get("tool_result", {})

    # Strip non-serializable PIL image handles from metadata
    clean_metadata = []
    for m in images_metadata:
        clean_metadata.append({k: v for k, v in m.items() if k != "pil_image"})

    return AnalysisResponse(
        success=True,
        task=final_state.get("task", "vqa"),
        image_type=final_state.get("image_type", "single"),
        intent=final_state.get("intent", "vqa"),
        answer=tool_result.get("answer", "No answer generated."),
        confidence=tool_result.get("confidence"),
        evidence=tool_result.get("evidence", []),
        visual_evidence=tool_result.get("visual_evidence", []),
        execution_trace=final_state.get("execution_trace", []),
        model=tool_result.get("model", "LangGraph Agent"),
        metadata={
            "images_count": len(images_metadata),
            "images": clean_metadata,
            "query": query,
            "image_type": final_state.get("image_type"),
            "intent": final_state.get("intent"),
            "intent_confidence": final_state.get("intent_confidence"),
            "intent_reasoning": final_state.get("intent_reasoning"),
            "model_plan": final_state.get("model_plan"),
            "errors": final_state.get("errors", []),
        }
    )

"""
LangGraph Agentic Agent Package for SatQuery AI.

Exports:
    run_langgraph_agent(query, images_metadata) -> AnalysisResponse

Architecture:
    Node 1: classify_input   → image_type (single | bi-temporal | optical_sar)
    Node 2: understand_query → intent (what_changed | describe | detect | vqa | ground)
    Node 3: plan_task        → task + model_plan
    Node 4: dispatch_tool    → executes the correct specialist pipeline
    Node 5: build_response   → assembles AnalysisResponse
"""

from .graph import run_langgraph_agent

__all__ = ["run_langgraph_agent"]

"""
LangGraph Node Implementations for SatQuery AI.

Node 1: classify_input_node   â€” deterministic image type + modality detection
Node 2: understand_query_node â€” LLM-powered NL intent parser (Gemini â†’ Groq â†’ keyword fallback)
Node 3: plan_task_node        â€” combines image_type + intent â†’ task + model_plan
Node 4: dispatch_tool_node    â€” routes to the correct specialist tool executor
Node 5: build_response_node   â€” assembles the final AnalysisResponse
"""

import sys
import os
import json

# Add backend root to path (when running from backend/)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from .state import AgentState
from tools.vqa import execute_vqa
from tools.captioning import execute_captioning
from tools.grounding import execute_grounding
from tools.change_analysis import execute_change_analysis
from tools.optical_sar import execute_optical_sar


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# NODE 1: Input Classifier
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def classify_input_node(state: AgentState) -> AgentState:
    """
    Deterministically classifies the uploaded images into:
      image_type : "single" | "bi-temporal" | "optical_sar"
      modality   : "optical" | "sar" | "both" | "unknown"

    Logic:
      - 1 image â†’ single
      - 2 images:
          * one has 2 channels (SAR VV/VH .npy) and other has 12 channels (optical .npy)
            â†’ optical_sar
          * both have similar channel counts, or both RGB
            â†’ bi-temporal
    """
    trace = list(state.get("execution_trace", []))
    trace.append("[LangGraph] Node 1 â€” Input Classifier: Starting image type detection")

    images_metadata = state.get("images_metadata", [])
    num_images = len(images_metadata)

    image_type = "single"
    modality = "optical"

    if num_images == 0:
        image_type = "single"
        modality = "unknown"
        trace.append("[LangGraph] Node 1 â€” No images provided.")
    elif num_images == 1:
        meta = images_metadata[0]
        channels = meta.get("channels", 3)
        fmt = meta.get("format", "")
        if "NPY" in fmt and channels == 2:
            modality = "sar"
        elif "NPY" in fmt and channels >= 12:
            modality = "optical"
        else:
            modality = "optical"
        image_type = "single"
        trace.append(f"[LangGraph] Node 1 â€” Single image detected: {channels}ch, format={fmt}, modality={modality}")
    else:
        # 2+ images
        meta0 = images_metadata[0]
        meta1 = images_metadata[1]
        ch0 = meta0.get("channels", 3)
        ch1 = meta1.get("channels", 3)
        fmt0 = meta0.get("format", "")
        fmt1 = meta1.get("format", "")

        # Detect SAR by 2-channel .npy
        is_sar_0 = ("NPY" in fmt0 and ch0 == 2)
        is_sar_1 = ("NPY" in fmt1 and ch1 == 2)
        is_optical_npy_0 = ("NPY" in fmt0 and ch0 >= 12)
        is_optical_npy_1 = ("NPY" in fmt1 and ch1 >= 12)

        if (is_sar_0 and is_optical_npy_1) or (is_sar_1 and is_optical_npy_0):
            image_type = "optical_sar"
            modality = "both"
            trace.append(f"[LangGraph] Node 1 â€” Optical+SAR pair detected: img0={ch0}ch, img1={ch1}ch")
        else:
            image_type = "bi-temporal"
            modality = "optical"
            trace.append(f"[LangGraph] Node 1 â€” Bi-temporal pair detected: img0={ch0}ch ({fmt0}), img1={ch1}ch ({fmt1})")

    trace.append(f"[LangGraph] Node 1 â†’ image_type='{image_type}', modality='{modality}', num_images={num_images}")

    return {
        **state,
        "image_type": image_type,
        "modality": modality,
        "num_images": num_images,
        "execution_trace": trace,
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# NODE 2: Query Understander
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def _build_intent_prompt(query: str, image_type: str, num_images: int) -> str:
    return f"""You are an expert remote sensing AI assistant.

Given a user's natural language query about satellite imagery, classify the INTENT into exactly ONE of:

  - "what_changed"  : user wants to detect/describe temporal changes between two images
  - "describe"      : user wants a scene description, caption, or overview
  - "detect"        : user wants to detect, locate, or find specific objects/features (buildings, roads, etc.)
  - "ground"        : user wants to highlight, segment, or draw a bounding box around a feature
  - "vqa"           : user wants a direct factual question answered about the image

Context:
  - image_type: {image_type}
  - num_images: {num_images}
  - query: "{query}"

Rules:
  - If image_type is "bi-temporal" or "optical_sar" and the query mentions change/difference/before/after â†’ "what_changed"
  - If query mentions describe/caption/summary/overview/what is â†’ "describe"
  - If query mentions highlight/locate/segment/box/find/where â†’ "ground"
  - If query mentions detect/identify/road/building/count â†’ "detect"
  - Otherwise â†’ "vqa"

Respond ONLY with a valid JSON object, no markdown, no explanation:
{{"intent": "<one of the 5 intents>", "confidence": <0.0-1.0>, "reasoning": "<one sentence>"}}"""


def _parse_intent_json(raw: str) -> dict:
    """Extract JSON from LLM response, handling markdown code fences."""
    raw = raw.strip()
    if "```" in raw:
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        return json.loads(raw)
    except Exception:
        return {}


def _llm_understand_intent(query: str, image_type: str, num_images: int) -> dict:
    """
    Try LLM providers in order: Gemini â†’ Groq â†’ OpenAI â†’ fallback.
    Returns {"intent": str, "confidence": float, "reasoning": str}.
    """
    import importlib

    prompt = _build_intent_prompt(query, image_type, num_images)

    # â”€â”€ Attempt 1: Google Gemini â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try:
        from config import config
        if config.GEMINI_API_KEY:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=config.GEMINI_API_KEY,
                temperature=0.0,
            )
            response = llm.invoke(prompt)
            parsed = _parse_intent_json(response.content)
            if parsed.get("intent"):
                parsed["provider"] = "Gemini-1.5-Flash"
                return parsed
    except Exception as e:
        pass  # Fall through to next provider

    # â”€â”€ Attempt 2: Groq (LLaMA-3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try:
        from config import config
        if config.GROQ_API_KEY:
            from langchain_groq import ChatGroq
            llm = ChatGroq(
                model="llama3-8b-8192",
                api_key=config.GROQ_API_KEY,
                temperature=0.0,
            )
            response = llm.invoke(prompt)
            parsed = _parse_intent_json(response.content)
            if parsed.get("intent"):
                parsed["provider"] = "Groq-LLaMA3-8B"
                return parsed
    except Exception:
        pass

    # â”€â”€ Attempt 3: OpenAI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    try:
        from config import config
        if config.OPENAI_API_KEY:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(
                model="gpt-4o-mini",
                api_key=config.OPENAI_API_KEY,
                temperature=0.0,
            )
            response = llm.invoke(prompt)
            parsed = _parse_intent_json(response.content)
            if parsed.get("intent"):
                parsed["provider"] = "GPT-4o-mini"
                return parsed
    except Exception:
        pass

    # â”€â”€ Fallback: Deterministic keyword rules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return None


def _keyword_fallback_intent(query: str, image_type: str) -> dict:
    """Robust keyword-based intent parser used when no LLM is available."""
    q = query.lower().strip()
    if image_type in ("bi-temporal", "optical_sar") and any(
        w in q for w in ["changed", "change", "difference", "before", "after", "temporal", "compare"]
    ):
        return {"intent": "what_changed", "confidence": 0.85, "reasoning": "Keyword match: bi-temporal + change terms", "provider": "keyword-fallback"}
    elif any(w in q for w in ["describe", "caption", "summary", "overview", "what is in", "tell me about"]):
        return {"intent": "describe", "confidence": 0.85, "reasoning": "Keyword match: description terms", "provider": "keyword-fallback"}
    elif any(w in q for w in ["highlight", "segment", "box", "bounding", "draw", "outline"]):
        return {"intent": "ground", "confidence": 0.80, "reasoning": "Keyword match: grounding terms", "provider": "keyword-fallback"}
    elif any(w in q for w in ["detect", "locate", "find", "where is", "how many", "count", "identify road", "identify building"]):
        return {"intent": "detect", "confidence": 0.80, "reasoning": "Keyword match: detection terms", "provider": "keyword-fallback"}
    else:
        return {"intent": "vqa", "confidence": 0.75, "reasoning": "Default: general VQA question", "provider": "keyword-fallback"}


def understand_query_node(state: AgentState) -> AgentState:
    """
    Parses the natural language query intent using an LLM (Gemini/Groq/OpenAI)
    with graceful keyword-based fallback when no API key is configured.
    """
    trace = list(state.get("execution_trace", []))
    trace.append("[LangGraph] Node 2 â€” Query Understander: Parsing NL intent...")

    query = state.get("query", "")
    image_type = state.get("image_type", "single")
    num_images = state.get("num_images", 1)

    # Try LLM first
    result = _llm_understand_intent(query, image_type, num_images)

    if result and result.get("intent"):
        provider = result.get("provider", "LLM")
        trace.append(f"[LangGraph] Node 2 â€” LLM ({provider}) parsed intent: '{result['intent']}' (confidence={result.get('confidence', 0):.2f})")
        trace.append(f"[LangGraph] Node 2 â€” Reasoning: {result.get('reasoning', '')}")
    else:
        result = _keyword_fallback_intent(query, image_type)
        trace.append(f"[LangGraph] Node 2 â€” Keyword fallback intent: '{result['intent']}' (no LLM API key configured)")

    valid_intents = {"what_changed", "describe", "detect", "vqa", "ground"}
    intent = result.get("intent", "vqa")
    if intent not in valid_intents:
        intent = "vqa"

    trace.append(f"[LangGraph] Node 2 â†’ intent='{intent}', confidence={result.get('confidence', 0):.2f}")

    return {
        **state,
        "intent": intent,
        "intent_confidence": float(result.get("confidence", 0.75)),
        "intent_reasoning": result.get("reasoning", ""),
        "execution_trace": trace,
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# NODE 3: Task Planner
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

# Decision table: (image_type, intent) â†’ (task, model_plan)
_PLAN_TABLE = {
    # Bi-temporal + change â†’ ChangeTransformer
    ("bi-temporal", "what_changed"): (
        "change_analysis",
        "BIT/ChangeFormer Bi-Temporal Transformer (Colab GPU) | CPU pixel-diff fallback"
    ),
    # Optical+SAR pair â†’ CROMA fusion regardless of intent
    ("optical_sar", "what_changed"): (
        "optical_sar",
        "CROMA Cross-Modal Fusion (Colab GPU) | PIL false-color fallback"
    ),
    ("optical_sar", "describe"): (
        "optical_sar",
        "CROMA Cross-Modal Fusion (Colab GPU) | PIL false-color fallback"
    ),
    ("optical_sar", "vqa"): (
        "optical_sar",
        "CROMA Cross-Modal Fusion (Colab GPU) | PIL false-color fallback"
    ),
    ("optical_sar", "detect"): (
        "optical_sar",
        "CROMA Cross-Modal Fusion (Colab GPU) | PIL false-color fallback"
    ),
    ("optical_sar", "ground"): (
        "optical_sar",
        "CROMA Cross-Modal Fusion (Colab GPU) | PIL false-color fallback"
    ),
    # Single image intents
    ("single", "describe"): (
        "captioning",
        "RSICD-Captioner-V2 / LLaVA-1.5-7B Scene Description"
    ),
    ("single", "ground"): (
        "grounding",
        "RS-Grounding-GeoChat Text-Guided Visual ROI"
    ),
    ("single", "detect"): (
        "grounding",
        "RS-Grounding-GeoChat Object Detection + ROI"
    ),
    ("single", "vqa"): (
        "vqa",
        "LLaVA-1.5-7B VQA (Colab GPU) | RS-VQA keyword fallback"
    ),
    ("single", "what_changed"): (
        "change_analysis",
        "Single image baseline â€” please upload T1+T2 pair for full change detection"
    ),
    # Bi-temporal with non-change intents â†’ still do change analysis (2 images â†’ compare)
    ("bi-temporal", "describe"): (
        "change_analysis",
        "BIT/ChangeFormer Bi-Temporal Change Description"
    ),
    ("bi-temporal", "vqa"): (
        "change_analysis",
        "BIT/ChangeFormer Bi-Temporal VQA"
    ),
    ("bi-temporal", "detect"): (
        "change_analysis",
        "BIT/ChangeFormer Change Region Detection"
    ),
    ("bi-temporal", "ground"): (
        "change_analysis",
        "BIT/ChangeFormer Change Localization + Grounding"
    ),
}


def plan_task_node(state: AgentState) -> AgentState:
    """
    Combines image_type + intent â†’ selects pipeline (task) and model_plan.
    Pure deterministic logic â€” the LLM already handled ambiguity in Node 2.
    """
    trace = list(state.get("execution_trace", []))
    trace.append("[LangGraph] Node 3 â€” Task Planner: Selecting pipeline...")

    image_type = state.get("image_type", "single")
    intent = state.get("intent", "vqa")

    key = (image_type, intent)
    task, model_plan = _PLAN_TABLE.get(key, ("vqa", "LLaVA-1.5-7B VQA (default fallback)"))

    trace.append(f"[LangGraph] Node 3 â€” Decision: ({image_type}, {intent}) â†’ task='{task}'")
    trace.append(f"[LangGraph] Node 3 â€” Model Plan: {model_plan}")

    return {
        **state,
        "task": task,
        "model_plan": model_plan,
        "execution_trace": trace,
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# NODE 4: Tool Dispatcher
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def dispatch_tool_node(state: AgentState) -> AgentState:
    """
    Dispatches to the correct specialist tool based on state["task"].
    Passes query + images_metadata to the tool and stores the result.
    """
    trace = list(state.get("execution_trace", []))
    errors = list(state.get("errors", []))

    task = state.get("task", "vqa")
    query = state.get("query", "")
    images_metadata = state.get("images_metadata", [])

    _TOOL_LABELS = {
        "vqa": "VQA (Visual Question Answering) â€” LLaVA-1.5-7B",
        "captioning": "Scene Captioning â€” RSICD-Captioner-V2",
        "grounding": "Text-Guided Visual Grounding â€” RS-GeoChat",
        "change_analysis": "Bi-Temporal Change Analysis â€” BIT/ChangeFormer Transformer",
        "optical_sar": "Optical+SAR Cross-Modal Fusion â€” CROMA",
    }

    label = _TOOL_LABELS.get(task, task.upper())
    trace.append(f"[LangGraph] Node 4 â€” Dispatching to: {label}")

    try:
        if task == "vqa":
            tool_result = execute_vqa(query, images_metadata)
        elif task == "captioning":
            tool_result = execute_captioning(query, images_metadata)
        elif task == "grounding":
            tool_result = execute_grounding(query, images_metadata)
        elif task == "change_analysis":
            tool_result = execute_change_analysis(query, images_metadata)
        elif task == "optical_sar":
            tool_result = execute_optical_sar(query, images_metadata)
        else:
            trace.append(f"[LangGraph] Node 4 â€” Unknown task '{task}', falling back to VQA")
            tool_result = execute_vqa(query, images_metadata)

        trace.append(f"[LangGraph] Node 4 â€” Tool executed successfully: {tool_result.get('model', 'N/A')}")
        trace.append(f"[LangGraph] Node 4 â€” Confidence: {tool_result.get('confidence', 'N/A')}")

    except Exception as e:
        error_msg = f"Tool execution error in '{task}': {str(e)}"
        errors.append(error_msg)
        trace.append(f"[LangGraph] Node 4 â€” ERROR: {error_msg}")
        tool_result = {
            "answer": f"Tool execution encountered an error: {str(e)}. Please check your input and try again.",
            "confidence": 0.0,
            "evidence": ["Error during tool execution"],
            "visual_evidence": [],
            "model": "Error",
        }

    return {
        **state,
        "tool_result": tool_result,
        "execution_trace": trace,
        "errors": errors,
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# NODE 5: Response Builder
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def build_response_node(state: AgentState) -> AgentState:
    """
    Finalizes the execution trace and prepares state for AnalysisResponse construction.
    Does NOT construct AnalysisResponse directly â€” the graph runner does that
    so it can use the Pydantic model cleanly.
    """
    trace = list(state.get("execution_trace", []))
    trace.append("[LangGraph] Node 5 â€” Response Builder: Assembling final response")
    trace.append(f"[LangGraph] âœ“ Pipeline Complete â€” task='{state.get('task')}', intent='{state.get('intent')}', image_type='{state.get('image_type')}'")

    errors = state.get("errors", [])
    if errors:
        for err in errors:
            trace.append(f"[LangGraph] âš  Warning: {err}")

    return {
        **state,
        "execution_trace": trace,
    }

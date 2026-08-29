"""
Captioning / Scene Description Specialist Tool.
Generates comprehensive descriptions of Earth Observation imagery.
Supports RGB satellite imagery and BigEarthNet 12-band multi-spectral patches (.npy).

Since Qwen2-VL handles both VQA and detailed scene captioning exceptionally well,
this tool acts as a transparent router to the execute_vqa pipeline.
"""
from tools.vqa import execute_vqa

def execute_captioning(query: str, images_metadata: list) -> dict:
    """
    Routes captioning requests to the primary Qwen2-VL pipeline.
    """
    # Overwrite the generic captioning tool name so the UI reflects the true model being used
    result = execute_vqa(query, images_metadata)
    result["tool_name"] = "RS Captioning Specialist Tool"
    return result

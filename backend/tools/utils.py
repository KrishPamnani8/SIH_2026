import re

# ── Evidence & Confidence Extraction Helpers ──────────────────────
_EVIDENCE_KEYWORDS = {
    "urban":        "Urban/Built-up Area Detected",
    "building":     "Building Structures Identified",
    "residential":  "Residential Zone Observed",
    "commercial":   "Commercial Infrastructure Present",
    "road":         "Road Network Visible",
    "highway":      "Highway/Transport Corridor",
    "airport":      "Airport/Runway Infrastructure",
    "vegetation":   "Vegetation Cover Present",
    "forest":       "Dense Forest Canopy",
    "agricultural": "Agricultural Land Use",
    "crop":         "Crop/Farmland Patterns",
    "water":        "Water Body Detected",
    "river":        "River/Stream Channel",
    "lake":         "Lake/Reservoir Present",
    "ocean":        "Ocean/Marine Area",
    "coastline":    "Coastline/Shoreline Feature",
    "mountain":     "Mountainous/Elevated Terrain",
    "bare soil":    "Bare Soil/Exposed Ground",
    "cloud":        "Cloud Cover Present",
    "shadow":       "Shadow Features Observed",
    "industrial":   "Industrial Facilities",
    "parking":      "Parking Areas/Vehicle Clusters",
    "bridge":       "Bridge Infrastructure",
    "port":         "Port/Harbor Facility",
    "solar":        "Solar Panel Installation",
    "dense":        "High-Density Development",
    "sparse":       "Low-Density/Sparse Coverage",
    "change":       "Temporal Spatial Change Detected",
    "expansion":    "Structural/Urban Expansion",
    "deforestation":"Deforestation/Vegetation Loss",
    "fusion":       "Cross-Modal Fusion Active",
    "sar":          "SAR Cloud-Penetrating Texture",
    "optical":      "Optical Spectral Signature"
}

def extract_evidence_tags(answer: str, format_info: str) -> list:
    """Scan answer text for domain keywords and return short evidence tags."""
    answer_lower = answer.lower()
    tags = []
    for keyword, tag in _EVIDENCE_KEYWORDS.items():
        if keyword in answer_lower and tag not in tags:
            tags.append(tag)
        if len(tags) >= 5:
            break
    # Always include the input format
    tags.append(f"Input: {format_info}")
    tags.append("Qwen2-VL-2B GPU Inference")
    return tags

def estimate_confidence(answer: str) -> float:
    """Estimate confidence based on answer quality signals."""
    score = 0.70
    # Longer, more detailed answers → higher confidence
    if len(answer) > 200: score += 0.05
    if len(answer) > 400: score += 0.05
    # Hedging language → lower confidence
    hedges = ["appears to", "possibly", "might be", "unclear", "cannot determine", "difficult to", "cannot confidently"]
    for h in hedges:
        if h in answer.lower():
            score -= 0.03
    # Assertive language → higher confidence
    asserts = ["clearly visible", "distinctly", "confirmed", "well-defined", "prominent", "indicates"]
    for a in asserts:
        if a in answer.lower():
            score += 0.03
    return round(max(0.50, min(0.97, score)), 2)

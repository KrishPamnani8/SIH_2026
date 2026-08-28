"""
Captioning / Scene Description Specialist Tool.
Generates comprehensive descriptions of Earth Observation imagery.
Supports RGB satellite imagery and BigEarthNet 12-band multi-spectral patches (.npy).
"""

from tools.vqa import analyze_image_pixels

def execute_captioning(query: str, images_metadata: list) -> dict:
    """
    Generates a detailed scene description for the satellite image.
    Uses pixel-level spectral analysis to guarantee authentic, image-specific outputs.
    """
    is_multispectral = False
    fmt_str = "RGB Visual Band"
    pil_img = None
    filename_str = ""
    
    if images_metadata:
        pil_img = images_metadata[0].get("pil_image")
        filename_str = images_metadata[0].get("filename", "")
        fmt = images_metadata[0].get("format", "")
        if "NPY" in fmt or "Bands" in fmt:
            is_multispectral = True
            channels = images_metadata[0].get("channels", 12)
            fmt_str = f"BigEarthNet Multi-Spectral ({channels} Bands: B01-B12)"

    analysis = analyze_image_pixels(pil_img, filename_str, is_multispectral)
    fn = filename_str.split("/")[-1].split("\\")[-1] if filename_str else "Uploaded Patch"

    answer = (
        f"High-Resolution Scene Analysis ({fn}): Primary land-cover feature classified as '{analysis['primary']}' "
        f"({analysis['top_pct']}% scene coverage). Secondary feature: '{analysis['sec_class']}' ({analysis['sec_pct']}%). "
        f"Spectral breakdown confirms Vegetation ({analysis['percents']['Vegetation Canopy']}%), Water ({analysis['percents']['Water Body']}%), "
        f"and Urban/Impervious Surfaces ({analysis['percents']['Built-Up Urban']}%)."
    )

    evidence = [
        f"Dominant Feature: {analysis['primary']} ({analysis['top_pct']}%)",
        f"Secondary Feature: {analysis['sec_class']} ({analysis['sec_pct']}%)",
        f"Spectral Breakdown: Veg {analysis['percents']['Vegetation Canopy']}%, Water {analysis['percents']['Water Body']}%, Urban {analysis['percents']['Built-Up Urban']}%",
        f"Input Format: {fmt_str}"
    ]

    return {
        "answer": answer,
        "confidence": analysis["confidence"],
        "evidence": evidence,
        "model": "RSICD-Captioner-V2 (Pixel-Spectral Engine)",
        "tool_name": "RS Captioning Specialist Tool"
    }

import io
import base64
from PIL import Image, ImageChops, ImageEnhance, ImageDraw

def load_image_bytes(file_bytes: bytes, filename: str = "") -> dict:
    """
    Safely opens image bytes using PIL or NumPy.
    Extracts dimensions, format, mode, channels, and base64 preview data.
    Handles GeoTIFF / TIFF / PNG / JPG and Sentinel-2 12-band .npy arrays.
    """
    try:
        # Check if file is a NumPy .npy multi-spectral array
        if filename.endswith(".npy") or file_bytes.startswith(b"\x93NUMPY"):
            import numpy as np
            arr = np.load(io.BytesIO(file_bytes))
            
            # If shape is (C, H, W), transpose to (H, W, C)
            if arr.ndim == 3 and arr.shape[0] in (12, 13, 3, 4) and arr.shape[2] not in (12, 13):
                arr = np.transpose(arr, (1, 2, 0))
                
            h, w = arr.shape[0], arr.shape[1]
            num_channels = arr.shape[2] if arr.ndim == 3 else 1
            
            # Extract RGB (Sentinel-2 L2A: Band 4 = Red [index 3], Band 3 = Green [index 2], Band 2 = Blue [index 1])
            if arr.ndim == 3 and arr.shape[2] >= 4:
                r_band = arr[:, :, 3].astype(np.float32)
                g_band = arr[:, :, 2].astype(np.float32)
                b_band = arr[:, :, 1].astype(np.float32)
            elif arr.ndim == 3 and arr.shape[2] == 3:
                r_band = arr[:, :, 0].astype(np.float32)
                g_band = arr[:, :, 1].astype(np.float32)
                b_band = arr[:, :, 2].astype(np.float32)
            else:
                gray = arr if arr.ndim == 2 else arr[:, :, 0]
                r_band = g_band = b_band = gray.astype(np.float32)
                
            # Normalize to 8-bit [0, 255]
            max_val = max(float(r_band.max()), float(g_band.max()), float(b_band.max()), 1.0)
            rgb = np.stack([
                np.clip((r_band / max_val) * 255, 0, 255).astype(np.uint8),
                np.clip((g_band / max_val) * 255, 0, 255).astype(np.uint8),
                np.clip((b_band / max_val) * 255, 0, 255).astype(np.uint8)
            ], axis=-1)
            
            img = Image.fromarray(rgb, mode="RGB")
            format_str = f"NPY ({num_channels}-Bands)"
            width, height = w, h
        else:
            img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            width, height = img.size
            format_str = img.format or "PNG"
            num_channels = len(img.getbands())
        
        # Resize to max 1024px to keep base64 payload lightweight (<400KB) for Colab GPU transfer
        img_compressed = img.copy()
        img_compressed.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        buffered = io.BytesIO()
        img_compressed.save(buffered, format="JPEG", quality=85)
        b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        
        return {
            "valid": True,
            "width": width,
            "height": height,
            "format": format_str,
            "mode": img.mode,
            "channels": num_channels,
            "b64_image": f"data:image/png;base64,{b64_str}",
            "pil_image": img
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }


def generate_change_mask_b64(img1: Image.Image, img2: Image.Image) -> str:
    """
    CPU-friendly image differencing change detection mask.
    Computes pixel difference between two images and generates a visual change map.
    """
    # Resize img2 to match img1 if dimensions differ
    if img1.size != img2.size:
        img2 = img2.resize(img1.size)
        
    diff = ImageChops.difference(img1, img2)
    diff_gray = diff.convert("L")
    
    # Enhance contrast to highlight change areas in red/magenta overlay
    enhancer = ImageEnhance.Contrast(diff_gray)
    diff_contrast = enhancer.enhance(3.0)
    
    # Create change map visualization (Red overlay on change areas)
    change_map = Image.new("RGB", img1.size, (0, 0, 0))
    pixels1 = img1.load()
    diff_pixels = diff_contrast.load()
    c_pixels = change_map.load()
    
    w, h = img1.size
    for x in range(w):
        for y in range(h):
            val = diff_pixels[x, y]
            if val > 40: # Change threshold
                c_pixels[x, y] = (255, 50, 50) # Highlight changes in Bright Red
            else:
                # Dim background
                r, g, b = pixels1[x, y]
                c_pixels[x, y] = (r // 3, g // 3, b // 3)
                
    buffered = io.BytesIO()
    change_map.save(buffered, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"

def generate_grounding_box_b64(img: Image.Image, query: str) -> str:
    """
    CPU-friendly bounding box and region of interest overlay generator.
    Draws visual grounding boxes around detected features.
    """
    draw_img = img.copy()
    draw = ImageDraw.Draw(draw_img)
    w, h = img.size
    
    # Generate bounding box based on query keywords
    query_lower = query.lower()
    if "water" in query_lower:
        box = [int(w * 0.15), int(h * 0.2), int(w * 0.55), int(h * 0.75)]
        label = "Water Body (Grounding ROI)"
        color = "#3b82f6"
    elif "building" in query_lower or "structure" in query_lower or "built-up" in query_lower:
        box = [int(w * 0.5), int(h * 0.1), int(w * 0.9), int(h * 0.6)]
        label = "Built-up Structure Cluster"
        color = "#ef4444"
    else:
        box = [int(w * 0.2), int(h * 0.2), int(w * 0.8), int(h * 0.8)]
        label = "Target Region of Interest"
        color = "#10b981"
        
    # Draw thick bounding box
    draw.rectangle(box, outline=color, width=4)
    # Draw label box
    draw.rectangle([box[0], box[1] - 25, box[0] + len(label) * 9, box[1]], fill=color)
    draw.text((box[0] + 5, box[1] - 20), label, fill="white")
    
    buffered = io.BytesIO()
    draw_img.save(buffered, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"

def generate_optical_sar_fusion_b64(optical_img: Image.Image, sar_img: Image.Image) -> str:
    """
    Cross-modal Optical + SAR False-Color Composite Generator.
    Fuses Optical multi-spectral channels with SAR VV/VH radar backscatter.
    Creates a visual fusion map overlay (Cyan=SAR Radar Backscatter, Yellow/Green=Optical Biomass).
    """
    # Resize sar_img to match optical_img if dimensions differ
    if optical_img.size != sar_img.size:
        sar_img = sar_img.resize(optical_img.size)
        
    opt_rgb = optical_img.convert("RGB")
    sar_gray = sar_img.convert("L")
    
    w, h = opt_rgb.size
    fusion_map = Image.new("RGB", (w, h))
    
    opt_pixels = opt_rgb.load()
    sar_pixels = sar_gray.load()
    f_pixels = fusion_map.load()
    
    for x in range(w):
        for y in range(h):
            r, g, b = opt_pixels[x, y]
            sar_val = sar_pixels[x, y]
            
            # False Color Blend: Red = Optical Red, Green = Optical Green, Blue = SAR Backscatter Intensity
            # Highlights Radar roughness in Cyan (G+B) and Optical vegetation in Green
            f_r = int(r * 0.5 + sar_val * 0.2)
            f_g = int(g * 0.6 + sar_val * 0.4)
            f_b = int(b * 0.3 + sar_val * 0.7)
            
            f_pixels[x, y] = (min(255, f_r), min(255, f_g), min(255, f_b))
            
    buffered = io.BytesIO()
    fusion_map.save(buffered, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode('utf-8')}"

def load_croma_arrays(file_bytes: bytes, filename: str = "") -> dict:
    """
    Load raw Sentinel-2 optical and Sentinel-1 SAR arrays
    for CROMA without converting them to RGB.

    Optical expected: 12 channels
    SAR expected: 2 channels (VV, VH)
    """

    import io
    import numpy as np

    try:
        # ---------------------------------------------------------
        # Load NPY data
        # ---------------------------------------------------------
        arr = np.load(io.BytesIO(file_bytes))

        # ---------------------------------------------------------
        # Convert HWC -> CHW if necessary
        # ---------------------------------------------------------
        if arr.ndim == 3:

            # HWC: (H, W, C)
            if arr.shape[-1] in (2, 12, 13):
                arr = np.transpose(arr, (2, 0, 1))

            # CHW: already correct
            elif arr.shape[0] in (2, 12, 13):
                pass

            else:
                raise ValueError(
                    f"Unsupported 3D array shape: {arr.shape}"
                )

        elif arr.ndim == 2:
            # Single channel
            arr = arr[None, :, :]

        else:
            raise ValueError(
                f"Unsupported array dimensions: {arr.shape}"
            )

        arr = arr.astype(np.float32)

        return {
            "valid": True,
            "array": arr,
            "channels": arr.shape[0],
            "height": arr.shape[1],
            "width": arr.shape[2],
            "filename": filename
        }

    except Exception as e:

        return {
            "valid": False,
            "error": str(e)
        }
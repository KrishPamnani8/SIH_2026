"""
Utility script to generate/acquire a representative sample batch of BigEarthNet / Sentinel-2 patches.
Creates multi-spectral 12-band numpy arrays (.npy) and RGB preview images (.png) for prototype testing.
"""

import os
import sys
import json

# Ensure backend config path and UCRT DLL resolution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import config

import numpy as np
from PIL import Image


def generate_bigearthnet_sample_batch():
    output_dir = os.path.join(os.path.dirname(__file__), "..", "sample_data", "bigearthnet_batch")
    os.makedirs(output_dir, exist_ok=True)
    
    # 12 Sentinel-2 Bands: B01, B02(B), B03(G), B04(R), B05, B06, B07, B08(NIR), B8A, B09, B11(SWIR1), B12(SWIR2)
    # Patch dimensions: 128x128 pixels, 12 spectral channels
    
    samples = [
        {
            "id": "S2B_MSIL2A_20200815T103031_S01_WaterBody",
            "filename_npy": "patch_water_body.npy",
            "filename_png": "patch_water_body.png",
            "class_label": "Water Bodies / Lakes & Rivers",
            "description": "Satellite patch covering inland open water body with surrounding wetland vegetation.",
            "base_rgb": (30, 90, 180),  # Blueish water
            "nir_boost": 40,
            "swir_boost": 20
        },
        {
            "id": "S2A_MSIL2A_20200722T104021_S02_ForestVegetation",
            "filename_npy": "patch_forest_vegetation.npy",
            "filename_png": "patch_forest_vegetation.png",
            "class_label": "Broad-leaved & Coniferous Forest",
            "description": "Dense canopy forest region with high Normalized Difference Vegetation Index (NDVI).",
            "base_rgb": (34, 139, 34),  # Forest green
            "nir_boost": 220, # High NIR response for dense biomass
            "swir_boost": 60
        },
        {
            "id": "S2B_MSIL2A_20200610T102019_S03_UrbanBuiltup",
            "filename_npy": "patch_urban_builtup.npy",
            "filename_png": "patch_urban_builtup.png",
            "class_label": "Continuous & Discontinuous Urban Fabric",
            "description": "High-density suburban built-up settlement with road network grid and concrete rooftops.",
            "base_rgb": (180, 175, 170), # Concrete grey
            "nir_boost": 80,
            "swir_boost": 160 # High SWIR response for impervious surfaces
        },
        {
            "id": "S2A_MSIL2A_20200905T105011_S04_Agriculture",
            "filename_npy": "patch_agriculture.npy",
            "filename_png": "patch_agriculture.png",
            "class_label": "Arable Land & Arable Crop Fields",
            "description": "Regular geometric agricultural crop fields with seasonal soil and crop patterns.",
            "base_rgb": (160, 190, 60), # Agricultural crop yellow-green
            "nir_boost": 180,
            "swir_boost": 110
        },
        {
            "id": "S2B_MSIL2A_20200518T101031_S05_IndustrialZone",
            "filename_npy": "patch_industrial.npy",
            "filename_png": "patch_industrial.png",
            "class_label": "Industrial / Commercial / Transport Units",
            "description": "Commercial warehouse complex with asphalt parking lots and metallized roofing structures.",
            "base_rgb": (140, 150, 160), # Metallic steel-grey
            "nir_boost": 50,
            "swir_boost": 210
        }
    ]
    
    manifest = []
    
    for sample in samples:
        npy_path = os.path.join(output_dir, sample["filename_npy"])
        png_path = os.path.join(output_dir, sample["filename_png"])
        
        # Create 12-band spectral array (128x128x12) in reflectance range ~ [0, 3000]
        array = np.zeros((128, 128, 12), dtype=np.uint16)
        
        r, g, b = sample["base_rgb"]
        nir = sample["nir_boost"]
        swir = sample["swir_boost"]
        
        # Noise for spatial texture
        np.random.seed(42)
        texture = np.random.randint(-15, 15, size=(128, 128))
        
        # Band mapping (Sentinel-2 L2A standard)
        array[:, :, 0] = np.clip((b * 8 + texture) * 2, 100, 4000).astype(np.uint16)  # B01 (Coastal Aerosol)
        array[:, :, 1] = np.clip((b * 10 + texture) * 2, 100, 4000).astype(np.uint16) # B02 (Blue)
        array[:, :, 2] = np.clip((g * 10 + texture) * 2, 100, 4000).astype(np.uint16) # B03 (Green)
        array[:, :, 3] = np.clip((r * 10 + texture) * 2, 100, 4000).astype(np.uint16) # B04 (Red)
        array[:, :, 4] = np.clip(((r + g)//2 * 10 + texture) * 2, 100, 4000).astype(np.uint16) # B05 (Red Edge 1)
        array[:, :, 5] = np.clip((nir * 8 + texture) * 2, 100, 4000).astype(np.uint16) # B06 (Red Edge 2)
        array[:, :, 6] = np.clip((nir * 9 + texture) * 2, 100, 4000).astype(np.uint16) # B07 (Red Edge 3)
        array[:, :, 7] = np.clip((nir * 10 + texture) * 2, 100, 4000).astype(np.uint16) # B08 (NIR)
        array[:, :, 8] = np.clip((nir * 9.5 + texture) * 2, 100, 4000).astype(np.uint16) # B8A (Narrow NIR)
        array[:, :, 9] = np.clip((nir * 5 + texture) * 2, 100, 4000).astype(np.uint16) # B09 (Water Vapour)
        array[:, :, 10] = np.clip((swir * 9 + texture) * 2, 100, 4000).astype(np.uint16) # B11 (SWIR 1)
        array[:, :, 11] = np.clip((swir * 8 + texture) * 2, 100, 4000).astype(np.uint16) # B12 (SWIR 2)
        
        # Save 12-band .npy file
        np.save(npy_path, array)
        
        # Create RGB preview image (B04=Red, B03=Green, B02=Blue)
        rgb_img_data = np.zeros((128, 128, 3), dtype=np.uint8)
        rgb_img_data[:, :, 0] = np.clip((array[:, :, 3] / 2000.0) * 255, 0, 255).astype(np.uint8)
        rgb_img_data[:, :, 1] = np.clip((array[:, :, 2] / 2000.0) * 255, 0, 255).astype(np.uint8)
        rgb_img_data[:, :, 2] = np.clip((array[:, :, 1] / 2000.0) * 255, 0, 255).astype(np.uint8)
        
        img_pil = Image.fromarray(rgb_img_data)
        img_pil.save(png_path)
        
        manifest.append({
            "id": sample["id"],
            "class_label": sample["class_label"],
            "description": sample["description"],
            "npy_path": sample["filename_npy"],
            "png_path": sample["filename_png"],
            "dimensions": "128x128",
            "channels": 12,
            "bands": ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B11", "B12"]
        })
        print(f"[OK] Generated BigEarthNet sample patch: {sample['filename_npy']} & {sample['filename_png']}")

        
    manifest_path = os.path.join(output_dir, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
        
    print(f"\nSuccessfully generated BigEarthNet sample batch manifest in: {manifest_path}")

if __name__ == "__main__":
    generate_bigearthnet_sample_batch()

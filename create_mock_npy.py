import os
import numpy as np

# Ensure directory exists
os.makedirs("d:/Codes/SIH_2026/test_images", exist_ok=True)

# Create mock 2-channel SAR
sar = np.random.rand(256, 256, 2).astype(np.float32)
np.save("d:/Codes/SIH_2026/test_images/MOCK_SAR_2ch.npy", sar)

# Create mock 12-channel Optical
opt = np.random.rand(256, 256, 12).astype(np.float32)
np.save("d:/Codes/SIH_2026/test_images/MOCK_OPTICAL_12ch.npy", opt)

print("✅ Successfully created MOCK_SAR_2ch.npy and MOCK_OPTICAL_12ch.npy in d:/Codes/SIH_2026/test_images/")

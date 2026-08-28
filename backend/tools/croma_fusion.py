import os
import sys
import torch

CROMA_PATH = "/content/CROMA"

if CROMA_PATH not in sys.path:
    sys.path.insert(0, CROMA_PATH)

from use_croma import PretrainedCROMA


class CROMAFusion:

    def __init__(
        self,
        weights_path="/content/CROMA/CROMA_base.pt",
        device=None
    ):
        self.device = device or (
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        if not os.path.exists(weights_path):
            raise FileNotFoundError(
                f"CROMA weights not found: {weights_path}"
            )

        print(f"Loading CROMA on {self.device}...")

        # PretrainedCROMA does not accept device=
        self.model = PretrainedCROMA(
            pretrained_path=weights_path,
            size="base"
        )

        self.model = self.model.to(self.device)
        self.model.eval()

        print("✓ CROMA loaded")

    @torch.no_grad()
    def fuse(self, optical, sar):

        if optical.ndim == 3:
            optical = optical.unsqueeze(0)

        if sar.ndim == 3:
            sar = sar.unsqueeze(0)

        optical = optical.float().to(self.device)
        sar = sar.float().to(self.device)

        outputs = self.model(
            SAR_images=sar,
            optical_images=optical
        )

        return {
            "SAR_encodings": outputs["SAR_encodings"],
            "SAR_GAP": outputs["SAR_GAP"],
            "optical_encodings": outputs["optical_encodings"],
            "optical_GAP": outputs["optical_GAP"],
            "joint_encodings": outputs["joint_encodings"],
            "joint_GAP": outputs["joint_GAP"]
        }


_croma_instance = None


def run_croma(optical, sar):

    global _croma_instance

    if _croma_instance is None:
        _croma_instance = CROMAFusion()

    return _croma_instance.fuse(optical, sar)

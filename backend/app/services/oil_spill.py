import sys
from functools import lru_cache
from pathlib import Path
from io import BytesIO

import torch
from PIL import Image
from torchvision import transforms


# ============================================================
# PROJECT PATHS
# ============================================================

# oil_spill.py
#   SIH/
#     backend/
#       app/
#         services/
#           oil_spill.py

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BACKEND_DIR.parent
ML_DIR = PROJECT_DIR / "ml"

CHECKPOINT_PATH = (
    ML_DIR
    / "checkpoints"
    / "oil_spill_model.pth"
)


# ============================================================
# LOAD ML CODE
# ============================================================

if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from models.oil_spill_model import (
    predict_logits_to_result,
)

from utils.checkpoint import (
    load_checkpoint,
)


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

@lru_cache(maxsize=1)
def get_model():

    print(
        f"Loading oil-spill model from: "
        f"{CHECKPOINT_PATH}"
    )

    if not CHECKPOINT_PATH.exists():

        raise FileNotFoundError(
            f"Trained model not found at: "
            f"{CHECKPOINT_PATH}"
        )

    model, checkpoint = load_checkpoint(
        str(CHECKPOINT_PATH)
    )

    model = model.to(DEVICE)
    model.eval()

    normalization = checkpoint.get(
        "normalization",
        {
            "mean": [0.5197],
            "std": [0.2215],
        },
    )

    mean = normalization["mean"]
    std = normalization["std"]

    preprocessing = transforms.Compose([
        transforms.Grayscale(
            num_output_channels=1
        ),

        transforms.Resize(
            (224, 224)
        ),

        transforms.ToTensor(),

        transforms.Normalize(
            mean=mean,
            std=std,
        ),
    ])

    print(
        "Oil-spill model loaded successfully."
    )

    print(
        f"Device: {DEVICE}"
    )

    return (
        model,
        preprocessing,
        checkpoint,
    )


# ============================================================
# IMAGE PREDICTION
# ============================================================

def predict_image(image_bytes: bytes):

    model, preprocessing, checkpoint = (
        get_model()
    )

    # --------------------------------------------------------
    # OPEN IMAGE
    # --------------------------------------------------------

    try:

        image = Image.open(
            BytesIO(image_bytes)
        ).convert("L")

    except Exception as e:

        raise RuntimeError(
            f"Could not read satellite image: {e}"
        )

    # --------------------------------------------------------
    # PREPROCESS
    # --------------------------------------------------------

    tensor = preprocessing(
        image
    )

    tensor = tensor.unsqueeze(0)
    tensor = tensor.to(DEVICE)

    # --------------------------------------------------------
    # MODEL INFERENCE
    # --------------------------------------------------------

    with torch.no_grad():

        logits = model(
            tensor
        )

    # --------------------------------------------------------
    # CONVERT LOGITS → RESULT
    # --------------------------------------------------------

    result = predict_logits_to_result(
        logits
    )

    # --------------------------------------------------------
    # RETURN
    # --------------------------------------------------------

    return {
        "label": result["label"],

        "confidence": float(
            result["confidence"]
        ),

        "probabilities": {
            "NO_OIL": float(
                result["probabilities"]["NO_OIL"]
            ),

            "OIL": float(
                result["probabilities"]["OIL"]
            ),
        },

        "model": "ResNet18",

        "device": str(
            DEVICE
        ),

        "checkpoint": (
            CHECKPOINT_PATH.name
        ),
    }
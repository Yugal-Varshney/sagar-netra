"""Standalone inference for a trained oil-spill checkpoint."""

import argparse
import os
import sys

import torch
from PIL import Image


# ============================================================
# PATH SETUP
# ============================================================

ML_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)


# ============================================================
# ML IMPORTS
# ============================================================

from models.oil_spill_model import predict_logits_to_result
from preprocessing.transforms import get_inference_transforms
from utils.checkpoint import load_checkpoint


# ============================================================
# MAIN PREDICTION FUNCTION
# ============================================================

def predict(
    image_path: str,
    checkpoint_path: str,
    device: torch.device = None,
) -> dict:
    """
    Run inference on one image.

    Parameters
    ----------
    image_path:
        Path to the image that should be classified.

    checkpoint_path:
        Path to the trained oil-spill model checkpoint.

    device:
        Optional PyTorch device.

    Returns
    -------
    dict
        Prediction result containing label,
        confidence and probabilities.
    """

    # --------------------------------------------------------
    # Validate image
    # --------------------------------------------------------

    if not os.path.isfile(image_path):
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    # --------------------------------------------------------
    # Validate checkpoint
    # --------------------------------------------------------

    if not os.path.isfile(checkpoint_path):
        raise FileNotFoundError(
            f"Checkpoint not found: {checkpoint_path}"
        )

    # --------------------------------------------------------
    # Load trained model
    # --------------------------------------------------------

    model, checkpoint = load_checkpoint(
        checkpoint_path,
        device=device,
    )

    resolved_device = next(
        model.parameters()
    ).device

    # --------------------------------------------------------
    # Get training normalization
    # --------------------------------------------------------

    normalization = checkpoint.get(
        "normalization",
        {}
    )

    mean = tuple(
        normalization.get(
            "mean",
            (0.5,),
        )
    )

    std = tuple(
        normalization.get(
            "std",
            (0.5,),
        )
    )

    # --------------------------------------------------------
    # Get image size from checkpoint
    # --------------------------------------------------------

    image_size = checkpoint.get(
        "model_config",
        {}
    ).get(
        "image_size",
        224,
    )

    # --------------------------------------------------------
    # Create inference transform
    # --------------------------------------------------------

    transform = get_inference_transforms(
        image_size=image_size,
        mean=mean,
        std=std,
    )

    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    image = Image.open(
        image_path
    ).convert("L")

    tensor = (
        transform(image)
        .unsqueeze(0)
        .to(resolved_device)
    )

    # --------------------------------------------------------
    # Model inference
    # --------------------------------------------------------

    model.eval()

    with torch.no_grad():

        logits = model(
            tensor
        )

    # --------------------------------------------------------
    # Convert logits to result
    # --------------------------------------------------------

    return predict_logits_to_result(
        logits
    )


# ============================================================
# BACKEND COMPATIBILITY WRAPPER
# ============================================================

def predict_image(
    image_path: str,
    checkpoint_path: str,
    device: torch.device = None,
) -> dict:
    """
    Backend-compatible prediction function.

    The FastAPI backend imports `predict_image`,
    while the original standalone script exposed
    `predict`.

    Both functions use the exact same inference pipeline.
    """

    return predict(
        image_path=image_path,
        checkpoint_path=checkpoint_path,
        device=device,
    )


# ============================================================
# COMMAND-LINE INTERFACE
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "Run oil-spill inference on a satellite image."
        )
    )

    parser.add_argument(
        "--image",
        required=True,
        help="Path to input image.",
    )

    parser.add_argument(
        "--checkpoint",
        default="checkpoints/oil_spill_model.pth",
        help="Path to trained checkpoint.",
    )

    args = parser.parse_args()

    result = predict(
        image_path=args.image,
        checkpoint_path=args.checkpoint,
    )

    label = (
        "OIL"
        if result["label"] == "OIL"
        else "NO OIL"
    )

    print(
        f"Prediction: {label}"
    )

    print(
        f"Confidence: "
        f"{result['confidence'] * 100:.1f}%"
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()
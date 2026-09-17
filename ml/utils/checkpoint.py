"""Model checkpoint save/load utilities."""

import os
from typing import Optional
import torch
import torch.nn as nn

from models.oil_spill_model import CLASS_NAMES, NUM_CLASSES, create_oil_spill_model
from preprocessing.transforms import DEFAULT_MEAN, DEFAULT_STD, IMAGE_SIZE

def build_default_model_config() -> dict:
    return {
        "architecture": "resnet18",
        "pretrained": True,
        "num_classes": NUM_CLASSES,
        "class_names": CLASS_NAMES,
        "input_channels": 1,
        "image_size": IMAGE_SIZE,
    }

def save_checkpoint(
    model: nn.Module,
    path: str,
    model_config: Optional[dict] = None,
    normalization_mean=DEFAULT_MEAN,
    normalization_std=DEFAULT_STD,
    training_info: Optional[dict] = None,
) -> None:
    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, exist_ok=True)
    checkpoint = {
        "model_state_dict": model.state_dict(),
        "model_config": model_config or build_default_model_config(),
        "normalization": {
            "mean": list(normalization_mean),
            "std": list(normalization_std),
        },
        "training_info": training_info or {},
    }
    torch.save(checkpoint, path)

def load_checkpoint(path: str, device: Optional[torch.device] = None):
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint = torch.load(path, map_location=device)
    model = create_oil_spill_model(pretrained=False, freeze_backbone=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    return model, checkpoint

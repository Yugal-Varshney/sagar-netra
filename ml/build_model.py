"""Build and sanity-check the untrained model architecture."""

import os
import torch

from models.oil_spill_model import create_oil_spill_model, get_device
from preprocessing.transforms import DEFAULT_MEAN, DEFAULT_STD, IMAGE_SIZE
from utils.checkpoint import build_default_model_config, save_checkpoint

def sanity_check_forward_pass(model, device):
    model.eval()
    dummy = torch.randn(2, 1, IMAGE_SIZE, IMAGE_SIZE, device=device)
    with torch.no_grad():
        output = model(dummy)
    assert output.shape == (2, 2)
    print(f"Sanity check passed: input {tuple(dummy.shape)} -> output {tuple(output.shape)}")

def main():
    device = get_device()
    print(f"Using device: {device}")
    model = create_oil_spill_model(pretrained=True, freeze_backbone=False).to(device)
    sanity_check_forward_pass(model, device)
    path = os.path.join("checkpoints", "oil_spill_model.pth")
    save_checkpoint(
        model, path, build_default_model_config(),
        DEFAULT_MEAN, DEFAULT_STD, {}
    )
    print(f"Initial UNTRAINED checkpoint saved to: {path}")

if __name__ == "__main__":
    main()

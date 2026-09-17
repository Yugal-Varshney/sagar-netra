"""
ResNet18-based binary oil-spill classifier adapted for 1-channel SAR.
"""

import torch
import torch.nn as nn
import torchvision.models as tv_models

NUM_CLASSES = 2
CLASS_NAMES = ["NO_OIL", "OIL"]

def _adapt_first_conv_to_single_channel(conv1: nn.Conv2d, pretrained: bool) -> nn.Conv2d:
    new_conv1 = nn.Conv2d(
        in_channels=1,
        out_channels=conv1.out_channels,
        kernel_size=conv1.kernel_size,
        stride=conv1.stride,
        padding=conv1.padding,
        bias=(conv1.bias is not None),
    )
    if pretrained:
        with torch.no_grad():
            new_conv1.weight.copy_(conv1.weight.mean(dim=1, keepdim=True))
            if conv1.bias is not None:
                new_conv1.bias.copy_(conv1.bias)
    return new_conv1

def create_oil_spill_model(pretrained: bool = True, freeze_backbone: bool = False) -> nn.Module:
    weights = tv_models.ResNet18_Weights.IMAGENET1K_V1 if pretrained else None
    model = tv_models.resnet18(weights=weights)
    model.conv1 = _adapt_first_conv_to_single_channel(model.conv1, pretrained)
    model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

    if freeze_backbone:
        for name, param in model.named_parameters():
            if not name.startswith("fc."):
                param.requires_grad = False
    return model

def get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")

@torch.no_grad()
def predict_logits_to_result(logits: torch.Tensor) -> dict:
    if logits.dim() == 2:
        logits = logits.squeeze(0)
    probabilities = torch.softmax(logits, dim=0)
    idx = int(torch.argmax(probabilities).item())
    return {
        "label": CLASS_NAMES[idx],
        "confidence": float(probabilities[idx].item()),
        "probabilities": {
            CLASS_NAMES[0]: float(probabilities[0].item()),
            CLASS_NAMES[1]: float(probabilities[1].item()),
        },
    }

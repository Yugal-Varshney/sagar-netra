"""
Preprocessing and augmentation pipelines for Sentinel-1 SAR imagery.
"""

from typing import Tuple
import torchvision.transforms as T

IMAGE_SIZE = 224
DEFAULT_MEAN: Tuple[float] = (0.5,)
DEFAULT_STD: Tuple[float] = (0.5,)

def get_train_transforms(
    image_size: int = IMAGE_SIZE,
    mean: Tuple[float] = DEFAULT_MEAN,
    std: Tuple[float] = DEFAULT_STD,
    max_rotation_degrees: float = 10.0,
) -> T.Compose:
    return T.Compose([
        T.Resize((image_size, image_size)),
        T.RandomHorizontalFlip(p=0.5),
        T.RandomVerticalFlip(p=0.5),
        T.RandomRotation(degrees=max_rotation_degrees),
        T.ToTensor(),
        T.Normalize(mean=mean, std=std),
    ])

def get_val_transforms(
    image_size: int = IMAGE_SIZE,
    mean: Tuple[float] = DEFAULT_MEAN,
    std: Tuple[float] = DEFAULT_STD,
) -> T.Compose:
    return T.Compose([
        T.Resize((image_size, image_size)),
        T.ToTensor(),
        T.Normalize(mean=mean, std=std),
    ])

def get_inference_transforms(
    image_size: int = IMAGE_SIZE,
    mean: Tuple[float] = DEFAULT_MEAN,
    std: Tuple[float] = DEFAULT_STD,
) -> T.Compose:
    return get_val_transforms(image_size=image_size, mean=mean, std=std)

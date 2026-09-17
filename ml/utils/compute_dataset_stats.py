"""Compute mean/std from training SAR images."""

import argparse
import os
import sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.dataset import OilSpillDataset

def compute_mean_std(root_dir: str, image_size: int = 224, max_images: int = None):
    dataset = OilSpillDataset(root_dir=root_dir, transform=None)
    paths = dataset.get_paths()
    if max_images is not None:
        paths = paths[:max_images]
    pixel_sum = pixel_sq_sum = 0.0
    pixel_count = 0
    for path in paths:
        image = Image.open(path).convert("L").resize((image_size, image_size))
        arr = np.asarray(image, dtype=np.float64) / 255.0
        pixel_sum += arr.sum()
        pixel_sq_sum += (arr ** 2).sum()
        pixel_count += arr.size
    mean = pixel_sum / pixel_count
    variance = (pixel_sq_sum / pixel_count) - mean ** 2
    return float(mean), float(np.sqrt(max(variance, 0.0)))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", required=True)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--max-images", type=int, default=None)
    args = parser.parse_args()
    mean, std = compute_mean_std(args.data_dir, args.image_size, args.max_images)
    print(f"Computed mean: {mean:.4f}")
    print(f"Computed std:  {std:.4f}")

if __name__ == "__main__":
    main()

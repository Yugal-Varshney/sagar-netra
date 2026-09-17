"""
PyTorch Dataset for Sentinel-1 SAR oil-spill images.

Expected layout:
    data/
        Class_0/  -> NO_OIL (0)
        Class_1/  -> OIL (1)
"""

import os
from typing import Callable, List, Optional, Tuple
import numpy as np
from PIL import Image
from torch.utils.data import Dataset

VALID_EXTENSIONS = (".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp")

CLASS_FOLDER_TO_LABEL = {"Class_0": 0, "Class_1": 1}
LABEL_TO_NAME = {0: "NO_OIL", 1: "OIL"}

class OilSpillDataset(Dataset):
    def __init__(
        self,
        root_dir: str,
        transform: Optional[Callable] = None,
        samples: Optional[List[Tuple[str, int]]] = None,
    ):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = samples if samples is not None else self._scan_directory(root_dir)
        if not self.samples:
            raise RuntimeError(
                f"No images found under '{root_dir}'. Expected Class_0/Class_1."
            )

    @staticmethod
    def _scan_directory(root_dir: str) -> List[Tuple[str, int]]:
        samples = []
        for class_folder, label in CLASS_FOLDER_TO_LABEL.items():
            class_dir = os.path.join(root_dir, class_folder)
            if not os.path.isdir(class_dir):
                continue
            for fname in sorted(os.listdir(class_dir)):
                if os.path.splitext(fname)[1].lower() in VALID_EXTENSIONS:
                    path = os.path.join(class_dir, fname)
                    if os.path.isfile(path):
                        samples.append((path, label))
        return samples

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        image = Image.open(path).convert("L")
        if self.transform is not None:
            image = self.transform(image)
        else:
            image = np.array(image, dtype=np.float32) / 255.0
        return image, label

    def get_labels(self) -> List[int]:
        return [label for _, label in self.samples]

    def get_paths(self) -> List[str]:
        return [path for path, _ in self.samples]

def compute_class_weights(labels: List[int]) -> List[float]:
    labels_arr = np.array(labels)
    counts = np.array(
        [np.sum(labels_arr == c) for c in range(2)], dtype=np.float64
    )
    counts = np.maximum(counts, 1)
    inverse_freq = 1.0 / counts
    return (inverse_freq / inverse_freq.sum() * 2).tolist()

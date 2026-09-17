"""Leakage-aware train/validation/test split helpers."""

from typing import Dict, List, Tuple
import numpy as np
from sklearn.model_selection import GroupShuffleSplit, train_test_split

def stratified_split(
    paths: List[str],
    labels: List[int],
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
) -> Dict[str, Tuple[List[str], List[int]]]:
    train_paths, temp_paths, train_labels, temp_labels = train_test_split(
        paths, labels, test_size=val_size + test_size,
        stratify=labels, random_state=random_state
    )
    relative_test_size = test_size / (val_size + test_size)
    val_paths, test_paths, val_labels, test_labels = train_test_split(
        temp_paths, temp_labels, test_size=relative_test_size,
        stratify=temp_labels, random_state=random_state
    )
    return {
        "train": (train_paths, train_labels),
        "val": (val_paths, val_labels),
        "test": (test_paths, test_labels),
    }

def grouped_stratified_split(
    paths: List[str],
    labels: List[int],
    groups: List[str],
    val_size: float = 0.15,
    test_size: float = 0.15,
    random_state: int = 42,
) -> Dict[str, Tuple[List[str], List[int]]]:
    paths_arr, labels_arr, groups_arr = map(np.array, (paths, labels, groups))
    gss_temp = GroupShuffleSplit(
        n_splits=1, test_size=val_size + test_size, random_state=random_state
    )
    train_idx, temp_idx = next(gss_temp.split(paths_arr, labels_arr, groups_arr))
    relative_test_size = test_size / (val_size + test_size)
    gss_val_test = GroupShuffleSplit(
        n_splits=1, test_size=relative_test_size, random_state=random_state
    )
    val_rel, test_rel = next(
        gss_val_test.split(
            paths_arr[temp_idx], labels_arr[temp_idx], groups_arr[temp_idx]
        )
    )
    return {
        "train": (paths_arr[train_idx].tolist(), labels_arr[train_idx].tolist()),
        "val": (paths_arr[temp_idx[val_rel]].tolist(), labels_arr[temp_idx[val_rel]].tolist()),
        "test": (paths_arr[temp_idx[test_rel]].tolist(), labels_arr[temp_idx[test_rel]].tolist()),
    }

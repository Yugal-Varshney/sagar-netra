"""
train.py

Sagar Netra - Oil Spill Detection Training

Trains the ResNet18-based binary classifier on the real Sentinel-1 SAR
dataset.

Dataset expected at:
    ../kaggle/data/
        Class_0/
            *.jpg
        Class_1/
            *.jpg

Class mapping:
    0 -> NO_OIL
    1 -> OIL

Split:
    70% train
    15% validation
    15% test

This script:
    - creates a reproducible stratified split
    - uses training-set normalization
    - uses SAR-appropriate transforms
    - uses class-weighted CrossEntropyLoss
    - starts from pretrained ResNet18
    - monitors validation OIL recall/F1
    - saves the best checkpoint
    - evaluates the final best model on the test set
"""

import argparse
import os
import random

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from torch.utils.data import DataLoader

from data.dataset import OilSpillDataset, compute_class_weights
from models.oil_spill_model import create_oil_spill_model, get_device
from preprocessing.transforms import (
    DEFAULT_MEAN,
    DEFAULT_STD,
    IMAGE_SIZE,
    get_train_transforms,
    get_val_transforms,
)
from utils.checkpoint import (
    build_default_model_config,
    save_checkpoint,
)
from utils.data_split import stratified_split


# ============================================================
# Configuration
# ============================================================

DEFAULT_DATA_DIR = os.path.join("..", "kaggle", "data")
DEFAULT_CHECKPOINT = os.path.join(
    "checkpoints",
    "oil_spill_model.pth",
)

RANDOM_SEED = 42

VAL_SIZE = 0.15
TEST_SIZE = 0.15

BATCH_SIZE = 32
NUM_EPOCHS = 15

LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-4

NUM_WORKERS = 0

# We care especially about catching real oil spills.
PRIMARY_METRIC = "oil_recall"


# ============================================================
# Reproducibility
# ============================================================

def set_seed(seed: int = RANDOM_SEED) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)

    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

    # Deterministic behavior where possible.
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


# ============================================================
# DataLoader helper
# ============================================================

class SplitDataset(torch.utils.data.Dataset):
    """
    Dataset wrapper around explicit path/label lists.

    This lets us use the already-created train/val/test split while
    applying different transforms to each split.
    """

    def __init__(self, paths, labels, transform=None):
        self.paths = paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.paths)

    def __getitem__(self, index):
        from PIL import Image

        path = self.paths[index]
        label = self.labels[index]

        image = Image.open(path).convert("L")

        if self.transform is not None:
            image = self.transform(image)

        return image, label


# ============================================================
# Metrics
# ============================================================

def calculate_metrics(labels, predictions, probabilities):
    """
    Calculate classification metrics.

    Class 1 is OIL.
    """

    accuracy = accuracy_score(labels, predictions)

    precision = precision_score(
        labels,
        predictions,
        pos_label=1,
        zero_division=0,
    )

    recall = recall_score(
        labels,
        predictions,
        pos_label=1,
        zero_division=0,
    )

    f1 = f1_score(
        labels,
        predictions,
        pos_label=1,
        zero_division=0,
    )

    try:
        roc_auc = roc_auc_score(
            labels,
            probabilities,
        )
    except ValueError:
        roc_auc = float("nan")

    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "oil_recall": float(recall),
        "f1": float(f1),
        "roc_auc": float(roc_auc),
    }


# ============================================================
# One epoch
# ============================================================

def run_epoch(
    model,
    loader,
    criterion,
    device,
    optimizer=None,
):
    """
    Run one training or validation epoch.
    """

    is_training = optimizer is not None

    if is_training:
        model.train()
    else:
        model.eval()

    total_loss = 0.0
    total_samples = 0

    all_labels = []
    all_predictions = []
    all_probabilities = []

    for images, labels in loader:

        images = images.to(device)
        labels = labels.to(device)

        if is_training:
            optimizer.zero_grad()

        with torch.set_grad_enabled(is_training):

            logits = model(images)

            loss = criterion(logits, labels)

            probabilities = torch.softmax(
                logits,
                dim=1,
            )

            predictions = torch.argmax(
                logits,
                dim=1,
            )

            if is_training:
                loss.backward()

                # Prevent unusually large gradients.
                torch.nn.utils.clip_grad_norm_(
                    model.parameters(),
                    max_norm=1.0,
                )

                optimizer.step()

        batch_size = labels.size(0)

        total_loss += loss.item() * batch_size
        total_samples += batch_size

        all_labels.extend(
            labels.detach().cpu().numpy().tolist()
        )

        all_predictions.extend(
            predictions.detach().cpu().numpy().tolist()
        )

        # Probability of OIL.
        all_probabilities.extend(
            probabilities[:, 1]
            .detach()
            .cpu()
            .numpy()
            .tolist()
        )

    average_loss = total_loss / max(total_samples, 1)

    metrics = calculate_metrics(
        all_labels,
        all_predictions,
        all_probabilities,
    )

    metrics["loss"] = float(average_loss)

    return metrics


# ============================================================
# Main training function
# ============================================================

def train(
    data_dir=DEFAULT_DATA_DIR,
    checkpoint_path=DEFAULT_CHECKPOINT,
    epochs=NUM_EPOCHS,
    batch_size=BATCH_SIZE,
    learning_rate=LEARNING_RATE,
):
    set_seed()

    # --------------------------------------------------------
    # Device
    # --------------------------------------------------------

    device = get_device()

    print("=" * 70)
    print("Sagar Netra - OIL SPILL DETECTION TRAINING")
    print("=" * 70)

    print(f"Device: {device}")
    print(f"Dataset: {os.path.abspath(data_dir)}")
    print(f"Epochs: {epochs}")
    print(f"Batch size: {batch_size}")
    print(f"Learning rate: {learning_rate}")
    print()

    # --------------------------------------------------------
    # Load dataset paths/labels
    # --------------------------------------------------------

    print("Scanning dataset...")

    base_dataset = OilSpillDataset(
        root_dir=data_dir,
        transform=None,
    )

    paths = base_dataset.get_paths()
    labels = base_dataset.get_labels()

    print(f"Total images: {len(paths)}")

    no_oil_count = labels.count(0)
    oil_count = labels.count(1)

    print(f"NO_OIL: {no_oil_count}")
    print(f"OIL:    {oil_count}")
    print()

    # --------------------------------------------------------
    # Split
    # --------------------------------------------------------

    print("Creating stratified train/validation/test split...")

    splits = stratified_split(
        paths,
        labels,
        val_size=VAL_SIZE,
        test_size=TEST_SIZE,
        random_state=RANDOM_SEED,
    )

    train_paths, train_labels = splits["train"]
    val_paths, val_labels = splits["val"]
    test_paths, test_labels = splits["test"]

    print(
        f"Train: {len(train_paths)} "
        f"(OIL={sum(train_labels)}, "
        f"NO_OIL={len(train_labels) - sum(train_labels)})"
    )

    print(
        f"Validation: {len(val_paths)} "
        f"(OIL={sum(val_labels)}, "
        f"NO_OIL={len(val_labels) - sum(val_labels)})"
    )

    print(
        f"Test: {len(test_paths)} "
        f"(OIL={sum(test_labels)}, "
        f"NO_OIL={len(test_labels) - sum(test_labels)})"
    )

    print()

    # --------------------------------------------------------
    # Normalization
    # --------------------------------------------------------
    #
    # These are the statistics already computed from the actual
    # dataset at 224x224:
    #
    # mean = 0.5197
    # std  = 0.2215
    #
    # They are used here instead of ImageNet RGB statistics.
    # --------------------------------------------------------

    mean = (0.5197,)
    std = (0.2215,)

    print("Using SAR normalization:")
    print(f"Mean: {mean}")
    print(f"Std:  {std}")
    print()

    # --------------------------------------------------------
    # Transforms
    # --------------------------------------------------------

    print("Creating transforms...")

    train_transform = get_train_transforms(
        image_size=IMAGE_SIZE,
        mean=mean,
        std=std,
    )

    val_transform = get_val_transforms(
        image_size=IMAGE_SIZE,
        mean=mean,
        std=std,
    )

    # --------------------------------------------------------
    # Split datasets
    # --------------------------------------------------------

    train_dataset = SplitDataset(
        train_paths,
        train_labels,
        transform=train_transform,
    )

    val_dataset = SplitDataset(
        val_paths,
        val_labels,
        transform=val_transform,
    )

    test_dataset = SplitDataset(
        test_paths,
        test_labels,
        transform=val_transform,
    )

    # --------------------------------------------------------
    # DataLoaders
    # --------------------------------------------------------

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available(),
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available(),
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=NUM_WORKERS,
        pin_memory=torch.cuda.is_available(),
    )

    # --------------------------------------------------------
    # Class weights
    # --------------------------------------------------------

    class_weights = compute_class_weights(train_labels)

    class_weights_tensor = torch.tensor(
        class_weights,
        dtype=torch.float32,
        device=device,
    )

    print("Class weights:")
    print(f"NO_OIL: {class_weights[0]:.4f}")
    print(f"OIL:    {class_weights[1]:.4f}")
    print()

    # --------------------------------------------------------
    # Model
    # --------------------------------------------------------

    print("Building pretrained ResNet18 model...")

    model = create_oil_spill_model(
        pretrained=True,
        freeze_backbone=False,
    )

    model.to(device)

    # --------------------------------------------------------
    # Loss
    # --------------------------------------------------------

    criterion = nn.CrossEntropyLoss(
        weight=class_weights_tensor,
    )

    # --------------------------------------------------------
    # Optimizer
    # --------------------------------------------------------

    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=learning_rate,
        weight_decay=WEIGHT_DECAY,
    )

    # Reduce learning rate if validation loss stops improving.
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=0.5,
        patience=2,
    )

    # --------------------------------------------------------
    # Training state
    # --------------------------------------------------------

    best_recall = -1.0
    best_f1 = -1.0
    best_epoch = 0

    history = []

    os.makedirs(
        os.path.dirname(checkpoint_path)
        if os.path.dirname(checkpoint_path)
        else ".",
        exist_ok=True,
    )

    # --------------------------------------------------------
    # Training loop
    # --------------------------------------------------------

    print("=" * 70)
    print("STARTING TRAINING")
    print("=" * 70)

    for epoch in range(1, epochs + 1):

        print()
        print(
            f"Epoch {epoch}/{epochs}"
        )
        print("-" * 70)

        train_metrics = run_epoch(
            model=model,
            loader=train_loader,
            criterion=criterion,
            device=device,
            optimizer=optimizer,
        )

        val_metrics = run_epoch(
            model=model,
            loader=val_loader,
            criterion=criterion,
            device=device,
            optimizer=None,
        )

        scheduler.step(
            val_metrics["loss"]
        )

        current_lr = optimizer.param_groups[0]["lr"]

        print(
            f"Train | "
            f"Loss: {train_metrics['loss']:.4f} | "
            f"Acc: {train_metrics['accuracy']:.4f} | "
            f"Precision: {train_metrics['precision']:.4f} | "
            f"OIL Recall: {train_metrics['oil_recall']:.4f} | "
            f"F1: {train_metrics['f1']:.4f}"
        )

        print(
            f"Val   | "
            f"Loss: {val_metrics['loss']:.4f} | "
            f"Acc: {val_metrics['accuracy']:.4f} | "
            f"Precision: {val_metrics['precision']:.4f} | "
            f"OIL Recall: {val_metrics['oil_recall']:.4f} | "
            f"F1: {val_metrics['f1']:.4f} | "
            f"ROC-AUC: {val_metrics['roc_auc']:.4f}"
        )

        print(
            f"LR: {current_lr:.7f}"
        )

        history.append(
            {
                "epoch": epoch,
                "train": train_metrics,
                "val": val_metrics,
            }
        )

        # ----------------------------------------------------
        # Save best model
        #
        # Primary objective = OIL recall.
        # If recall ties, use F1 as tie-breaker.
        # ----------------------------------------------------

        is_better = (
            val_metrics["oil_recall"] > best_recall
            or (
                val_metrics["oil_recall"] == best_recall
                and val_metrics["f1"] > best_f1
            )
        )

        if is_better:

            best_recall = val_metrics["oil_recall"]
            best_f1 = val_metrics["f1"]
            best_epoch = epoch

            model_config = build_default_model_config()

            model_config["pretrained"] = True

            training_info = {
                "epoch": epoch,
                "best_epoch": epoch,
                "best_oil_recall": best_recall,
                "best_f1": best_f1,
                "train_metrics": train_metrics,
                "validation_metrics": val_metrics,
                "class_weights": list(class_weights),
                "batch_size": batch_size,
                "learning_rate": learning_rate,
                "weight_decay": WEIGHT_DECAY,
                "random_seed": RANDOM_SEED,
            }

            save_checkpoint(
                model=model,
                path=checkpoint_path,
                model_config=model_config,
                normalization_mean=mean,
                normalization_std=std,
                training_info=training_info,
            )

            print()
            print(
                f"*** BEST MODEL SAVED "
                f"(OIL recall={best_recall:.4f}, "
                f"F1={best_f1:.4f}) ***"
            )

    # --------------------------------------------------------
    # Load best checkpoint for final test evaluation
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)

    print(f"Best epoch: {best_epoch}")
    print(f"Best validation OIL recall: {best_recall:.4f}")
    print(f"Best validation F1: {best_f1:.4f}")
    print(f"Checkpoint: {checkpoint_path}")
    print()

    print("Evaluating best model on held-out TEST set...")

    checkpoint = torch.load(
        checkpoint_path,
        map_location=device,
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.to(device)
    model.eval()

    test_metrics = run_epoch(
        model=model,
        loader=test_loader,
        criterion=criterion,
        device=device,
        optimizer=None,
    )

    # Get predictions for confusion matrix.
    all_labels = []
    all_predictions = []

    with torch.no_grad():

        for images, labels_batch in test_loader:

            images = images.to(device)

            logits = model(images)

            predictions = torch.argmax(
                logits,
                dim=1,
            )

            all_labels.extend(
                labels_batch.numpy().tolist()
            )

            all_predictions.extend(
                predictions.cpu().numpy().tolist()
            )

    cm = confusion_matrix(
        all_labels,
        all_predictions,
        labels=[0, 1],
    )

    print()
    print("=" * 70)
    print("FINAL TEST RESULTS")
    print("=" * 70)

    print(f"Accuracy:       {test_metrics['accuracy']:.4f}")
    print(f"Precision OIL:  {test_metrics['precision']:.4f}")
    print(f"Recall OIL:     {test_metrics['oil_recall']:.4f}")
    print(f"F1 OIL:         {test_metrics['f1']:.4f}")
    print(f"ROC-AUC:        {test_metrics['roc_auc']:.4f}")

    print()
    print("Confusion Matrix:")
    print()
    print("                 Predicted")
    print("              NO_OIL    OIL")
    print(
        f"Actual NO_OIL  {cm[0, 0]:6d}  {cm[0, 1]:6d}"
    )
    print(
        f"Actual OIL     {cm[1, 0]:6d}  {cm[1, 1]:6d}"
    )

    print()
    print("=" * 70)
    print("MODEL READY FOR INFERENCE")
    print("=" * 70)


# ============================================================
# CLI
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description="Train Sagar Netra oil-spill classifier."
    )

    parser.add_argument(
        "--data-dir",
        default=DEFAULT_DATA_DIR,
        help="Dataset directory containing Class_0 and Class_1.",
    )

    parser.add_argument(
        "--checkpoint",
        default=DEFAULT_CHECKPOINT,
        help="Where to save the best model checkpoint.",
    )

    parser.add_argument(
        "--epochs",
        type=int,
        default=NUM_EPOCHS,
        help="Number of training epochs.",
    )

    parser.add_argument(
        "--batch-size",
        type=int,
        default=BATCH_SIZE,
        help="Training batch size.",
    )

    parser.add_argument(
        "--lr",
        type=float,
        default=LEARNING_RATE,
        help="Learning rate.",
    )

    args = parser.parse_args()

    train(
        data_dir=args.data_dir,
        checkpoint_path=args.checkpoint,
        epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
    )


if __name__ == "__main__":
    main()
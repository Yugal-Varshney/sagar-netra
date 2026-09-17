# Sagar Netra ML — Stage 1

This folder contains the Stage 1 oil-spill ML foundation.

It includes:
- Sentinel-1 SAR-aware preprocessing
- PyTorch dataset loader
- leakage-aware split utilities
- ResNet18 adapted for 1-channel SAR
- checkpoint save/load
- inference utilities
- model sanity-check script

**Important:** the model is not trained yet. Predictions from an untrained checkpoint are meaningless.

Next stage:
1. Obtain and inspect the real SAR oil-spill dataset.
2. Determine correct split strategy from metadata.
3. Compute normalization statistics on the training split.
4. Train the model.
5. Evaluate recall, precision, F1, ROC-AUC and confusion matrix.
6. Integrate the trained checkpoint with the FastAPI backend.

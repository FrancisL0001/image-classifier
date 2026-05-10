"""
Classifier module for image classification using a pretrained ResNet50 model.

The model and ImageNet labels are loaded once at module import (server startup)
so that individual prediction requests pay no loading cost.
"""

from torchvision import models
from torchvision.models import ResNet50_Weights
import torch
import requests

_LABELS_URL = "https://storage.googleapis.com/download.tensorflow.org/data/imagenet_class_index.json"

# Load model once at startup
_model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
_model.eval()

# Fetch ImageNet class labels once at startup
try:
    _class_idx = requests.get(_LABELS_URL, timeout=10).json()
    _labels = [_class_idx[str(k)][1] for k in range(len(_class_idx))]
except Exception as e:
    raise RuntimeError(f"Failed to load ImageNet labels at startup: {e}")


def predictions(im: torch.Tensor) -> list[dict]:
    """
    Run inference on a preprocessed image tensor and return the top-3 predictions.

    Args:
        im (torch.Tensor): Preprocessed image tensor of shape [1, 3, 224, 224].

    Returns:
        list[dict]: Top-3 predictions, each with 'label' (str) and 'probability' (float,
        rounded to 4 decimal places).

    Raises:
        Exception: Propagates any runtime error from the model forward pass to the caller.
    """
    with torch.no_grad():
        output = _model(im)

    probabilities = torch.nn.functional.softmax(output[0], dim=0)
    top_3_prob, top_3_pred = torch.topk(probabilities, 3)

    return [
        {"label": _labels[top_3_pred[i]], "probability": round(top_3_prob[i].item(), 4)}
        for i in range(3)
    ]

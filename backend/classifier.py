"""

    Classifier module for image classification using a pretrained ResNet50 model.
    This function takes in a preprocessed image and returns the top3 predictions from the model. The model is a resnet50 pretrained mode on ImageNet. 

"""


from torchvision import models
from torchvision.models import ResNet50_Weights
import torch
import requests


def predictions(im : torch.Tensor) -> list[dict]:

    """
    
    This function takes in a preprocessed image and returns the top3 predictions from the model. The model is a resnet50 pretrained mode on ImageNet. 
    The function also loads the ImageNet labels to return the class names instead of just the indices. 
    The output is a list of dictionaries containing the label and probability for each of the top 3 predictions.

    Args:
        im (torch.Tensor): A preprocessed image tensor of shape [1, 3, 224, 224] ready for classification.

    Returns:
        list[dict]: A list of dictionaries, each containing the 'label' (class name) and 'probability' (confidence score) for the top 3 predictions. 
        The probability is rounded to 4 decimal places for readability.

    Error Handling:
        - If the input tensor is not of the expected shape, an exception will be raised when attempting to run inference. This should be caught and handled in the calling function 
        (e.g., by returning an error message to the user).
        - If there is an issue with loading the model or labels, an exception will be raised. This should also be caught and handled in the calling function.
    """

    ## Loading the model. Here we're using a resnet50 which is a good general purpose model
    try:
        model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
    except Exception as e:
        raise ValueError(f"Error loading model: {e}")

    model.eval() ## We set our model to eval mode

    ## Loading the imageNet labels
    try:
        LABELS_URL = "https://storage.googleapis.com/download.tensorflow.org/data/imagenet_class_index.json"
        class_idx = requests.get(LABELS_URL).json()
    except Exception as e:
        raise ValueError(f"Error loading labels: {e}")
    
    labels = [class_idx[str(k)][1] for k in range(len(class_idx))]


    ## Run Inference with gradient calculation disabled for optimization
    with torch.no_grad():
        output = model(im)

    ## Get predictions
    probabilities = torch.nn.functional.softmax(output[0], dim=0)
    top_3_prob, top_3_pred = torch.topk(probabilities, 3)

    res = []

    ## get the results into a dictionary
    for i in range(3):
        res.append({"label": labels[top_3_pred[i]], "probability": round(top_3_prob[i].item(), 4)})

    return res
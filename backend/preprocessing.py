"""

Data-Loader. Contains script to load data from various sources to and preprocessing them for use in my classifier

"""

from PIL import Image, UnidentifiedImageError
import torchvision.transforms as transforms
import torch
import os
import io

# tensor template for the preprocessing

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),              # PIL Image → tensor, scales [0,255] to [0.0, 1.0]
    transforms.Normalize(               # optional, standard ImageNet stats
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

def preprocess_image(image_bytes) -> torch.Tensor:
    """
    Preprocesses an image for use in the classifier. This includes resizing, normalizing, and converting to a tensor.
    
    Args:
        image_bytes (bytes): The raw bytes of the image to preprocess.

    Returns:

        final_im : A preprocessed image ready for classification. This is a tensor of dimension [1, 3, 224, 224], where:
            - 1: Batch size (since we're processing one image at a time)
            - 3: Number of color channels (RGB)
            - 224: Height of the image in pixels
            - 224: Width of the image in pixels
    
    Error Handling:
        - If the input is not a valid image, an exception will be raised when attempting to open it with PIL. This should be caught and handled appropriately in the calling function 
        (e.g., by returning an error message to the user).
        - If the image cannot be processed (e.g., due to unsupported format), an exception will be raised during the transformation steps. 
        This should also be caught and handled in the calling function.
        - If the input is empty or a null image, an exception will be raised when attempting to open it. This should be checked for and handled in the calling function before attempting to preprocess.
    
    """

    # Load the image from the bytes

    try: 
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    except UnidentifiedImageError:
        raise ValueError("Invalid image data: Unable to identify image format.")
    except Exception as e:
        raise ValueError(f"Invalid image data: {e}")
    
    if image is None:
        raise ValueError("No image data provided.")

    # Resize, normalize, and convert the image to a tensor

    tensor_image = transform(image)

    # Add a batch dimension (since the model expects a batch of images)
    final_im : torch.Tensor = tensor_image.unsqueeze(0)

    return final_im


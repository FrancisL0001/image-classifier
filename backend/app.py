"""

Flask application for serving image classification requests.

"""

from fastapi import FastAPI, File, UploadFile
from preprocessing import preprocess_image
from classifier import predictions
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for all origins (you can restrict this in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://image-classifier-nu.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Endpoint to receive an image file and return the top 3 predictions from the classifier.

    Args:
        file (UploadFile): The uploaded image file.
    
    Returns:
        JSONResponse: A JSON response containing the top 3 predictions with their labels and probabilities.
    """
    try:
        # Read the uploaded file as bytes
        image_bytes = await file.read()

        # Preprocess the image
        preprocessed_image = preprocess_image(image_bytes)

        # Get predictions from the classifier
        preds = predictions(preprocessed_image)

        return JSONResponse(content={"predictions": preds})
    
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)
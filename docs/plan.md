# Image Classifier Plan

## Purpose Component(Why)

The purpose component outlines the goals and objectives of the image classifier, including the problem it aims to solve, the target audience, and the expected outcomes.

This app's goal is to take an image file and tell the user what that image is. It will take an image as input, and give the 3 top predictions on what the image might be with the various probabilities of each of them, as well as their confidence scores.



## Structure Component(What)

- Images: Inputs which will be predicted on.
- Predictions

### Server Side
 - Images
 - model
 - predictions

 The model takes an image, processes it, and return the predictions to the user. Overall the server won't have a very complex task as the heavy lifting will be done by the model, which will be trained on a large dataset of images and their corresponding labels. The server will be responsible for receiving the image input, passing it to the model for prediction, and returning the results to the user.

 We will have a list of predictions, containing 3 dictionary or JSON items, which will be modified to contain the name of the prediction and the probability. The confidence score might also be returned, but it is not a priority for the first version of the app.

### Client Side

 - Image
 - Predictions
 
 At the most basic level, you'd want to upload an image and receive the predictions. It's pretty much just an interface where you submit an image and receive the top 3 predictions and their probabilities. Might add a functionality to add the right prediction if the model is wrong, which would be a way to collect data and improve the model over time. But for the first version, it will just be a simple interface where you submit an image and receive the predictions.



## Process Component(How)

The model will want to get an imgge. Once it get's the image, it passes it through it's classification process. Once it get's the result it supplies it to the return variables(dict-list or JSON). This JSON will be returned to the view, and supplied to the frontend for display. 

Ideally, we'd want to get the image, preprocess it to the required format for the model, perform the preduction, compile the results and get the ones we want, put them in the appropriate format, and return them through the API to the frontend. 


# Hinelo-Silver Structure(What), Behavior(How), and Function(Why) (SBF)

# Don Norman User's mental model, Developers Logic Model, and System Image Model

# Daniel Jackson (Software Concepts) Purpose, state, actions, operational principles.


# API Design 

## Endpoints

- POST /predict: This endpoint will receive an image file, process it through the model, and return the top 3 predictions along with their probabilities and confidence scores.

## Request and Response Formats

### Request Format

The request will be a multipart/form-data containing the image file. For example:

```POST /predict
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA
------WebKitFormBoundary7MA
Content-Disposition: form-data; name="image"; filename="example.jpg"
Content-Type: image/jpeg
------WebKitFormBoundary7MA--
```

### Response Format

The response will be a JSON object containing the top 3 predictions, their probabilities, and confidence scores. For example:

```json
{
  "predictions": [
    {
      "label": "cat",
      "probability": 0.85
    },
    {
      "label": "dog",
      "probability": 0.10
    },
    {
      "label": "rabbit",
      "probability": 0.05
    }
  ]
}
```


# Classification Testing Plan

## Data Upload

We will want to ensure that the data upload is working correctly, and that the image is being received by the server. 

- Test that the image is being actually received by the server
- Test that the image is being correctly received(we will store the image in our testing folder, pass it through the upload process and verify that the image we get at the end of the pipe is the same as that provided at the beginning)
- cater for the cases of empty file, wrong file type, and other edge cases that might arise during the upload process.


## Data Preprocessing

- Test that the image is being preprocessed correctly for the model. This includes resizing, normalization, and any other transformations that are required for the model to make predictions.
- Test that the preprocessed image is in the correct format and shape expected by the model.
- test that the dimesions of the tensor we obtain at the end is the one expected by the model, and that the values are in the correct range.

## Model Prediction

- Test that the model is making predictions correctly. This can be done by using a known image and verifying that the predictions are as expected.
- Test that the model is returning the top 3 predictions along with their probabilities and confidence scores
- Test that the model is handling edge cases correctly, such as images that are not in the training dataset or images that are of poor quality.


## API Response

- Test that the API is returning a response in the expected format.
- Test that the API is returning the correct status codes for different scenarios (e.g., 200 for success, 400 for bad request, etc.).
- Test that the API is returning the expected error messages for different error scenarios. 
    - For example, if the image is not provided in the request, the API should return a 400 status code with an appropriate error message indicating that the image is required.
    - If the image format is not supported, the API should return a 400 status code
    - If the model fails to make a prediction, the API should return a 500 status code with an appropriate error message indicating that there was an internal server error.
    
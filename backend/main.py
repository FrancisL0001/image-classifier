"""

  FastAPI backend for image classification. This module defines the API endpoints and handles incoming requests for image classification.

"""

# from app import app
from uvicorn import run

if __name__ == "__main__":
    run("app:app", host="127.0.0.1", port=8000, reload=True)
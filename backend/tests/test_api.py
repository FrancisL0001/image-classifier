"""
Integration tests for the FastAPI application (app.py).

Covers:
- POST /predict: success path (200, correct response schema)
- POST /predict: missing file (422 from FastAPI validation)
- POST /predict: non-image payload (400 from our error handling)
- POST /predict: empty file (400 from our error handling)

The TestClient runs the full application stack including real model inference,
so these tests are slow by design (same model-load-per-request issue as classifier.py).
"""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)


@pytest.fixture
def valid_jpeg_upload():
    """A fresh seekable BytesIO JPEG for each test that needs one."""
    img = Image.new("RGB", (300, 300), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


# ---------------------------------------------------------------------------
# Success path
# ---------------------------------------------------------------------------

class TestPredictSuccess:
    def test_returns_200(self, valid_jpeg_upload):
        response = client.post(
            "/predict",
            files={"file": ("test.jpg", valid_jpeg_upload, "image/jpeg")},
        )
        assert response.status_code == 200

    def test_response_contains_predictions_key(self, valid_jpeg_upload):
        response = client.post(
            "/predict",
            files={"file": ("test.jpg", valid_jpeg_upload, "image/jpeg")},
        )
        assert "predictions" in response.json()

    def test_response_has_exactly_three_predictions(self, valid_jpeg_upload):
        response = client.post(
            "/predict",
            files={"file": ("test.jpg", valid_jpeg_upload, "image/jpeg")},
        )
        assert len(response.json()["predictions"]) == 3

    def test_each_prediction_has_label_and_probability(self, valid_jpeg_upload):
        response = client.post(
            "/predict",
            files={"file": ("test.jpg", valid_jpeg_upload, "image/jpeg")},
        )
        for pred in response.json()["predictions"]:
            assert "label" in pred
            assert "probability" in pred

    def test_probabilities_are_between_0_and_1(self, valid_jpeg_upload):
        response = client.post(
            "/predict",
            files={"file": ("test.jpg", valid_jpeg_upload, "image/jpeg")},
        )
        for pred in response.json()["predictions"]:
            assert 0.0 <= pred["probability"] <= 1.0

    def test_labels_are_non_empty_strings(self, valid_jpeg_upload):
        response = client.post(
            "/predict",
            files={"file": ("test.jpg", valid_jpeg_upload, "image/jpeg")},
        )
        for pred in response.json()["predictions"]:
            assert isinstance(pred["label"], str)
            assert len(pred["label"]) > 0

    def test_real_cat_image_returns_200(self, cat_image_file):
        response = client.post(
            "/predict",
            files={"file": ("cat.jpeg", cat_image_file, "image/jpeg")},
        )
        assert response.status_code == 200


# ---------------------------------------------------------------------------
# Error paths
# ---------------------------------------------------------------------------

class TestPredictErrors:
    def test_missing_file_returns_422(self):
        # FastAPI returns 422 Unprocessable Entity when a required field is absent
        response = client.post("/predict")
        assert response.status_code == 422

    def test_non_image_file_returns_400(self):
        buf = io.BytesIO(b"this is plaintext, not an image")
        response = client.post(
            "/predict",
            files={"file": ("data.txt", buf, "text/plain")},
        )
        assert response.status_code == 400

    def test_empty_file_returns_400(self):
        buf = io.BytesIO(b"")
        response = client.post(
            "/predict",
            files={"file": ("empty.jpg", buf, "image/jpeg")},
        )
        assert response.status_code == 400

    def test_error_response_contains_error_key(self):
        buf = io.BytesIO(b"not an image")
        response = client.post(
            "/predict",
            files={"file": ("bad.jpg", buf, "image/jpeg")},
        )
        assert "error" in response.json()

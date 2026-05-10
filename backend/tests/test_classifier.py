"""
Tests for classifier.py.

Covers:
- Return structure (list of 3 dicts with 'label' and 'probability')
- Value types and ranges
- Known-image sanity check (cat.jpeg should surface a feline label in top-3)
- Rejection of tensors with the wrong shape

Note: each call to predictions() loads the ResNet50 weights and fetches
ImageNet labels from the network, so these tests are intentionally slow.
This is a known design issue in classifier.py, not the tests.
"""

import pytest
import torch
from preprocessing import preprocess_image
from classifier import predictions


@pytest.fixture(scope="module")
def sample_tensor():
    """A random [1, 3, 224, 224] tensor — valid model input."""
    torch.manual_seed(0)
    return torch.randn(1, 3, 224, 224)


@pytest.fixture(scope="module")
def cat_tensor():
    """Preprocessed tensor from the real cat test image."""
    from pathlib import Path
    cat_bytes = (Path(__file__).parent.parent / "testimages" / "cat.jpeg").read_bytes()
    return preprocess_image(cat_bytes)


class TestPredictionsReturnStructure:
    def test_returns_a_list(self, sample_tensor):
        result = predictions(sample_tensor)
        assert isinstance(result, list)

    def test_returns_exactly_three_predictions(self, sample_tensor):
        result = predictions(sample_tensor)
        assert len(result) == 3

    def test_each_item_is_a_dict(self, sample_tensor):
        result = predictions(sample_tensor)
        for item in result:
            assert isinstance(item, dict)

    def test_each_dict_has_label_key(self, sample_tensor):
        result = predictions(sample_tensor)
        for item in result:
            assert "label" in item

    def test_each_dict_has_probability_key(self, sample_tensor):
        result = predictions(sample_tensor)
        for item in result:
            assert "probability" in item


class TestPredictionsValueTypes:
    def test_labels_are_non_empty_strings(self, sample_tensor):
        result = predictions(sample_tensor)
        for item in result:
            assert isinstance(item["label"], str)
            assert len(item["label"]) > 0

    def test_probabilities_are_floats(self, sample_tensor):
        result = predictions(sample_tensor)
        for item in result:
            assert isinstance(item["probability"], float)

    def test_probabilities_are_between_0_and_1(self, sample_tensor):
        result = predictions(sample_tensor)
        for item in result:
            assert 0.0 <= item["probability"] <= 1.0

    def test_probabilities_are_rounded_to_4_decimal_places(self, sample_tensor):
        result = predictions(sample_tensor)
        for item in result:
            assert item["probability"] == round(item["probability"], 4)

    def test_first_prediction_has_highest_probability(self, sample_tensor):
        result = predictions(sample_tensor)
        assert result[0]["probability"] >= result[1]["probability"]
        assert result[1]["probability"] >= result[2]["probability"]


class TestPredictionsKnownImage:
    def test_cat_image_surfaces_feline_label_in_top3(self, cat_tensor):
        result = predictions(cat_tensor)
        feline_terms = {"cat", "tabby", "kitten", "lynx", "tiger", "cougar",
                        "jaguar", "leopard", "cheetah", "persian", "siamese"}
        top_labels = {p["label"].lower() for p in result}
        assert any(
            any(term in label for term in feline_terms)
            for label in top_labels
        ), f"Expected a feline label in top-3, got: {[p['label'] for p in result]}"


class TestPredictionsInputValidation:
    def test_missing_batch_dimension_raises(self):
        # Shape [3, 224, 224] has no batch dim — model expects 4D input
        bad_tensor = torch.randn(3, 224, 224)
        with pytest.raises(Exception):
            predictions(bad_tensor)

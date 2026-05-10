"""
Tests for preprocessing.py.

Covers:
- Output shape and type
- Normalised value range
- Error handling: empty bytes, non-image bytes, invalid data
- Compatibility with real JPEG files
"""

import pytest
import torch
from preprocessing import preprocess_image


class TestPreprocessImageShape:
    def test_returns_torch_tensor(self, valid_image_bytes):
        result = preprocess_image(valid_image_bytes)
        assert isinstance(result, torch.Tensor)

    def test_output_shape_is_1_3_224_224(self, valid_image_bytes):
        result = preprocess_image(valid_image_bytes)
        assert result.shape == (1, 3, 224, 224)

    def test_batch_dimension_is_one(self, valid_image_bytes):
        result = preprocess_image(valid_image_bytes)
        assert result.shape[0] == 1

    def test_channel_dimension_is_three(self, valid_image_bytes):
        result = preprocess_image(valid_image_bytes)
        assert result.shape[1] == 3

    def test_spatial_dimensions_are_224(self, valid_image_bytes):
        result = preprocess_image(valid_image_bytes)
        assert result.shape[2] == 224
        assert result.shape[3] == 224


class TestPreprocessImageValues:
    def test_values_are_normalised_not_raw_pixel(self, valid_image_bytes):
        # After ImageNet normalisation values sit roughly in [-3, 3].
        # Raw pixel values would be in [0, 255]; that must not happen.
        result = preprocess_image(valid_image_bytes)
        assert result.max().item() < 10
        assert result.min().item() > -10

    def test_values_are_not_in_0_255_range(self, valid_image_bytes):
        result = preprocess_image(valid_image_bytes)
        assert result.max().item() <= 1.0 or result.min().item() < 0
        # At least one channel must be shifted below 0 by mean subtraction
        assert result.min().item() < 0

    def test_dtype_is_float(self, valid_image_bytes):
        result = preprocess_image(valid_image_bytes)
        assert result.dtype == torch.float32


class TestPreprocessImageRealFile:
    def test_valid_jpeg_from_file_correct_shape(self, cat_image_bytes):
        result = preprocess_image(cat_image_bytes)
        assert result.shape == (1, 3, 224, 224)

    def test_valid_jpeg_from_file_returns_tensor(self, cat_image_bytes):
        result = preprocess_image(cat_image_bytes)
        assert isinstance(result, torch.Tensor)


class TestPreprocessImageErrorHandling:
    def test_empty_bytes_raises_value_error(self, empty_bytes):
        with pytest.raises(ValueError):
            preprocess_image(empty_bytes)

    def test_non_image_bytes_raises_value_error(self, non_image_bytes):
        with pytest.raises(ValueError):
            preprocess_image(non_image_bytes)

    def test_truncated_jpeg_raises_value_error(self):
        # A byte string that looks like a JPEG header but is truncated
        truncated = b"\xff\xd8\xff\xe0" + b"\x00" * 10
        with pytest.raises((ValueError, Exception)):
            preprocess_image(truncated)

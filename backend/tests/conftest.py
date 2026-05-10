"""
Shared pytest fixtures for all backend tests.
"""

import io
import pytest
from pathlib import Path
from PIL import Image

TESTIMAGES_DIR = Path(__file__).parent.parent / "testimages"


@pytest.fixture
def valid_image_bytes():
    """A minimal valid RGB JPEG image as bytes (300x300 solid colour)."""
    img = Image.new("RGB", (300, 300), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def valid_image_file():
    """A seekable BytesIO of a valid JPEG, ready for multipart upload."""
    img = Image.new("RGB", (300, 300), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf


@pytest.fixture
def cat_image_bytes():
    """Raw bytes of the test cat image."""
    return (TESTIMAGES_DIR / "cat.jpeg").read_bytes()


@pytest.fixture
def cat_image_file():
    """Seekable BytesIO of the test cat image, ready for multipart upload."""
    buf = io.BytesIO((TESTIMAGES_DIR / "cat.jpeg").read_bytes())
    buf.seek(0)
    return buf


@pytest.fixture
def empty_bytes():
    return b""


@pytest.fixture
def non_image_bytes():
    return b"this is definitely not an image"

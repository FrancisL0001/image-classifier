FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

# Install CPU-only torch/torchvision (avoids ~1.5 GB of unused CUDA libraries).
# All other deps fall back to PyPI via --extra-index-url.
RUN pip install --no-cache-dir -r requirements.txt \
    --index-url https://download.pytorch.org/whl/cpu \
    --extra-index-url https://pypi.org/simple

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

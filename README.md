# Image Classifier

An end-to-end image classification system. Upload a photo and get the top-3 predicted labels with confidence scores, powered by a pretrained ResNet-50 CNN served through a REST API.

---

## What it does

- Accepts a user-uploaded image via a drag-and-drop interface
- Runs it through a pretrained ResNet-50 model (PyTorch, ImageNet-1K)
- Returns the top-3 predictions with confidence scores in real time
- Built on a client-server architecture: React frontend → FastAPI backend

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | FastAPI, PyTorch, torchvision, Pillow |
| Model | ResNet-50 pretrained on ImageNet-1K |
| Testing | pytest (backend), Jest + React Testing Library (frontend) |

---

## Getting started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py                   # runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                      # runs on http://localhost:5173
```

---

## Testing

```bash
# Backend — from the backend/ directory
pytest

# Frontend — from the frontend/ directory
npm test
```

---

## CI/CD

A CI pipeline should run `pytest` on the backend and `npm test` on the frontend on every push. The app is designed for deployment as two independent services (API + static frontend), making it straightforward to containerise or host on any cloud provider.

---

## Docs

Internal design decisions and architecture notes live in [`docs/plan.md`](docs/plan.md). The testing strategy is documented in [`docs/Testing_Plan.md`](docs/Testing_Plan.md).

import type { PredictResponse } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function classify(file: File): Promise<PredictResponse> {
  const body = new FormData();
  body.append('file', file);

  const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Server error ${res.status}`);
  }

  return res.json() as Promise<PredictResponse>;
}

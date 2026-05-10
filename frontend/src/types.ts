import type { DragEvent } from 'react';

// ── Domain ────────────────────────────────────────────────────────────────────

export interface Prediction {
  label: string;
  probability: number;
}

export interface PredictResponse {
  predictions: Prediction[];
}

// ── App state ─────────────────────────────────────────────────────────────────

export type Stage = 'idle' | 'ready' | 'loading' | 'done' | 'error';

// ── Component props ───────────────────────────────────────────────────────────

export interface DropZoneProps {
  isDragging: boolean;
  onDragEnter: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onClick: () => void;
}

export interface PredictionCardProps {
  prediction: Prediction;
  rank: number;
}

export interface ErrorBannerProps {
  message: string;
}

import { useState, useEffect } from 'react';
import type { PredictionCardProps } from '../types';

const RANK_LABEL  = ['#1', '#2', '#3'] as const;
const RANK_BADGE  = [
  'text-yellow-400 bg-yellow-400/10 ring-yellow-400/30',
  'text-slate-300  bg-slate-300/10  ring-slate-300/30',
  'text-rose-400   bg-rose-400/10   ring-rose-400/30',
] as const;
const BAR_GRADIENT = [
  'from-yellow-400 to-amber-500',
  'from-indigo-400 to-violet-500',
  'from-rose-400   to-pink-500',
] as const;

function formatLabel(raw: string): string {
  return raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProbabilityBar({ probability, rank }: { probability: number; rank: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setWidth(probability * 100), 80);
    return () => clearTimeout(id);
  }, [probability]);

  return (
    <div className="h-1.5 w-full rounded-full bg-slate-700/70 overflow-hidden">
      <div
        className={`h-full rounded-full bg-linear-to-r ${BAR_GRADIENT[rank]} transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function PredictionCard({ prediction, rank }: PredictionCardProps) {
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700/50 px-5 py-4 space-y-3">
      <div className="flex items-center justify-between gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ring-1 ${RANK_BADGE[rank]}`}>
            {RANK_LABEL[rank]}
          </span>
          <span className="text-white font-medium truncate text-sm">
            {formatLabel(prediction.label)}
          </span>
        </div>
        <span className="shrink-0 font-mono text-sm font-semibold text-indigo-400">
          {(prediction.probability * 100).toFixed(2)}%
        </span>
      </div>
      <ProbabilityBar probability={prediction.probability} rank={rank} />
    </div>
  );
}

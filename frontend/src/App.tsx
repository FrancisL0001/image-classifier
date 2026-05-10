import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { classify } from './api';
import type { Prediction, Stage } from './types';
import DropZone from './components/DropZone';
import PredictionCard from './components/PredictionCard';
import ErrorBanner from './components/ErrorBanner';
import Spinner from './components/Spinner';

const LOW_CONFIDENCE_THRESHOLD = 0.30;

export default function App() {
  const [stage, setStage]             = useState<Stage>('idle');
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [isDragging, setIsDragging]   = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, []);

  // ── File handling ────────────────────────────────────────────────────────

  function applyFile(f: File) {
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setPredictions([]);
    setErrorMsg(null);
    setStage('ready');
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) applyFile(f);
  }

  // ── Drag-and-drop ────────────────────────────────────────────────────────

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }

  function handleDragOver(e: DragEvent) { e.preventDefault(); }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) applyFile(f);
  }

  // ── Classification ───────────────────────────────────────────────────────

  async function handleClassify() {
    if (!file) return;
    setStage('loading');
    try {
      const result = await classify(file);
      setPredictions(result.predictions);
      setStage('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStage('error');
    }
  }

  function handleReset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setPredictions([]);
    setErrorMsg(null);
    setStage('idle');
    if (inputRef.current) inputRef.current.value = '';
  }

  // ── View ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-16">

      <header className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
          Image Classifier
        </h1>
        <p className="text-slate-500 text-sm">Upload a photo — get instant AI predictions</p>
      </header>

      <main className="w-full max-w-md space-y-4">

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="File upload"
        />

        {stage === 'idle' && (
          <DropZone
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          />
        )}

        {stage !== 'idle' && preview && (
          <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-800/40">
            <img src={preview} alt="Selected image preview" className="w-full max-h-64 object-contain" />
          </div>
        )}

        {stage === 'ready' && (
          <button
            onClick={handleClassify}
            className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm
              bg-linear-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              active:scale-[0.98] transition-all duration-150
              shadow-lg shadow-indigo-500/25"
          >
            Classify Image
          </button>
        )}

        {stage === 'loading' && <Spinner />}

        {stage === 'done' && predictions.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-1 pb-1">
              Top predictions
            </p>
            {predictions.map((p, i) => (
              <PredictionCard key={p.label} prediction={p} rank={i} />
            ))}
            {predictions[0].probability < LOW_CONFIDENCE_THRESHOLD && (
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 mt-1">
                <span className="text-amber-400 text-base leading-none mt-px">⚠</span>
                <p className="text-amber-300/80 text-xs leading-relaxed">
                  Confidence is low — the model isn't sure what this image is.
                  Take these predictions with a grain of salt.
                </p>
              </div>
            )}
          </div>
        )}

        {stage === 'error' && errorMsg && <ErrorBanner message={errorMsg} />}

        {(stage === 'ready' || stage === 'done' || stage === 'error') && (
          <button
            onClick={stage === 'ready' ? () => inputRef.current?.click() : handleReset}
            className="w-full py-3 rounded-2xl text-sm font-medium text-slate-500
              border border-slate-700/70 hover:border-slate-600 hover:text-slate-300
              transition-all duration-150"
          >
            {stage === 'ready' ? 'Change image' : 'Try another image'}
          </button>
        )}

      </main>

      <footer className="mt-16 text-xs text-slate-700">
        ResNet-50 · ImageNet-1K<br/>
        &copy; Francois Leutou 2026
      </footer>

    </div>
  );
}

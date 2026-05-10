import type { DropZoneProps } from '../types';

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-10 h-10"
    >
      <path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
      <polyline points="7 9 12 4 17 9" />
      <line x1="12" y1="4" x2="12" y2="16" />
    </svg>
  );
}

export default function DropZone({
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onClick,
}: DropZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={[
        'cursor-pointer select-none rounded-3xl border-2 border-dashed',
        'flex flex-col items-center justify-center gap-5 py-16 px-8',
        'transition-all duration-200',
        isDragging
          ? 'border-indigo-500 bg-indigo-500/5 scale-[1.015]'
          : 'border-slate-700 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50',
      ].join(' ')}
    >
      <span className={isDragging ? 'text-indigo-400' : 'text-slate-500'}>
        <UploadIcon />
      </span>

      <div className="text-center space-y-1.5">
        <p className="text-slate-300 font-medium">
          {isDragging ? 'Release to classify' : 'Drop an image here'}
        </p>
        <p className="text-slate-500 text-sm">or click to browse</p>
      </div>

      <span className="text-xs text-slate-600 border border-slate-700/80 px-3 py-1 rounded-full">
        JPG · PNG · WEBP · GIF
      </span>
    </div>
  );
}

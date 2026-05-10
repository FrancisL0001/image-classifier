function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-5 h-5 shrink-0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5a1 1 0 1 0 2 0V9a1 1 0 1 0-2 0v4zm1-7a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
      />
    </svg>
  );
}

import type { ErrorBannerProps } from '../types';

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4"
    >
      <span className="text-red-400 mt-0.5">
        <ErrorIcon />
      </span>
      <div className="space-y-0.5">
        <p className="text-red-300 font-medium text-sm">Classification failed</p>
        <p className="text-red-400/70 text-xs">{message}</p>
      </div>
    </div>
  );
}

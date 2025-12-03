export interface VisionImpairedToggleProps {
  isVisionImpaired: boolean;
  onToggle: () => void;
}

export function VisionImpairedToggle({
  isVisionImpaired,
  onToggle,
}: VisionImpairedToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isVisionImpaired ? 'Disable vision impaired mode' : 'Enable vision impaired mode'}
      aria-pressed={isVisionImpaired}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-md text-sm font-medium transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95 vision-impaired:text-sm vision-impaired:px-5 vision-impaired:py-3 vision-impaired:text-white vision-impaired:hover:bg-slate-700/70"
    >
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <span className="sr-only sm:not-sr-only">
        {isVisionImpaired ? 'High Contrast' : 'High Contrast'}
      </span>
    </button>
  );
}


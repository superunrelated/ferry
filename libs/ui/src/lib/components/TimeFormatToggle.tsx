import { TimeFormat } from '../hooks/useTimeFormat';
import { cva, vi } from '../utils/visionImpaired';

export interface TimeFormatToggleProps {
  timeFormat: TimeFormat;
  onToggle: () => void;
}

const button = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95'
);

const buttonVisionImpaired =
  'vision-impaired:text-sm vision-impaired:px-2.5 vision-impaired:py-1.5 vision-impaired:text-white vision-impaired:hover:bg-slate-700/70';

export function TimeFormatToggle({
  timeFormat,
  onToggle,
}: TimeFormatToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={
        timeFormat === '24h'
          ? 'Switch to 12-hour format'
          : 'Switch to 24-hour format'
      }
      aria-pressed={timeFormat === '12h'}
      className={vi(button(), buttonVisionImpaired)}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="sr-only sm:not-sr-only">
        {timeFormat === '24h' ? '24h' : '12h'}
      </span>
    </button>
  );
}

import { FerryDeparture } from '../types/timetable';
import { formatMinutesUntil, getMinutesUntil } from '../utils/timetable';

export interface FerryCardProps {
  departure: FerryDeparture;
  showCountdown?: boolean;
}

export function FerryCard({
  departure,
  showCountdown = false,
}: FerryCardProps) {
  const minutesUntil = getMinutesUntil(departure.time);
  const companyColors = {
    Fullers: 'bg-blue-100 border-blue-300 text-blue-900',
    'Island Direct': 'bg-green-100 border-green-300 text-green-900',
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 ${companyColors[departure.company]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-semibold">{departure.time}</span>
        <span className="text-sm font-medium px-2 py-1 rounded bg-white/50">
          {departure.company}
        </span>
      </div>
      <div className="text-sm text-gray-700">
        {departure.from} → {departure.to}
      </div>
      {showCountdown && minutesUntil >= 0 && (
        <div className="mt-2 text-sm font-medium">
          {formatMinutesUntil(minutesUntil)}
        </div>
      )}
      {departure.notes && departure.notes.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          {departure.notes.join(', ')}
        </div>
      )}
    </div>
  );
}

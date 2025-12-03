import { FerryDeparture } from '../types/timetable';
import { FerryCard } from './FerryCard';

export interface NextFerryProps {
  departures: FerryDeparture[];
  location: 'Auckland' | 'Waiheke' | null;
  loading?: boolean;
}

export function NextFerry({ departures, location, loading }: NextFerryProps) {
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">Loading ferry times...</div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">Unable to determine your location</div>
      </div>
    );
  }

  if (departures.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">No upcoming ferries found</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold mb-4">Next ferries from {location}</h2>
      {departures.map((departure, index) => (
        <FerryCard
          key={`${departure.company}-${departure.time}-${index}`}
          departure={departure}
          showCountdown={index === 0}
        />
      ))}
    </div>
  );
}

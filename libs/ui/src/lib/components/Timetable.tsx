import { FerryDeparture, DayGroup } from '../types/timetable';
import { FerryCard } from './FerryCard';

export interface TimetableProps {
  departures: FerryDeparture[];
  filterDirection?: 'Auckland' | 'Waiheke' | 'all';
  filterDay?: DayGroup | 'all';
}

const dayGroupLabels: Record<DayGroup, string> = {
  'monday-tuesday': 'Monday - Tuesday',
  wednesday: 'Wednesday',
  'wednesday-friday': 'Wednesday - Friday',
  'thursday-friday': 'Thursday - Friday',
  saturday: 'Saturday',
  sunday: 'Sunday / Public Holiday',
};

export function Timetable({
  departures,
  filterDirection = 'all',
  filterDay = 'all',
}: TimetableProps) {
  // Group departures by day group
  const grouped: Record<string, FerryDeparture[]> = {};

  for (const departure of departures) {
    if (filterDirection !== 'all' && departure.from !== filterDirection)
      continue;
    if (filterDay !== 'all' && departure.dayGroup !== filterDay) continue;

    const dayKey = departure.dayGroup || 'unknown';
    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }
    grouped[dayKey].push(departure);
  }

  // Sort times within each day group
  for (const dayKey in grouped) {
    grouped[dayKey].sort((a, b) => {
      const timeA = parseInt(a.time.replace(':', ''));
      const timeB = parseInt(b.time.replace(':', ''));
      return timeA - timeB;
    });
  }

  const dayOrder: DayGroup[] = [
    'monday-tuesday',
    'wednesday',
    'wednesday-friday',
    'thursday-friday',
    'saturday',
    'sunday',
  ];

  return (
    <div className="space-y-6">
      {dayOrder.map((day) => {
        const dayDepartures = grouped[day];
        if (!dayDepartures || dayDepartures.length === 0) return null;

        return (
          <div key={day} className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold mb-3">
              {dayGroupLabels[day]}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dayDepartures.map((departure, index) => (
                <FerryCard
                  key={`${departure.company}-${departure.time}-${day}-${index}`}
                  departure={departure}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

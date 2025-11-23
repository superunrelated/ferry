import { useState, useEffect } from 'react';
import { TimetableData } from '../types/timetable';

export function useTimetable() {
  const [timetableData, setTimetableData] = useState<TimetableData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/data/data.json').catch(() => null);

        if (response?.ok) {
          const data = await response.json();
          console.log(
            'Timetable data loaded:',
            data,
            'routes:',
            data?.routes?.length
          );
          setTimetableData(data);
        } else {
          console.log(
            'Timetable response not ok:',
            response?.status,
            response?.statusText
          );
          setError('Failed to load timetable data');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load timetable'
        );
      } finally {
        setLoading(false);
      }
    }

    loadTimetable();
  }, []);

  const timetables: TimetableData[] = [];
  if (timetableData) timetables.push(timetableData);

  return {
    timetables,
    loading,
    error,
  };
}

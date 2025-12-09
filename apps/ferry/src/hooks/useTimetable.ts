import { useState, useEffect, useMemo } from 'react';
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
          setTimetableData(data);
        } else {
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

  const timetables = useMemo(() => {
    if (!timetableData) return [];
    return [timetableData];
  }, [timetableData]);

  return {
    timetables,
    loading,
    error,
  };
}

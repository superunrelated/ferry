import { useMemo } from 'react';
import { Sailing } from '../types/timetable';

export interface GroupedSailing {
  time: string;
  sailings: Sailing[];
}

export function useGroupedSailings(sailings: Sailing[]): GroupedSailing[] {
  return useMemo(() => {
    const grouped = sailings.reduce((acc, sailing) => {
      const time = sailing.time;
      if (!acc[time]) {
        acc[time] = [];
      }
      acc[time].push(sailing);
      return acc;
    }, {} as Record<string, Sailing[]>);

    return Object.entries(grouped).map(([time, sailings]) => ({
      time,
      sailings,
    }));
  }, [sailings]);
}


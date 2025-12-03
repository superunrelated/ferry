import { useMemo } from 'react';
import { useTimetable } from './useTimetable';
import { useFilters } from './useFilters';
import { getRemainingSailingsToday } from '../utils/timetable';
import { Sailing } from '../types/timetable';

export function useRemainingSailings() {
  const { timetables } = useTimetable();
  const { departureLocation, filterCompany } = useFilters();

  const remainingSailings = useMemo(() => {
    if (!departureLocation) {
      return [];
    }

    const allRemainingSailings = getRemainingSailingsToday(
      timetables,
      departureLocation
    );

    if (filterCompany === 'all') {
      return allRemainingSailings;
    }

    return allRemainingSailings.filter((s) => s.company === filterCompany);
  }, [timetables, departureLocation, filterCompany]);

  return remainingSailings;
}

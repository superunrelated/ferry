import { useMemo } from 'react';
import {
  TimetableData,
  DayOfWeek,
  FerryCompany,
  Location,
} from '../types/timetable';
import { getCurrentTimeInMinutes } from '../utils/timetable';
import { getCurrentDayOfWeekFromDate } from '../utils/timetableConstants';
import {
  buildTimeSlots,
  findNextSailingTime,
  groupTimeSlotsByHour,
  TimeSlot,
} from '../utils/timetableData';

export interface UseTimetableDataResult {
  timeSlots: TimeSlot[];
  hourGroups: { hour: number; slots: TimeSlot[] }[];
  nextSailingTime: string | null;
  currentDayOfWeek: DayOfWeek;
  currentTimeInMinutes: number;
}

export function useTimetableData(
  timetables: TimetableData[],
  departureLocation: Location | null,
  filterCompany: FerryCompany | 'all'
): UseTimetableDataResult {
  const now = useMemo(() => new Date(), []);
  const currentTimeInMinutes = useMemo(() => getCurrentTimeInMinutes(), []);
  const currentDayOfWeek = useMemo(
    () => getCurrentDayOfWeekFromDate(now),
    [now]
  );

  const timeSlots = useMemo(
    () => buildTimeSlots(timetables, departureLocation, filterCompany),
    [timetables, departureLocation, filterCompany]
  );

  const nextSailingTime = useMemo(
    () =>
      findNextSailingTime(timeSlots, currentDayOfWeek, currentTimeInMinutes),
    [timeSlots, currentDayOfWeek, currentTimeInMinutes]
  );

  const hourGroups = useMemo(
    () => groupTimeSlotsByHour(timeSlots),
    [timeSlots]
  );

  return {
    timeSlots,
    hourGroups,
    nextSailingTime,
    currentDayOfWeek,
    currentTimeInMinutes,
  };
}

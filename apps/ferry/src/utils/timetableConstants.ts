import { DayOfWeek } from '../types/timetable';

export const DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function getCurrentDayOfWeekFromDate(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  return DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
}


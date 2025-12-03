import {
  TimetableData,
  DayOfWeek,
  Sailing,
  FerryCompany,
  Location,
} from '../types/timetable';
import { parseTime } from './timetable';
import { DAYS } from './timetableConstants';

export interface TimeSlot {
  time: string;
  timeInMinutes: number;
  sailings: { [key in DayOfWeek]: Sailing[] };
}

export function buildTimeSlots(
  timetables: TimetableData[],
  departureLocation: Location | null,
  filterCompany: FerryCompany | 'all'
): TimeSlot[] {
  if (!departureLocation || timetables.length === 0) {
    return [];
  }

  const timeSlotMap = new Map<string, TimeSlot>();

  for (const timetable of timetables) {
    for (const route of timetable.routes) {
      if (route.from !== departureLocation) continue;

      for (const day of DAYS) {
        const daySailings = route.schedule[day] || [];
        for (const sailing of daySailings) {
          if (!sailing.time) continue;

          const timeInMinutes = parseTime(sailing.time);
          let timeSlot = timeSlotMap.get(sailing.time);

          if (!timeSlot) {
            timeSlot = {
              time: sailing.time,
              timeInMinutes,
              sailings: {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: [],
              },
            };
            timeSlotMap.set(sailing.time, timeSlot);
          }

          timeSlot.sailings[day].push(sailing);
        }
      }
    }
  }

  const timeSlots = Array.from(timeSlotMap.values());
  timeSlots.sort((a, b) => a.timeInMinutes - b.timeInMinutes);

  if (filterCompany !== 'all') {
    for (const slot of timeSlots) {
      for (const day of DAYS) {
        slot.sailings[day] = slot.sailings[day].filter(
          (s) => s.company === filterCompany
        );
      }
    }
    return timeSlots.filter((slot) =>
      DAYS.some((day) => slot.sailings[day].length > 0)
    );
  }

  return timeSlots;
}

export function findNextSailingTime(
  timeSlots: TimeSlot[],
  currentDayOfWeek: DayOfWeek,
  currentTimeInMinutes: number
): string | null {
  for (const slot of timeSlots) {
    const daySailings = slot.sailings[currentDayOfWeek];
    if (daySailings.length > 0 && slot.timeInMinutes >= currentTimeInMinutes) {
      return slot.time;
    }
  }
  return null;
}

export function groupTimeSlotsByHour(timeSlots: TimeSlot[]): {
  hour: number;
  slots: TimeSlot[];
}[] {
  const hourGroups: { hour: number; slots: TimeSlot[] }[] = [];
  let currentHour = -1;
  let currentGroup: TimeSlot[] = [];

  for (const slot of timeSlots) {
    const slotHour = Math.floor(slot.timeInMinutes / 60);
    if (slotHour !== currentHour) {
      if (currentGroup.length > 0) {
        hourGroups.push({ hour: currentHour, slots: currentGroup });
      }
      currentHour = slotHour;
      currentGroup = [slot];
    } else {
      currentGroup.push(slot);
    }
  }

  if (currentGroup.length > 0) {
    hourGroups.push({ hour: currentHour, slots: currentGroup });
  }

  return hourGroups;
}

import {
  TimetableData,
  FerryDeparture,
  Location,
  DayGroup,
  DayOfWeek,
  Sailing,
} from '../types/timetable';

export function getCurrentDayOfWeek(): DayOfWeek {
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[day];
}

export function getCurrentDayGroup(): DayGroup {
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  if (day === 0) return 'sunday';
  if (day === 1 || day === 2) return 'monday-tuesday';
  if (day === 3) return 'wednesday';
  if (day === 4 || day === 5) return 'wednesday-friday'; // Thursday-Friday
  if (day === 6) return 'saturday';

  return 'sunday';
}

export function getAllDayGroupsForDay(day: number): DayGroup[] {
  const groups: DayGroup[] = [];

  if (day === 0) {
    groups.push('sunday');
  } else if (day === 1 || day === 2) {
    groups.push('monday-tuesday');
  } else if (day === 3) {
    groups.push('wednesday');
    groups.push('wednesday-friday');
  } else if (day === 4 || day === 5) {
    groups.push('wednesday-friday');
    groups.push('thursday-friday');
  } else if (day === 6) {
    groups.push('saturday');
  }

  return groups;
}

export function parseTime(timeStr: string | undefined): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getAllDepartures(
  timetables: TimetableData[],
  from?: Location,
  to?: Location
): FerryDeparture[] {
  const departures: FerryDeparture[] = [];

  for (const timetable of timetables) {
    for (const route of timetable.routes) {
      if (from && route.from !== from) continue;
      if (to && route.to !== to) continue;

      // Convert DaySchedule to FerryDeparture[]
      const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      for (const day of days) {
        const sailings = route.schedule[day];
        if (!sailings || !Array.isArray(sailings)) continue;

        for (const sailing of sailings) {
          if (!sailing || !sailing.time) continue;
          
          departures.push({
            time: sailing.time,
            company: sailing.company,
            from: route.from,
            to: route.to,
            dayGroup: getDayGroupForDayOfWeek(day),
          });
        }
      }
    }
  }

  return departures;
}

function getDayGroupForDayOfWeek(day: DayOfWeek): DayGroup {
  switch (day) {
    case 'monday':
    case 'tuesday':
      return 'monday-tuesday';
    case 'wednesday':
      return 'wednesday';
    case 'thursday':
    case 'friday':
      return 'wednesday-friday';
    case 'saturday':
      return 'saturday';
    case 'sunday':
      return 'sunday';
  }
}

export function getRemainingSailingsToday(
  timetables: TimetableData[],
  from: Location
): Sailing[] {
  const now = getCurrentTimeInMinutes();
  const currentDay = getCurrentDayOfWeek();

  console.log('getRemainingSailingsToday - now:', now, 'currentDay:', currentDay, 'from:', from);

  const todaySailings: Sailing[] = [];

  console.log('Processing', timetables.length, 'timetables');
  
  for (const timetable of timetables) {
    console.log('Processing timetable with', timetable.routes.length, 'routes');

    for (const route of timetable.routes) {
      console.log('Checking route:', route.from, '->', route.to, 'matches', from, '?', route.from === from);
      if (route.from !== from) {
        console.log('Skipping route - from does not match');
        continue;
      }

      console.log('Found route:', route.from, '->', route.to);
      const daySailings = route.schedule[currentDay];
      console.log('Day sailings for', currentDay, ':', daySailings);
      
      if (!daySailings || !Array.isArray(daySailings)) {
        console.log('No sailings for', currentDay, 'or not an array');
        continue;
      }

      for (const sailing of daySailings) {
        // In data.json, all sailings are objects with time, company, and optional slow
        if (!sailing || typeof sailing !== 'object' || !sailing.time) {
          console.log('Skipping sailing - invalid format:', sailing);
          continue;
        }

        const timeStr = sailing.time;
        const company = sailing.company;
        const slow = sailing.slow;

        // Skip if time is missing or invalid
        if (!timeStr) {
          console.log('Skipping sailing - missing time:', sailing);
          continue;
        }
        
        const timeInMinutes = parseTime(timeStr);
        console.log('Sailing:', timeStr, 'parsed to:', timeInMinutes, 'now:', now, '>= now?', timeInMinutes >= now);
        
        // Skip if time parsing failed (returns 0 for invalid)
        if (timeInMinutes === 0 && timeStr !== '00:00') {
          console.log('Skipping - invalid time parse');
          continue;
        }

        // If time is today and in the future (or same minute)
        if (timeInMinutes >= now) {
          const sailingObj: Sailing = {
            time: timeStr,
            company,
            ...(slow !== undefined && { slow }),
          };
          console.log('Adding sailing:', sailingObj);
          todaySailings.push(sailingObj);
        } else {
          console.log('Skipping - time is in the past:', timeStr, timeInMinutes, '<', now);
        }
      }
    }
  }

  console.log('Total sailings found:', todaySailings.length);

  // Sort by time
  todaySailings.sort((a, b) => {
    const timeA = parseTime(a.time);
    const timeB = parseTime(b.time);
    if (timeA !== timeB) return timeA - timeB;
    // If same time, prefer Fullers (arbitrary)
    return a.company === 'Fullers' ? -1 : 1;
  });

  return todaySailings;
}

export function getNextFerries(
  timetables: TimetableData[],
  from: Location,
  count: number = 3
): FerryDeparture[] {
  const remaining = getRemainingSailingsToday(timetables, from);
  
  // Convert Sailing[] to FerryDeparture[] by finding the route for each sailing
  const departures: FerryDeparture[] = [];
  
  for (const sailing of remaining.slice(0, count)) {
    // Find the route that contains this sailing
    for (const timetable of timetables) {
      for (const route of timetable.routes) {
        if (route.from !== from) continue;
        
        // Check if this sailing exists in this route's schedule
        const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of days) {
          const daySailings = route.schedule[day];
          if (daySailings?.some(s => s.time === sailing.time && s.company === sailing.company)) {
            departures.push({
              time: sailing.time,
              company: sailing.company,
              from: route.from,
              to: route.to,
              dayGroup: getDayGroupForDayOfWeek(day),
            });
            break;
          }
        }
        if (departures.length > 0 && departures[departures.length - 1].time === sailing.time) {
          break;
        }
      }
      if (departures.length > 0 && departures[departures.length - 1].time === sailing.time) {
        break;
      }
    }
  }
  
  return departures;
}

export function isSlowSailing(sailing: Sailing): boolean {
  return sailing.slow === true;
}

export function getMinutesUntil(time: string): number {
  const now = getCurrentTimeInMinutes();
  const target = parseTime(time);
  if (target >= now) {
    return target - now;
  }
  // If time has passed, it's tomorrow
  return 24 * 60 - now + target;
}

export function formatMinutesUntil(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}


import { useState, useEffect } from 'react';
import {
  TimetableData,
  Sailing,
  DayOfWeek,
  Location,
} from '../types/timetable';

export function useEditableTimetable(initialData: TimetableData | null) {
  const [timetableData, setTimetableData] = useState<TimetableData | null>(
    initialData
  );

  useEffect(() => {
    if (initialData) {
      setTimetableData(JSON.parse(JSON.stringify(initialData)));
    }
  }, [initialData]);

  const removeSailing = (
    time: string,
    day: DayOfWeek,
    sailingIndex: number,
    departureLocation: Location
  ) => {
    if (!timetableData) return;

    setTimetableData((prev) => {
      if (!prev) return prev;

      const newData = JSON.parse(JSON.stringify(prev));
      const route = newData.routes.find(
        (r: { from: Location; to: Location }) => r.from === departureLocation
      );

      if (route) {
        const daySailings = route.schedule[day];
        const timeSlotSailings = daySailings.filter(
          (s: Sailing) => s.time === time
        );

        if (sailingIndex < timeSlotSailings.length) {
          const sailingToRemove = timeSlotSailings[sailingIndex];
          let foundCount = 0;
          route.schedule[day] = daySailings.filter((s: Sailing) => {
            if (s.time === time) {
              const shouldKeep = foundCount !== sailingIndex;
              foundCount++;
              return shouldKeep;
            }
            return true;
          });
        }
      }

      return newData;
    });
  };

  const addSailing = (
    time: string,
    day: DayOfWeek,
    company: 'Fullers' | 'Island Direct',
    departureLocation: Location,
    slow?: boolean
  ) => {
    if (!timetableData) return;

    setTimetableData((prev) => {
      if (!prev) return prev;

      const newData = JSON.parse(JSON.stringify(prev));
      let route = newData.routes.find(
        (r: { from: Location; to: Location }) => r.from === departureLocation
      );

      if (!route) {
        const toLocation: Location =
          departureLocation === 'Auckland' ? 'Waiheke' : 'Auckland';
        route = {
          from: departureLocation,
          to: toLocation,
          schedule: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          },
        };
        newData.routes.push(route);
      }

      const newSailing: Sailing = {
        time,
        company,
        ...(slow && { slow: true }),
      };

      route.schedule[day].push(newSailing);
      route.schedule[day].sort((a: Sailing, b: Sailing) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
      });

      return newData;
    });
  };

  const getDataForDownload = (): TimetableData | null => {
    if (!timetableData) return null;
    return {
      ...timetableData,
      lastUpdated: new Date().toISOString(),
    };
  };

  return {
    timetableData,
    removeSailing,
    addSailing,
    getDataForDownload,
  };
}

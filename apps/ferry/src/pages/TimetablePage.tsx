import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useTimetable } from '../hooks/useTimetable';
import { TabNavigation } from '@ferry/ui';
import { Location, DayOfWeek, Sailing } from '../types/timetable';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

interface TimeSlot {
  time: string;
  timeInMinutes: number;
  sailings: { [key in DayOfWeek]: Sailing[] };
}

export function TimetablePage() {
  const {
    location: detectedLocation,
    state,
    error,
    requestLocation,
  } = useLocation();
  const locationLoading = state === 'loading';
  const { timetables, loading: timetableLoading } = useTimetable();
  const [departureLocation, setDepartureLocation] = useState<Location | null>(
    detectedLocation
  );

  // Update departure location when detected location changes
  useEffect(() => {
    if (detectedLocation) {
      setDepartureLocation(detectedLocation);
    }
  }, [detectedLocation]);

  const loading = timetableLoading || locationLoading;
  const nextSailingRef = useRef<HTMLTableRowElement>(null);
  const currentDayHeaderRef = useRef<HTMLTableCellElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get current time and day
  const now = new Date();
  const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
  const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentDayOfWeek: DayOfWeek = DAYS[currentDayIndex === 0 ? 6 : currentDayIndex - 1];

  // Build time slots from all sailings across all days
  const timeSlots: TimeSlot[] = [];
  const timeSlotMap = new Map<string, TimeSlot>();
  
  // Find the next sailing time (first time >= current time on current day)
  let nextSailingTime: string | null = null;

  if (departureLocation && timetables.length > 0) {
    // Collect all unique times from all days
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

    // Convert map to array and sort by time
    timeSlots.push(...Array.from(timeSlotMap.values()));
    timeSlots.sort((a, b) => a.timeInMinutes - b.timeInMinutes);
    
    // Find the next sailing time on the current day
    for (const slot of timeSlots) {
      const daySailings = slot.sailings[currentDayOfWeek];
      if (daySailings.length > 0 && slot.timeInMinutes >= currentTimeInMinutes) {
        nextSailingTime = slot.time;
        break;
      }
    }
  }

  // Group by hour for visual separation
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

  // Scroll to next sailing and current day when data is loaded
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let scrollTop = container.scrollTop;
        let scrollLeft = container.scrollLeft;

        // Calculate vertical scroll to next sailing
        if (nextSailingTime && nextSailingRef.current) {
          const row = nextSailingRef.current;
          const rowTop = row.offsetTop;
          const containerTop = container.scrollTop;
          const containerHeight = container.clientHeight;
          const rowHeight = row.offsetHeight;
          
          // Calculate position to center the row in the container
          scrollTop = rowTop - containerTop - (containerHeight / 2) + (rowHeight / 2) + container.scrollTop;
        }

        // Calculate horizontal scroll to current day column
        if (currentDayHeaderRef.current) {
          const header = currentDayHeaderRef.current;
          const headerLeft = header.offsetLeft;
          const containerLeft = container.scrollLeft;
          const containerWidth = container.clientWidth;
          const headerWidth = header.offsetWidth;
          
          // Calculate position to center the column in the container
          scrollLeft = headerLeft - containerLeft - (containerWidth / 2) + (headerWidth / 2) + container.scrollLeft;
        }

        // Scroll to both positions simultaneously
        container.scrollTo({
          top: scrollTop,
          left: scrollLeft,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [loading, nextSailingTime, timeSlots.length, currentDayOfWeek]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TabNavigation />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                {error.includes('denied')
                  ? 'Location access denied. Please enable location services to see ferries from your location.'
                  : 'Unable to get your location.'}
              </p>
              <button
                onClick={requestLocation}
                className="text-sm text-yellow-900 underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : !detectedLocation ? (
            <div className="text-center py-8">
              <div className="text-gray-600">
                Unable to determine your location
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">
                    Timetable from {departureLocation}
                  </h2>
                  {detectedLocation &&
                    departureLocation !== detectedLocation && (
                      <button
                        onClick={() => setDepartureLocation(detectedLocation)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Show from {detectedLocation}
                      </button>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Location
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDepartureLocation('Auckland')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        departureLocation === 'Auckland'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Auckland
                    </button>
                    <button
                      onClick={() => setDepartureLocation('Waiheke')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        departureLocation === 'Waiheke'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Waiheke
                    </button>
                  </div>
                </div>
              </div>
              <div ref={scrollContainerRef} className="overflow-auto max-h-[calc(100vh-200px)]">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-20">
                    <tr>
                      <th className="sticky left-0 z-30 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">
                        Time
                      </th>
                      {DAYS.map((day, index) => (
                        <th
                          key={day}
                          ref={day === currentDayOfWeek ? currentDayHeaderRef : null}
                          className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider border-b border-gray-200 ${
                            day === currentDayOfWeek
                              ? 'bg-blue-100 text-blue-800 font-bold'
                              : 'text-gray-500 bg-gray-50'
                          }`}
                        >
                          {DAY_LABELS[index]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hourGroups.map((group, groupIndex) => (
                      <React.Fragment key={group.hour}>
                        {group.slots.map((slot, slotIndex) => {
                          const isFirstInHour = slotIndex === 0;
                          const isNextSailing = slot.time === nextSailingTime;
                          return (
                            <tr
                              key={slot.time}
                              ref={isNextSailing ? nextSailingRef : null}
                              className={`group ${
                                isFirstInHour && groupIndex > 0
                                  ? 'border-t-2 border-gray-400'
                                  : ''
                              }`}
                            >
                              <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r-2 border-gray-300">
                                {slot.time}
                              </td>
                              {DAYS.map((day) => {
                                const daySailings = slot.sailings[day];
                                const isCurrentDay = day === currentDayOfWeek;
                                const isNextSailingOnCurrentDay = isNextSailing && isCurrentDay;
                                return (
                                  <td
                                    key={day}
                                    className={`px-4 py-3 text-center text-sm border-r border-gray-200 last:border-r-0 bg-white ${
                                      isCurrentDay ? 'bg-blue-50' : ''
                                    } ${
                                      isNextSailingOnCurrentDay
                                        ? 'bg-yellow-200 border-l-4 border-l-yellow-500'
                                        : ''
                                    }`}
                                  >
                                    {daySailings.length > 0 ? (
                                      <div className="space-y-1">
                                        {daySailings.map((sailing, idx) => (
                                          <div
                                            key={idx}
                                            className={`inline-block px-2 py-1 rounded text-xs ${
                                              sailing.company === 'Fullers'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                            } ${
                                              sailing.slow
                                                ? 'border border-orange-400'
                                                : ''
                                            }`}
                                          >
                                            {sailing.company}
                                            {sailing.slow && (
                                              <span className="ml-1 text-orange-600">
                                                (slow)
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

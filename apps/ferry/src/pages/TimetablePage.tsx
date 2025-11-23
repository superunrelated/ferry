import React, { useState, useEffect, useRef } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Label from '@radix-ui/react-label';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
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

  // Show error dialog when error occurs
  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const loading = timetableLoading || locationLoading;
  const nextSailingRef = useRef<HTMLTableRowElement>(null);
  const currentDayHeaderRef = useRef<HTMLTableCellElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <TabNavigation />
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <AlertDialog.Root open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 max-w-md w-full z-50">
                <AlertDialog.Title className="text-lg font-bold text-slate-100 mb-2">
                  Location Error
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-slate-300 mb-6">
                  {error?.includes('denied')
                    ? 'Location access denied. Please enable location services to see ferries from your location.'
                    : 'Unable to get your location.'}
                </AlertDialog.Description>
                <div className="flex gap-3 justify-end">
                  <AlertDialog.Cancel asChild>
                    <button
                      onClick={() => setShowErrorDialog(false)}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      onClick={() => {
                        setShowErrorDialog(false);
                        requestLocation();
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      Try again
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-cyan-400"></div>
              <div className="text-slate-400 mt-4">Loading...</div>
            </div>
          ) : !detectedLocation ? (
            <div className="text-center py-12">
              <div className="text-slate-400">
                Unable to determine your location
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Timetable from {departureLocation}
                  </h2>
                  {detectedLocation &&
                    departureLocation !== detectedLocation && (
                      <button
                        onClick={() => setDepartureLocation(detectedLocation)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors"
                      >
                        Show from {detectedLocation}
                      </button>
                    )}
                </div>
                <div>
                  <Label.Root className="block text-sm font-semibold text-slate-300 mb-2">
                    Departure Location
                  </Label.Root>
                  <ToggleGroup.Root
                    type="single"
                    value={departureLocation || undefined}
                    onValueChange={(value) => {
                      if (value) setDepartureLocation(value as Location);
                    }}
                    className="inline-flex gap-1 rounded-lg bg-slate-900/50 p-1 w-full border border-slate-700/50"
                  >
                    <ToggleGroup.Item
                      value="Auckland"
                      className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500/20 data-[state=on]:to-blue-500/20 data-[state=on]:text-cyan-300 data-[state=on]:shadow-lg data-[state=on]:shadow-cyan-500/20"
                    >
                      Auckland
                    </ToggleGroup.Item>
                    <ToggleGroup.Item
                      value="Waiheke"
                      className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500/20 data-[state=on]:to-blue-500/20 data-[state=on]:text-cyan-300 data-[state=on]:shadow-lg data-[state=on]:shadow-cyan-500/20"
                    >
                      Waiheke
                    </ToggleGroup.Item>
                  </ToggleGroup.Root>
                </div>
              </div>
              <div ref={scrollContainerRef} className="overflow-auto max-h-[calc(100vh-200px)]">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700/50">
                    <tr>
                      <th className="sticky left-0 z-30 bg-slate-800/95 backdrop-blur-sm px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-r-2 border-slate-700/50">
                        Time
                      </th>
                      {DAYS.map((day, index) => (
                        <th
                          key={day}
                          ref={day === currentDayOfWeek ? currentDayHeaderRef : null}
                          className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider border-b border-slate-700/50 ${
                            day === currentDayOfWeek
                              ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/20 text-cyan-300 font-bold border-cyan-500/30'
                              : 'text-slate-400 bg-slate-800/80'
                          }`}
                        >
                          {DAY_LABELS[index]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {hourGroups.map((group, groupIndex) => (
                      <React.Fragment key={group.hour}>
                        {group.slots.map((slot, slotIndex) => {
                          const isFirstInHour = slotIndex === 0;
                          const isNextSailing = slot.time === nextSailingTime;
                          return (
                            <tr
                              key={slot.time}
                              ref={isNextSailing ? nextSailingRef : null}
                              className={`group hover:bg-slate-800/20 transition-colors ${
                                isFirstInHour && groupIndex > 0
                                  ? 'border-t-2 border-slate-600/50'
                                  : ''
                              }`}
                            >
                              <td className="sticky left-0 z-10 bg-slate-800/95 backdrop-blur-sm group-hover:bg-slate-700/50 px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-200 border-r-2 border-slate-700/50">
                                {slot.time}
                              </td>
                              {DAYS.map((day) => {
                                const daySailings = slot.sailings[day];
                                const isCurrentDay = day === currentDayOfWeek;
                                const isNextSailingOnCurrentDay = isNextSailing && isCurrentDay;
                                return (
                                  <td
                                    key={day}
                                    className={`px-6 py-4 text-center text-sm border-r border-slate-700/30 last:border-r-0 ${
                                      isCurrentDay ? 'bg-slate-800/30' : 'bg-slate-900/30'
                                    } ${
                                      isNextSailingOnCurrentDay
                                        ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-l-4 border-l-yellow-400 shadow-lg shadow-yellow-500/20'
                                        : ''
                                    }`}
                                  >
                                    {daySailings.length > 0 ? (
                                      <div className="space-y-1.5">
                                        {daySailings.map((sailing, idx) => {
                                          const isFullers = sailing.company === 'Fullers';
                                          return (
                                            <div
                                              key={idx}
                                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                                                isFullers
                                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                              } ${
                                                sailing.slow
                                                  ? 'ring-2 ring-orange-400/50'
                                                  : ''
                                              }`}
                                            >
                                              {sailing.company}
                                              {sailing.slow && (
                                                <span className="ml-1.5 text-orange-400 text-[10px]">
                                                  (slow)
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-slate-600">-</span>
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

import React from 'react';
import { DayOfWeek } from '../../types/timetable';
import { TimeSlot } from '../../utils/timetableData';
import { TimetableHeader } from './TimetableHeader';
import { TimetableRow } from './TimetableRow';

export interface TimetableTableProps {
  hourGroups: { hour: number; slots: TimeSlot[] }[];
  currentDayOfWeek: DayOfWeek;
  nextSailingTime: string | null;
  nextSailingRef: React.RefObject<HTMLTableRowElement>;
  currentDayHeaderRef: React.RefObject<HTMLTableCellElement>;
}

export function TimetableTable({
  hourGroups,
  currentDayOfWeek,
  nextSailingTime,
  nextSailingRef,
  currentDayHeaderRef,
}: TimetableTableProps) {
  return (
    <table className="w-full border-collapse">
      <TimetableHeader
        currentDayOfWeek={currentDayOfWeek}
        currentDayHeaderRef={currentDayHeaderRef}
      />
      <tbody className="divide-y divide-slate-700/30 vision-impaired:divide-y-2 vision-impaired:divide-white">
        {hourGroups.map((group, groupIndex) => (
          <React.Fragment key={group.hour}>
            {group.slots.map((slot, slotIndex) => {
              const isFirstInHour = slotIndex === 0;
              const isNextSailing = slot.time === nextSailingTime;
              return (
                <TimetableRow
                  key={slot.time}
                  slot={slot}
                  currentDayOfWeek={currentDayOfWeek}
                  isNextSailing={isNextSailing}
                  isFirstInHour={isFirstInHour}
                  groupIndex={groupIndex}
                  nextSailingRef={isNextSailing ? nextSailingRef : null}
                />
              );
            })}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}


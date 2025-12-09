import React from 'react';
import { DayOfWeek } from '../../types/timetable';
import { TimeSlot } from '../../utils/timetableData';
import { TimetableHeader } from '../timetable/TimetableHeader';
import { AdminTimetableRow } from './AdminTimetableRow';
import { cva, vi } from '@ferry/ui';
import { Location } from '../../types/timetable';

export interface AdminTimetableTableProps {
  hourGroups: { hour: number; slots: TimeSlot[] }[];
  currentDayOfWeek: DayOfWeek;
  nextSailingTime: string | null;
  nextSailingRef: React.RefObject<HTMLTableRowElement>;
  currentDayHeaderRef: React.RefObject<HTMLTableCellElement>;
  departureLocation: Location | null;
  filterCompany?: string;
  onRemoveSailing: (time: string, day: DayOfWeek, sailingIndex: number) => void;
}

const tableBody = cva('divide-y divide-slate-700/30');
const tableBodyVisionImpaired =
  'vision-impaired:divide-y-2 vision-impaired:divide-white';

export function AdminTimetableTable({
  hourGroups,
  currentDayOfWeek,
  nextSailingTime,
  nextSailingRef,
  currentDayHeaderRef,
  departureLocation,
  filterCompany,
  onRemoveSailing,
}: AdminTimetableTableProps) {
  const keyPrefix = `${departureLocation || ''}-${filterCompany || ''}`;

  return (
    <table className="w-full border-collapse">
      <TimetableHeader
        currentDayOfWeek={currentDayOfWeek}
        currentDayHeaderRef={currentDayHeaderRef}
      />
      <tbody className={vi(tableBody(), tableBodyVisionImpaired)}>
        {hourGroups.map((group, groupIndex) => (
          <React.Fragment key={`${keyPrefix}-${group.hour}`}>
            {group.slots.map((slot, slotIndex) => {
              const isFirstInHour = slotIndex === 0;
              const isNextSailing = slot.time === nextSailingTime;
              return (
                <AdminTimetableRow
                  key={`${keyPrefix}-${slot.time}`}
                  slot={slot}
                  currentDayOfWeek={currentDayOfWeek}
                  isNextSailing={isNextSailing}
                  isFirstInHour={isFirstInHour}
                  groupIndex={groupIndex}
                  nextSailingRef={isNextSailing ? nextSailingRef : null}
                  departureLocation={departureLocation}
                  onRemoveSailing={onRemoveSailing}
                />
              );
            })}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}

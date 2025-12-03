import React from 'react';
import { DayOfWeek } from '../../types/timetable';
import { DAYS, DAY_LABELS } from '../../utils/timetableConstants';

export interface TimetableHeaderProps {
  currentDayOfWeek: DayOfWeek;
  currentDayHeaderRef: React.RefObject<HTMLTableCellElement>;
}

export function TimetableHeader({
  currentDayOfWeek,
  currentDayHeaderRef,
}: TimetableHeaderProps) {
  return (
    <thead className="bg-slate-800/80 backdrop-blur-sm sticky top-0 z-20 border-b border-slate-700/50 vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-b-2">
      <tr>
        <th className="sticky left-0 z-30 bg-slate-800/95 backdrop-blur-sm px-1.5 py-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-r-2 border-slate-700/50 w-20 vision-impaired:bg-black vision-impaired:text-white vision-impaired:text-sm vision-impaired:border-white vision-impaired:border-b-2 vision-impaired:border-r-2">
          Time
        </th>
        {DAYS.map((day, index) => (
          <th
            key={day}
            ref={day === currentDayOfWeek ? currentDayHeaderRef : null}
            className={`px-3 py-2 text-center text-xs font-bold uppercase tracking-wider border-b border-slate-700/50 vision-impaired:text-sm vision-impaired:border-white vision-impaired:border-b-2 ${
              day === currentDayOfWeek
                ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/20 text-cyan-300 font-bold border-cyan-500/30 vision-impaired:bg-cyan-600 vision-impaired:text-white vision-impaired:border-cyan-400 vision-impaired:border-b-2'
                : 'text-slate-400 bg-slate-800/80 vision-impaired:text-white vision-impaired:bg-black'
            }`}
          >
            {DAY_LABELS[index]}
          </th>
        ))}
      </tr>
    </thead>
  );
}


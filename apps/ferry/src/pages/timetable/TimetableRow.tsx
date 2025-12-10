import React from 'react';
import { DayOfWeek, Location } from '../../types/timetable';
import { DAYS } from '../../utils/timetableConstants';
import { TimeSlot } from '../../utils/timetableData';
import { CompanyBadge, cva, vi, useTimeFormatContext } from '@ferry/ui';
import { getBookingUrl } from '../../utils/booking';

export interface TimetableRowProps {
  slot: TimeSlot;
  currentDayOfWeek: DayOfWeek;
  isNextSailing: boolean;
  isFirstInHour: boolean;
  groupIndex: number;
  nextSailingRef: React.RefObject<HTMLTableRowElement> | null;
  departureLocation?: Location;
}

const tableRow = cva('group hover:bg-slate-800/20 transition-colors', {
  variants: {
    hasBorder: {
      true: 'border-t-2 border-slate-600/50',
      false: '',
    },
  },
});

const timeCell = cva(
  'sticky left-0 z-10 bg-slate-800/95 backdrop-blur-sm group-hover:bg-slate-700/50 px-1.5 py-2 whitespace-nowrap text-sm font-semibold text-slate-200 border-r-2 border-slate-700/50 w-20'
);
const timeCellVisionImpaired =
  'vision-impaired:bg-black vision-impaired:text-white vision-impaired:font-bold vision-impaired:text-base vision-impaired:border-white vision-impaired:border-r-2 vision-impaired:group-hover:bg-gray-900';

const dayCell = cva(
  'px-3 py-2 text-center text-sm border-r border-slate-700/30 last:border-r-0',
  {
    variants: {
      isCurrentDay: {
        true: 'bg-slate-800/30',
        false: 'bg-slate-900/30',
      },
      isNextSailing: {
        true: 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-l-4 border-l-yellow-400 shadow-lg shadow-yellow-500/20',
        false: '',
      },
    },
  }
);

const dayCellVisionImpaired = {
  base: 'vision-impaired:text-base vision-impaired:font-semibold vision-impaired:border-white vision-impaired:border-r-2',
  currentDay: 'vision-impaired:bg-gray-900',
  defaultDay: 'vision-impaired:bg-black',
  nextSailing:
    'vision-impaired:bg-yellow-600 vision-impaired:border-l-yellow-500 vision-impaired:border-l-4',
};

const emptyCell = cva('text-slate-600');
const emptyCellVisionImpaired =
  'vision-impaired:text-white vision-impaired:font-bold';

export function TimetableRow({
  slot,
  currentDayOfWeek,
  isNextSailing,
  isFirstInHour,
  groupIndex,
  nextSailingRef,
  departureLocation,
}: TimetableRowProps) {
  const { formatTime } = useTimeFormatContext();

  return (
    <tr
      ref={nextSailingRef}
      className={tableRow({ hasBorder: isFirstInHour && groupIndex > 0 })}
    >
      <td className={vi(timeCell(), timeCellVisionImpaired)}>
        {formatTime(slot.time)}
      </td>
      {DAYS.map((day) => {
        const daySailings = slot.sailings[day];
        const isCurrentDay = day === currentDayOfWeek;
        const isNextSailingOnCurrentDay = isNextSailing && isCurrentDay;
        return (
          <td
            key={day}
            className={vi(
              dayCell({
                isCurrentDay,
                isNextSailing: isNextSailingOnCurrentDay,
              }),
              dayCellVisionImpaired.base,
              isCurrentDay
                ? dayCellVisionImpaired.currentDay
                : dayCellVisionImpaired.defaultDay,
              isNextSailingOnCurrentDay ? dayCellVisionImpaired.nextSailing : ''
            )}
          >
            {daySailings.length > 0 ? (
              <div className="space-y-1.5">
                {daySailings.map((sailing, idx) => (
                  <CompanyBadge
                    key={idx}
                    company={sailing.company}
                    slow={sailing.slow}
                    variant="square"
                    as="div"
                    bookingUrl={getBookingUrl(
                      sailing.company,
                      departureLocation
                    )}
                  />
                ))}
              </div>
            ) : (
              <span className={vi(emptyCell(), emptyCellVisionImpaired)}>
                -
              </span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

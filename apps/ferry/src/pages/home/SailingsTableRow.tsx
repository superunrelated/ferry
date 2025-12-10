import { CompanyBadge, cva, vi, useTimeFormatContext } from '@ferry/ui';
import { isSlowSailing } from '../../utils/timetable';
import { GroupedSailing } from '../../hooks/useGroupedSailings';
import { Location } from '../../types/timetable';
import { getBookingUrl } from '../../utils/booking';

interface SailingsTableRowProps {
  group: GroupedSailing;
  index: number;
  departureLocation: Location | null;
}

const tableRow = cva('hover:bg-slate-800/30 transition-colors');
const tableRowVisionImpaired = 'vision-impaired:hover:bg-gray-900';

const tableCell = cva(
  'px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-200'
);
const tableCellVisionImpaired =
  'vision-impaired:text-base vision-impaired:text-white vision-impaired:font-bold';

export function SailingsTableRow({
  group,
  index,
  departureLocation,
}: SailingsTableRowProps) {
  const { formatTime } = useTimeFormatContext();

  return (
    <tr className={vi(tableRow(), tableRowVisionImpaired)}>
      <td className={vi(tableCell(), tableCellVisionImpaired)}>
        {formatTime(group.time)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-2">
          {group.sailings.map((sailing, sailingIndex) => (
            <CompanyBadge
              key={`${sailing.company}-${sailing.time}-${sailingIndex}`}
              company={sailing.company}
              slow={isSlowSailing(sailing)}
              variant="rounded"
              bookingUrl={getBookingUrl(sailing.company, departureLocation)}
            />
          ))}
        </div>
      </td>
    </tr>
  );
}

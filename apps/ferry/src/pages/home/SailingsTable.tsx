import { Card, CardContent, cva, vi } from '@ferry/ui';
import { GroupedSailing } from '../../hooks/useGroupedSailings';
import { SailingsTableRow } from './SailingsTableRow';
import { Location } from '../../types/timetable';

interface SailingsTableProps {
  groupedSailings: GroupedSailing[];
  departureLocation: Location | null;
}

const tableHead = cva('bg-slate-800/30');
const tableHeadVisionImpaired =
  'vision-impaired:bg-black vision-impaired:border-b-2 vision-impaired:border-white';

const tableHeaderCell = cva(
  'px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider'
);
const tableHeaderCellVisionImpaired =
  'vision-impaired:text-sm vision-impaired:text-white';

const tableBody = cva('divide-y divide-slate-700/50');
const tableBodyVisionImpaired =
  'vision-impaired:divide-y-2 vision-impaired:divide-white';

export function SailingsTable({
  groupedSailings,
  departureLocation,
}: SailingsTableProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent scrollable className="flex-1">
        <table className="w-full">
          <thead className={vi(tableHead(), tableHeadVisionImpaired)}>
            <tr>
              <th
                className={vi(tableHeaderCell(), tableHeaderCellVisionImpaired)}
              >
                Time
              </th>
              <th
                className={vi(tableHeaderCell(), tableHeaderCellVisionImpaired)}
              >
                Company
              </th>
            </tr>
          </thead>
          <tbody className={vi(tableBody(), tableBodyVisionImpaired)}>
            {groupedSailings.map((group, index) => (
              <SailingsTableRow
                key={`${group.time}-${index}`}
                group={group}
                index={index}
                departureLocation={departureLocation}
              />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

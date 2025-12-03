import { Card, CardContent } from '@ferry/ui';
import { GroupedSailing } from '../../hooks/useGroupedSailings';
import { SailingsTableRow } from './SailingsTableRow';

interface SailingsTableProps {
  groupedSailings: GroupedSailing[];
}

export function SailingsTable({ groupedSailings }: SailingsTableProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardContent scrollable className="flex-1">
        <table className="w-full">
          <thead className="bg-slate-800/30 vision-impaired:bg-black vision-impaired:border-b-2 vision-impaired:border-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider vision-impaired:text-sm vision-impaired:text-white">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider vision-impaired:text-sm vision-impaired:text-white">
                Company
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 vision-impaired:divide-y-2 vision-impaired:divide-white">
            {groupedSailings.map((group, index) => (
              <SailingsTableRow key={`${group.time}-${index}`} group={group} index={index} />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}


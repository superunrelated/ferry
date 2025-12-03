import { CompanyBadge } from '@ferry/ui';
import { isSlowSailing } from '../../utils/timetable';
import { GroupedSailing } from '../../hooks/useGroupedSailings';

interface SailingsTableRowProps {
  group: GroupedSailing;
  index: number;
}

export function SailingsTableRow({ group, index }: SailingsTableRowProps) {
  return (
    <tr className="hover:bg-slate-800/30 transition-colors vision-impaired:hover:bg-gray-900">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-200 vision-impaired:text-base vision-impaired:text-white vision-impaired:font-bold">
        {group.time}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-2">
          {group.sailings.map((sailing, sailingIndex) => (
            <CompanyBadge
              key={`${sailing.company}-${sailing.time}-${sailingIndex}`}
              company={sailing.company}
              slow={isSlowSailing(sailing)}
              variant="rounded"
            />
          ))}
        </div>
      </td>
    </tr>
  );
}


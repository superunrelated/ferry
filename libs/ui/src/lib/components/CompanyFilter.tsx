import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Label from '@radix-ui/react-label';
import { FerryCompany } from '../types/timetable';

export interface CompanyFilterProps {
  value: FerryCompany | 'all';
  onChange: (value: FerryCompany | 'all') => void;
}

export function CompanyFilter({ value, onChange }: CompanyFilterProps) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(newValue) => {
        if (newValue) {
          onChange(newValue as FerryCompany | 'all');
        }
      }}
      className="inline-flex gap-1 rounded-lg bg-slate-800/50 p-0.5 w-full border border-slate-700/50 vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-2"
    >
      <ToggleGroup.Item
        value="all"
        className="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500/20 data-[state=on]:to-blue-500/20 data-[state=on]:text-cyan-300 data-[state=on]:shadow-lg data-[state=on]:shadow-cyan-500/20 vision-impaired:text-base vision-impaired:font-bold vision-impaired:text-white vision-impaired:hover:bg-gray-900 vision-impaired:data-[state=on]:bg-cyan-600 vision-impaired:data-[state=on]:text-white"
      >
        Both
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="Fullers"
        className="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 data-[state=on]:bg-gradient-to-r data-[state=on]:from-fullers/20 data-[state=on]:to-fullers/30 data-[state=on]:text-fullers data-[state=on]:shadow-lg data-[state=on]:shadow-fullers/20 vision-impaired:text-base vision-impaired:font-bold vision-impaired:text-white vision-impaired:hover:bg-gray-900 vision-impaired:data-[state=on]:bg-fullers vision-impaired:data-[state=on]:text-white"
      >
        Fullers
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="Island Direct"
        className="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 data-[state=on]:bg-gradient-to-r data-[state=on]:from-island-direct/20 data-[state=on]:to-island-direct/30 data-[state=on]:text-island-direct data-[state=on]:shadow-lg data-[state=on]:shadow-island-direct/20 vision-impaired:text-base vision-impaired:font-bold vision-impaired:text-white vision-impaired:hover:bg-gray-900 vision-impaired:data-[state=on]:bg-island-direct vision-impaired:data-[state=on]:text-white"
      >
        Island Direct
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}

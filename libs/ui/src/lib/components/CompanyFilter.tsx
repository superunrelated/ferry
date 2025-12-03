import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Label from '@radix-ui/react-label';
import { FerryCompany } from '../types/timetable';
import { cva, vi } from '../utils/visionImpaired';

export interface CompanyFilterProps {
  value: FerryCompany | 'all';
  onChange: (value: FerryCompany | 'all') => void;
}

const filterRoot = cva(
  'inline-flex gap-1 rounded-lg bg-slate-800/50 p-0.5 w-full border border-slate-700/50'
);
const filterRootVisionImpaired =
  'vision-impaired:bg-black vision-impaired:border-white vision-impaired:border-2';

const filterItem = cva(
  'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800',
  {
    variants: {
      company: {
        all: 'data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500/20 data-[state=on]:to-blue-500/20 data-[state=on]:text-cyan-300 data-[state=on]:shadow-lg data-[state=on]:shadow-cyan-500/20',
        fullers:
          'data-[state=on]:bg-gradient-to-r data-[state=on]:from-fullers/20 data-[state=on]:to-fullers/30 data-[state=on]:text-fullers data-[state=on]:shadow-lg data-[state=on]:shadow-fullers/20',
        'island-direct':
          'data-[state=on]:bg-gradient-to-r data-[state=on]:from-island-direct/20 data-[state=on]:to-island-direct/30 data-[state=on]:text-island-direct data-[state=on]:shadow-lg data-[state=on]:shadow-island-direct/20',
      },
    },
  }
);

const filterItemVisionImpaired = {
  base: 'vision-impaired:text-base vision-impaired:font-bold vision-impaired:text-white vision-impaired:hover:bg-gray-900',
  all: 'vision-impaired:data-[state=on]:bg-cyan-900 vision-impaired:data-[state=on]:text-white',
  fullers:
    'vision-impaired:data-[state=on]:bg-fullers vision-impaired:data-[state=on]:text-white',
  'island-direct':
    'vision-impaired:data-[state=on]:bg-island-direct vision-impaired:data-[state=on]:text-white',
};

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
      className={vi(filterRoot(), filterRootVisionImpaired)}
    >
      <ToggleGroup.Item
        value="all"
        className={vi(
          filterItem({ company: 'all' }),
          filterItemVisionImpaired.base,
          filterItemVisionImpaired.all
        )}
      >
        Both
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="Fullers"
        className={vi(
          filterItem({ company: 'fullers' }),
          filterItemVisionImpaired.base,
          filterItemVisionImpaired.fullers
        )}
      >
        Fullers
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="Island Direct"
        className={vi(
          filterItem({ company: 'island-direct' }),
          filterItemVisionImpaired.base,
          filterItemVisionImpaired['island-direct']
        )}
      >
        Island Direct
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}

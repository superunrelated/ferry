import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { FerryCompany } from '../types/timetable';



export interface CompanyFilterProps {
  value: FerryCompany | 'all';
  onChange: (value: FerryCompany | 'all') => void;
}

export function CompanyFilter({ value, onChange }: CompanyFilterProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Company
      </label>
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={(newValue) => {
          if (newValue) {
            onChange(newValue as FerryCompany | 'all');
          }
        }}
        className="inline-flex space-x-px rounded bg-mauve6 shadow-[0_2px_10px] shadow-blackA4 w-full"
      >
        <ToggleGroup.Item
          value="all"
          className="flex-1 px-3 py-2 text-sm font-medium leading-4 bg-white text-mauve11 first:rounded-l last:rounded-r hover:bg-violet3 focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none data-[state=on]:bg-violet6 data-[state=on]:text-violet12"
        >
          Both companies
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="Fullers"
          className="flex-1 px-3 py-2 text-sm font-medium leading-4 bg-white text-mauve11 first:rounded-l last:rounded-r hover:bg-violet3 focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none data-[state=on]:bg-violet6 data-[state=on]:text-violet12"
        >
          Fullers
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="Island Direct"
          className="flex-1 px-3 py-2 text-sm font-medium leading-4 bg-white text-mauve11 first:rounded-l last:rounded-r hover:bg-violet3 focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none data-[state=on]:bg-violet6 data-[state=on]:text-violet12"
        >
          Island Direct
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
}

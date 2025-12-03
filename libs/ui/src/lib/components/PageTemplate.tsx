import { ReactNode } from 'react';
import { LocationToggle } from './LocationToggle';
import { CompanyFilter } from './CompanyFilter';
import { TabNavigation } from './TabNavigation';
import { VisionImpairedToggle } from './VisionImpairedToggle';
import { FerryCompany, Location } from '../types/timetable';
import { FilterProvider, FilterContextValue } from './FilterContext';
import { useVisionImpaired } from '../hooks/useVisionImpaired';
import { cva, vi } from '../utils/visionImpaired';

export interface PageTemplateProps {
  children: ReactNode;
  departureLocation: Location | null;
  setDepartureLocation: (location: Location | null) => void;
  filterCompany: FerryCompany | 'all';
  setFilterCompany: (company: FerryCompany | 'all') => void;
}

const pageContainer = cva(
  'h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden'
);
const pageContainerVisionImpaired = 'vision-impaired:bg-black';

const footerText = cva('text-xs text-slate-500 text-left');
const footerTextVisionImpaired =
  'vision-impaired:text-sm vision-impaired:text-white';

export function PageTemplate({
  children,
  departureLocation,
  setDepartureLocation,
  filterCompany,
  setFilterCompany,
}: PageTemplateProps) {
  const filterValue: FilterContextValue = {
    departureLocation,
    setDepartureLocation,
    filterCompany,
    setFilterCompany,
  };
  const { isVisionImpaired, toggleVisionImpaired } = useVisionImpaired();

  return (
    <FilterProvider value={filterValue}>
      <div className={vi(pageContainer(), pageContainerVisionImpaired)}>
        <TabNavigation />
        <div className="px-4 py-2 shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-2">
              <LocationToggle
                value={departureLocation}
                onChange={(loc) => setDepartureLocation(loc)}
              />
              <CompanyFilter
                value={filterCompany}
                onChange={setFilterCompany}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{children}</div>
        <div className="p-1 pt-0 shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-3 px-4 py-2">
              <p className={vi(footerText(), footerTextVisionImpaired)}>
                *Sailing via Devonport. Approximately 10 minutes longer than
                other sailings.
              </p>
              <VisionImpairedToggle
                isVisionImpaired={isVisionImpaired}
                onToggle={toggleVisionImpaired}
              />
            </div>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}

import { ReactNode } from 'react';
import { LocationToggle } from './LocationToggle';
import { CompanyFilter } from './CompanyFilter';
import { TabNavigation } from './TabNavigation';
import { FerryCompany, Location } from '../types/timetable';
import { FilterProvider, FilterContextValue } from './FilterContext';

export interface PageTemplateProps {
  children: ReactNode;
  departureLocation: Location | null;
  setDepartureLocation: (location: Location | null) => void;
  filterCompany: FerryCompany | 'all';
  setFilterCompany: (company: FerryCompany | 'all') => void;
}

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

  return (
    <FilterProvider value={filterValue}>
      <div className="h-screen flex flex-col bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <TabNavigation />
        <div className="px-4 py-2 flex-shrink-0">
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
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        <div className="p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs text-slate-500 text-center">
              *Sailing via Devonport. Approximately 10 minutes longer than other
              sailings.
            </p>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}

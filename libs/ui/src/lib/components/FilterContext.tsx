import { createContext, useContext, ReactNode } from 'react';
import { Location, FerryCompany } from '../types/timetable';

export interface FilterContextValue {
  departureLocation: Location | null;
  setDepartureLocation: (location: Location | null) => void;
  filterCompany: FerryCompany | 'all';
  setFilterCompany: (company: FerryCompany | 'all') => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}

export interface FilterProviderProps {
  children: ReactNode;
  value: FilterContextValue;
}

export function FilterProvider({ children, value }: FilterProviderProps) {
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

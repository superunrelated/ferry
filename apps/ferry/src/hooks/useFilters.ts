import { useSearchParams } from 'react-router-dom';
import { Location, FerryCompany } from '../types/timetable';
import { useLocation } from './useLocation';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: detectedLocation } = useLocation();

  // Derive directly from URL - no local state
  const departureLocation: Location | null = (() => {
    const from = searchParams.get('from');
    if (from === 'Auckland' || from === 'Waiheke') return from;
    return detectedLocation || null;
  })();

  const filterCompany: FerryCompany | 'all' = (() => {
    const company = searchParams.get('company');
    if (company === 'Fullers' || company === 'Island Direct') return company;
    return 'all';
  })();

  const setDepartureLocation = (location: Location | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (location) newParams.set('from', location);
    else newParams.delete('from');
    setSearchParams(newParams, { replace: true });
  };

  const setFilterCompany = (company: FerryCompany | 'all') => {
    const newParams = new URLSearchParams(searchParams);
    if (company !== 'all') newParams.set('company', company);
    else newParams.delete('company');
    setSearchParams(newParams, { replace: true });
  };

  return {
    departureLocation,
    setDepartureLocation,
    filterCompany,
    setFilterCompany,
  };
}

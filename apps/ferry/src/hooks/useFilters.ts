import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Location, FerryCompany } from '../types/timetable';
import { useLocation } from './useLocation';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location: detectedLocation } = useLocation();

  const getFromParam = (): Location | null => {
    const from = searchParams.get('from');
    if (from === 'Auckland' || from === 'Waiheke') {
      return from;
    }
    return detectedLocation || null;
  };

  const getCompanyParam = (): FerryCompany | 'all' => {
    const company = searchParams.get('company');
    if (company === 'Fullers' || company === 'Island Direct') {
      return company;
    }
    return 'all';
  };

  const [departureLocation, setDepartureLocationState] =
    useState<Location | null>(getFromParam());
  const [filterCompany, setFilterCompanyState] = useState<FerryCompany | 'all'>(
    getCompanyParam()
  );

  useEffect(() => {
    const fromParam = getFromParam();
    const companyParam = getCompanyParam();

    setDepartureLocationState(fromParam);
    setFilterCompanyState(companyParam);
  }, [detectedLocation, searchParams]);

  const setDepartureLocation = (location: Location | null) => {
    setDepartureLocationState(location);
    const newParams = new URLSearchParams(searchParams);
    if (location) {
      newParams.set('from', location);
    } else {
      newParams.delete('from');
    }
    setSearchParams(newParams, { replace: true });
  };

  const setFilterCompany = (company: FerryCompany | 'all') => {
    setFilterCompanyState(company);
    const newParams = new URLSearchParams(searchParams);
    if (company !== 'all') {
      newParams.set('company', company);
    } else {
      newParams.delete('company');
    }
    setSearchParams(newParams, { replace: true });
  };

  return {
    departureLocation,
    setDepartureLocation,
    filterCompany,
    setFilterCompany,
  };
}

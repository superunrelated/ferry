import { useLocation } from '../hooks/useLocation';
import { useTimetable } from '../hooks/useTimetable';
import { useFilters } from '../hooks/useFilters';
import { useRemainingSailings } from '../hooks/useRemainingSailings';
import { useGroupedSailings } from '../hooks/useGroupedSailings';
import { useLocationError } from '../hooks/useLocationError';
import { PageTemplate, LocationErrorDialog } from '@ferry/ui';
import { LoadingState } from './home/LoadingState';
import { NoLocationState } from './home/NoLocationState';
import { NoSailingsState } from './home/NoSailingsState';
import { SailingsTable } from './home/SailingsTable';

export function HomePage() {
  const {
    location: detectedLocation,
    state,
    error,
    requestLocation,
  } = useLocation();
  const locationLoading = state === 'loading';
  const { loading: timetableLoading } = useTimetable();
  const {
    departureLocation,
    setDepartureLocation,
    filterCompany,
    setFilterCompany,
  } = useFilters();
  const { showErrorDialog, setShowErrorDialog } = useLocationError(error);
  const remainingSailings = useRemainingSailings();
  const groupedSailings = useGroupedSailings(remainingSailings);

  const loading = timetableLoading || locationLoading;

  return (
    <PageTemplate
      departureLocation={departureLocation}
      setDepartureLocation={setDepartureLocation}
      filterCompany={filterCompany}
      setFilterCompany={setFilterCompany}
    >
      <div className="h-full p-4">
        <div className="max-w-7xl mx-auto h-full">
          <LocationErrorDialog
            open={showErrorDialog}
            onOpenChange={setShowErrorDialog}
            error={error}
            onRetry={requestLocation}
          />

          {loading ? (
            <LoadingState />
          ) : !detectedLocation ? (
            <NoLocationState />
          ) : remainingSailings.length === 0 ? (
            <NoSailingsState />
          ) : (
            <SailingsTable groupedSailings={groupedSailings} />
          )}
        </div>
      </div>
    </PageTemplate>
  );
}

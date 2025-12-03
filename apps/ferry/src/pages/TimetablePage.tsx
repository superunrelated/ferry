import { useState, useEffect, useRef } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useTimetable } from '../hooks/useTimetable';
import { useFilters } from '../hooks/useFilters';
import { useTimetableData } from '../hooks/useTimetableData';
import { useTimetableScroll } from '../hooks/useTimetableScroll';
import {
  Card,
  CardContent,
  PageTemplate,
  LocationErrorDialog,
} from '@ferry/ui';
import { TimetableTable } from './timetable/TimetableTable';
import { LoadingState } from './timetable/LoadingState';
import { NoLocationState } from './timetable/NoLocationState';

export function TimetablePage() {
  const {
    location: detectedLocation,
    state,
    error,
    requestLocation,
  } = useLocation();
  const locationLoading = state === 'loading';
  const { timetables, loading: timetableLoading } = useTimetable();
  const {
    departureLocation,
    setDepartureLocation,
    filterCompany,
    setFilterCompany,
  } = useFilters();

  const [showErrorDialog, setShowErrorDialog] = useState(false);

  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const loading = timetableLoading || locationLoading;

  const { hourGroups, nextSailingTime, currentDayOfWeek } = useTimetableData(
    timetables,
    departureLocation,
    filterCompany
  );

  const nextSailingRef = useRef<HTMLTableRowElement>(null);
  const currentDayHeaderRef = useRef<HTMLTableCellElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useTimetableScroll(
    scrollContainerRef,
    nextSailingRef,
    currentDayHeaderRef,
    loading,
    nextSailingTime,
    hourGroups.length > 0
  );

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
          ) : (
            <Card className="h-full flex flex-col">
              <CardContent
                ref={scrollContainerRef}
                scrollable
                className="flex-1"
              >
                <TimetableTable
                  hourGroups={hourGroups}
                  currentDayOfWeek={currentDayOfWeek}
                  nextSailingTime={nextSailingTime}
                  nextSailingRef={nextSailingRef}
                  currentDayHeaderRef={currentDayHeaderRef}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}

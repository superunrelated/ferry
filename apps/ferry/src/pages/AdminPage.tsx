import { useState, useEffect, useRef } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useTimetable } from '../hooks/useTimetable';
import { useFilters } from '../hooks/useFilters';
import { useTimetableData } from '../hooks/useTimetableData';
import { useTimetableScroll } from '../hooks/useTimetableScroll';
import { useEditableTimetable } from '../hooks/useEditableTimetable';
import {
  Card,
  CardContent,
  PageTemplate,
  LocationErrorDialog,
  cva,
  vi,
} from '@ferry/ui';
import { AdminTimetableTable } from './admin/AdminTimetableTable';
import { AdminForm } from './admin/AdminForm';
import { LoadingState } from './timetable/LoadingState';
import { NoLocationState } from './timetable/NoLocationState';
import { DayOfWeek } from '../types/timetable';
import { FerryCompany } from '../types/timetable';

const downloadButton = cva(
  'px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-300 font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-green-400'
);
const downloadButtonVisionImpaired =
  'vision-impaired:bg-green-900 vision-impaired:text-white vision-impaired:font-bold vision-impaired:border-2 vision-impaired:border-white';

export function AdminPage() {
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

  const editableTimetable = useEditableTimetable(
    timetables.length > 0 ? timetables[0] : null
  );

  const { hourGroups, nextSailingTime, currentDayOfWeek } = useTimetableData(
    editableTimetable.timetableData ? [editableTimetable.timetableData] : [],
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

  const handleRemoveSailing = (
    time: string,
    day: DayOfWeek,
    sailingIndex: number
  ) => {
    if (!departureLocation) return;
    editableTimetable.removeSailing(time, day, sailingIndex, departureLocation);
  };

  const handleAddSailing = (
    time: string,
    day: DayOfWeek,
    company: FerryCompany
  ) => {
    if (!departureLocation) return;
    editableTimetable.addSailing(time, day, company, departureLocation);
  };

  const handleDownload = () => {
    const data = editableTimetable.getDataForDownload();
    if (!data) return;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PageTemplate
      departureLocation={departureLocation}
      setDepartureLocation={setDepartureLocation}
      filterCompany={filterCompany}
      setFilterCompany={setFilterCompany}
    >
      <div className="h-full px-4 py-2">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <LocationErrorDialog
            open={showErrorDialog}
            onOpenChange={setShowErrorDialog}
            error={error}
            onRetry={requestLocation}
          />

          <div className="mb-4 shrink-0">
            <AdminForm
              departureLocation={departureLocation}
              onAddSailing={handleAddSailing}
            />
          </div>

          <div className="mb-4 shrink-0">
            <button
              onClick={handleDownload}
              className={vi(downloadButton(), downloadButtonVisionImpaired)}
            >
              Download data.json
            </button>
          </div>

          {loading ? (
            <LoadingState />
          ) : !detectedLocation ? (
            <NoLocationState />
          ) : (
            <Card className="flex-1 flex flex-col">
              <CardContent
                ref={scrollContainerRef}
                scrollable
                className="flex-1"
              >
                <AdminTimetableTable
                  hourGroups={hourGroups}
                  currentDayOfWeek={currentDayOfWeek}
                  nextSailingTime={nextSailingTime}
                  nextSailingRef={nextSailingRef}
                  currentDayHeaderRef={currentDayHeaderRef}
                  departureLocation={departureLocation}
                  filterCompany={filterCompany}
                  onRemoveSailing={handleRemoveSailing}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}

import { useState, useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Label from '@radix-ui/react-label';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useLocation } from '../hooks/useLocation';
import { useTimetable } from '../hooks/useTimetable';
import { getRemainingSailingsToday, isSlowSailing } from '../utils/timetable';
import { TabNavigation } from '@ferry/ui';
import { CompanyFilter } from '@ferry/ui';
import { Sailing, FerryCompany, Location } from '../types/timetable';

export function HomePage() {
  const {
    location: detectedLocation,
    state,
    error,
    requestLocation,
  } = useLocation();
  const locationLoading = state === 'loading';
  const { timetables, loading: timetableLoading } = useTimetable();
  const [filterCompany, setFilterCompany] = useState<FerryCompany | 'all'>(
    'all'
  );
  const [departureLocation, setDepartureLocation] = useState<Location | null>(
    detectedLocation
  );
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Update departure location when detected location changes
  useEffect(() => {
    if (detectedLocation) {
      setDepartureLocation(detectedLocation);
    }
  }, [detectedLocation]);

  // Show error dialog when error occurs
  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

  const swapLocation = () => {
    if (departureLocation === 'Auckland') {
      setDepartureLocation('Waiheke');
    } else if (departureLocation === 'Waiheke') {
      setDepartureLocation('Auckland');
    }
  };

  const allRemainingSailings = departureLocation
    ? getRemainingSailingsToday(timetables, departureLocation)
    : [];

  const remainingSailings =
    filterCompany === 'all'
      ? allRemainingSailings
      : allRemainingSailings.filter((s) => s.company === filterCompany);

  const loading = timetableLoading || locationLoading;

  // Debug logging
  if (departureLocation && !loading && remainingSailings.length === 0) {
    console.log('Debug - Departure Location:', departureLocation);
    console.log('Debug - Timetables:', timetables);
    console.log(
      'Debug - Current day:',
      new Date().getDay(),
      new Date().toLocaleDateString()
    );
    console.log('Debug - Current time:', new Date().toLocaleTimeString());
    console.log(
      'Debug - Routes found:',
      timetables.flatMap((t) => t.routes.filter((r) => r.from === departureLocation))
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <TabNavigation />
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <AlertDialog.Root open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-6 max-w-md w-full z-50">
                <AlertDialog.Title className="text-lg font-bold text-slate-100 mb-2">
                  Location Error
                </AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-slate-300 mb-6">
                  {error?.includes('denied')
                    ? 'Location access denied. Please enable location services to see ferries from your location.'
                    : 'Unable to get your location.'}
                </AlertDialog.Description>
                <div className="flex gap-3 justify-end">
                  <AlertDialog.Cancel asChild>
                    <button
                      onClick={() => setShowErrorDialog(false)}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      onClick={() => {
                        setShowErrorDialog(false);
                        requestLocation();
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      Try again
                    </button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-cyan-400"></div>
              <div className="text-slate-400 mt-4">Loading...</div>
            </div>
          ) : !detectedLocation ? (
            <div className="text-center py-12">
              <div className="text-slate-400">
                Unable to determine your location
              </div>
            </div>
          ) : remainingSailings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400">No more sailings today</div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Sailings from {departureLocation} today
                  </h2>
                  {detectedLocation &&
                    departureLocation !== detectedLocation && (
                      <button
                        onClick={swapLocation}
                        className="text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors"
                      >
                        Show from {detectedLocation}
                      </button>
                    )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label.Root className="block text-sm font-semibold text-slate-300 mb-2">
                      Departure Location
                    </Label.Root>
                    <ToggleGroup.Root
                      type="single"
                      value={departureLocation || undefined}
                      onValueChange={(value) => {
                        if (value) setDepartureLocation(value as Location);
                      }}
                      className="inline-flex gap-1 rounded-lg bg-slate-900/50 p-1 w-full border border-slate-700/50"
                    >
                      <ToggleGroup.Item
                        value="Auckland"
                        className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500/20 data-[state=on]:to-blue-500/20 data-[state=on]:text-cyan-300 data-[state=on]:shadow-lg data-[state=on]:shadow-cyan-500/20"
                      >
                        Auckland
                      </ToggleGroup.Item>
                      <ToggleGroup.Item
                        value="Waiheke"
                        className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 data-[state=on]:bg-gradient-to-r data-[state=on]:from-cyan-500/20 data-[state=on]:to-blue-500/20 data-[state=on]:text-cyan-300 data-[state=on]:shadow-lg data-[state=on]:shadow-cyan-500/20"
                      >
                        Waiheke
                      </ToggleGroup.Item>
                    </ToggleGroup.Root>
                  </div>
                  <CompanyFilter
                    value={filterCompany}
                    onChange={setFilterCompany}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Slow
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {remainingSailings.map((sailing, index) => {
                      const slow = isSlowSailing(sailing);
                      const isFullers = sailing.company === 'Fullers';
                      return (
                        <tr
                          key={`${sailing.company}-${sailing.time}-${index}`}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-200">
                            {sailing.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                isFullers
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {sailing.company}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {slow ? (
                              <span className="text-orange-400 font-medium">Slow</span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

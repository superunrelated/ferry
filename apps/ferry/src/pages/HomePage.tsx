import { useState, useEffect } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useLocation } from '../hooks/useLocation';
import { useTimetable } from '../hooks/useTimetable';
import { getRemainingSailingsToday, isSlowSailing } from '../utils/timetable';
import {
  TabNavigation,
  CompanyFilter,
  LocationToggle,
  Card,
  CardHeader,
  CardContent,
} from '@ferry/ui';
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <TabNavigation />
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <AlertDialog.Root
            open={showErrorDialog}
            onOpenChange={setShowErrorDialog}
          >
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
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <LocationToggle
                    value={departureLocation}
                    onChange={setDepartureLocation}
                  />

                  <CompanyFilter
                    value={filterCompany}
                    onChange={setFilterCompany}
                  />
                </div>
              </CardHeader>
              <CardContent>
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
                                  ? 'bg-fullers/20 text-fullers border border-fullers/40'
                                  : 'bg-island-direct/20 text-island-direct border border-island-direct/40'
                              }`}
                            >
                              {sailing.company}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {slow ? (
                              <span className="text-orange-400 font-medium">
                                Slow
                              </span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
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

  // Update departure location when detected location changes
  useEffect(() => {
    if (detectedLocation) {
      setDepartureLocation(detectedLocation);
    }
  }, [detectedLocation]);

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
    <div className="min-h-screen bg-gray-50">
      <TabNavigation />
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                {error.includes('denied')
                  ? 'Location access denied. Please enable location services to see ferries from your location.'
                  : 'Unable to get your location.'}
              </p>
              <button
                onClick={requestLocation}
                className="text-sm text-yellow-900 underline"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : !detectedLocation ? (
            <div className="text-center py-8">
              <div className="text-gray-600">
                Unable to determine your location
              </div>
            </div>
          ) : remainingSailings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No more sailings today</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">
                    Sailings from {departureLocation} today
                  </h2>
                  {detectedLocation &&
                    departureLocation !== detectedLocation && (
                      <button
                        onClick={swapLocation}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Show from {detectedLocation}
                      </button>
                    )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departure Location
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDepartureLocation('Auckland')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          departureLocation === 'Auckland'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Auckland
                      </button>
                      <button
                        onClick={() => setDepartureLocation('Waiheke')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          departureLocation === 'Waiheke'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Waiheke
                      </button>
                    </div>
                  </div>
                  <CompanyFilter
                    value={filterCompany}
                    onChange={setFilterCompany}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slow
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {remainingSailings.map((sailing, index) => {
                      const slow = isSlowSailing(sailing);
                      return (
                        <tr
                          key={`${sailing.company}-${sailing.time}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sailing.time}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {sailing.company}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {slow ? 'Yes' : '-'}
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

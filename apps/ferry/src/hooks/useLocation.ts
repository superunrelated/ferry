import { useState, useEffect } from 'react';
import { Coordinates, getLocationFromCoords } from '../utils/location';

export type LocationState = 'loading' | 'success' | 'error' | 'denied';

export interface UseLocationReturn {
  location: 'Auckland' | 'Waiheke' | null;
  coordinates: Coordinates | null;
  state: LocationState;
  error: string | null;
  requestLocation: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<'Auckland' | 'Waiheke' | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [state, setState] = useState<LocationState>('loading');
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setState('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoordinates(coords);
        setLocation(getLocationFromCoords(coords));
        setState('success');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState('denied');
          setError('Location permission denied');
        } else {
          setState('error');
          setError(err.message || 'Failed to get location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    location,
    coordinates,
    state,
    error,
    requestLocation,
  };
}


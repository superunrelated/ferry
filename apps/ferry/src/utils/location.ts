export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Waiheke Island approximate bounds
const WAIHEKE_BOUNDS = {
  minLat: -36.85,
  maxLat: -36.75,
  minLon: 174.95,
  maxLon: 175.05,
};

export function isOnWaiheke(coords: Coordinates): boolean {
  return (
    coords.latitude >= WAIHEKE_BOUNDS.minLat &&
    coords.latitude <= WAIHEKE_BOUNDS.maxLat &&
    coords.longitude >= WAIHEKE_BOUNDS.minLon &&
    coords.longitude <= WAIHEKE_BOUNDS.maxLon
  );
}

export function getLocationFromCoords(coords: Coordinates): 'Auckland' | 'Waiheke' {
  return isOnWaiheke(coords) ? 'Waiheke' : 'Auckland';
}


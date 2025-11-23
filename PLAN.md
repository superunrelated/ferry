# Ferry Timetable Web App - Implementation Plan

## Overview
Build a mobile-first web application that combines ferry timetables from Fullers and Island Direct for Auckland ↔ Waiheke routes. The app will scrape timetable data from both websites and provide a location-aware interface.

## Project Structure

```
ferry/
├── apps/
│   ├── ferry/              # React web application
│   └── scraper/            # Node.js scraping scripts
├── libs/
│   └── ui/                 # Shared UI components
├── data/                    # Scraped timetable JSON files
└── PLAN.md                 # This file
```

## Implementation Details

### Phase 1: Data Collection Scripts ✅

**Location**: `apps/scraper/`

- **scrape_fullers.js**: Scrapes Fullers timetable from https://www.fullers.co.nz/timetables-and-fares/?from=AUCK&to=WAIH
- **scrape_island_direct.js**: Scrapes Island Direct timetable from https://islanddirect.co.nz/pages/timetable
- **copy-data.js**: Copies scraped JSON files to `apps/ferry/public/data/` for the web app

**Nx Commands**:
- `npm run scrape:fullers` - Scrape Fullers timetable
- `npm run scrape:island-direct` - Scrape Island Direct timetable
- `npm run scrape` - Scrape both timetables
- `npm run scrape:copy-data` - Copy data to public directory

**Data Format**: JSON files saved to `data/` directory with structure:
```json
{
  "company": "Fullers" | "Island Direct",
  "lastUpdated": "ISO timestamp",
  "routes": [
    {
      "from": "Auckland" | "Waiheke",
      "to": "Auckland" | "Waiheke",
      "schedule": {
        "monday-tuesday": ["HH:MM", ...],
        "wednesday-friday": ["HH:MM", ...],
        "saturday": ["HH:MM", ...],
        "sunday": ["HH:MM", ...]
      },
      "notes": ["optional notes"]
    }
  ]
}
```

### Phase 2: Web Application ✅

**Location**: `apps/ferry/`

**Tech Stack**:
- React 18 with TypeScript
- Vite (via Nx)
- Tailwind CSS (mobile-first)
- React Router for navigation

**Key Features**:

1. **Home Page** (`/`)
   - Detects user location via Geolocation API
   - Shows next 3 ferry departures from user's location
   - Displays countdown for next ferry
   - Link to full timetable page
   - Handles location permission errors gracefully

2. **Timetable Page** (`/timetable`)
   - Shows complete combined timetable from both companies
   - Filters:
     - Direction: All / Auckland → Waiheke / Waiheke → Auckland
     - Day: All / Current day groups
   - No company filter (both shown together)
   - Mobile-first responsive design

**Components** (in `libs/ui/`):
- `FerryCard`: Individual ferry departure card with company colors
- `NextFerry`: Displays next ferries from user location
- `Timetable`: Full timetable view with filtering

**Utilities**:
- `location.ts`: Waiheke Island detection (lat/lon bounds)
- `timetable.ts`: Parsing, filtering, finding next ferries

**Hooks**:
- `useLocation`: Browser geolocation with error handling
- `useTimetable`: Loads and manages timetable data from JSON files

### Phase 3: Styling ✅

- Tailwind CSS with mobile-first approach
- Company color coding:
  - Fullers: Blue (`bg-blue-100`, `border-blue-300`, `text-blue-900`)
  - Island Direct: Green (`bg-green-100`, `border-green-300`, `text-green-900`)
- Touch-friendly buttons (min 44x44px)
- Responsive grid layouts

## Nx Commands

### Development
- `npm run start` - Start dev server (port 4200)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Scraping
- `npm run scrape:fullers` - Scrape Fullers
- `npm run scrape:island-direct` - Scrape Island Direct
- `npm run scrape` - Scrape both
- `npm run scrape:copy-data` - Copy data to public directory

## Data Flow

1. Run scraping scripts → JSON files saved to `data/`
2. Copy data to `apps/ferry/public/data/` (via `scrape:copy-data`)
3. Web app loads JSON files via fetch in `useTimetable` hook
4. Data parsed and filtered by utility functions
5. Components display timetable information

## Location Detection

- Uses browser Geolocation API
- Waiheke Island bounds:
  - Latitude: -36.75 to -36.85
  - Longitude: 174.95 to 175.05
- Falls back gracefully if permission denied or unavailable

## Day Group Logic

- **Monday-Tuesday**: `monday-tuesday`
- **Wednesday**: `wednesday` (also matches `wednesday-friday`)
- **Thursday-Friday**: `wednesday-friday` and `thursday-friday`
- **Saturday**: `saturday`
- **Sunday**: `sunday`

## Future Enhancements

- Automated scraping schedule
- Real-time updates
- Push notifications for next ferry
- Offline support with service workers
- Historical timetable data


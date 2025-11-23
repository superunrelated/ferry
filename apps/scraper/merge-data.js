import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', '..', 'data');
const PUBLIC_DATA_DIR = join(__dirname, '..', 'ferry', 'public', 'data');

// Convert old Island Direct format to new format
function convertIslandDirectFormat(data) {
  const routes = [];

  for (const route of data.routes || []) {
    const schedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    // Convert old schedule format to new format
    for (const [dayGroup, times] of Object.entries(route.schedule || {})) {
      // Map day groups to individual days
      let days = [];
      if (dayGroup === 'monday-tuesday') {
        days = ['monday', 'tuesday'];
      } else if (dayGroup === 'wednesday-friday') {
        days = ['wednesday', 'thursday', 'friday'];
      } else if (dayGroup === 'thursday-friday') {
        days = ['thursday', 'friday'];
      } else if (dayGroup === 'wednesday') {
        days = ['wednesday'];
      } else if (dayGroup === 'saturday') {
        days = ['saturday'];
      } else if (dayGroup === 'sunday') {
        days = ['sunday'];
      }

      // Convert times to sailing objects
      for (const time of times) {
        const sailing = {
          time: typeof time === 'string' ? time : time.time,
          company: data.company || 'Island Direct',
        };

        // If time is already an object, preserve slow flag
        if (typeof time === 'object' && time.slow) {
          sailing.slow = true;
        }

        // Add to all relevant days
        for (const day of days) {
          schedule[day].push(sailing);
        }
      }
    }

    // Sort times for each day
    for (const day of Object.keys(schedule)) {
      schedule[day].sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
    }

    routes.push({
      from: route.from,
      to: route.to,
      schedule,
    });
  }

  return routes;
}

function mergeRoutesByDirection(routes) {
  // Group routes by from/to direction
  const routeMap = new Map();

  for (const route of routes) {
    const key = `${route.from}->${route.to}`;

    if (!routeMap.has(key)) {
      routeMap.set(key, {
        from: route.from,
        to: route.to,
        schedule: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
      });
    }

    const mergedRoute = routeMap.get(key);

    // Merge sailings for each day
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    for (const day of days) {
      if (route.schedule && route.schedule[day]) {
        // Add all sailings from this route for this day
        for (const sailing of route.schedule[day]) {
          // Check if this exact sailing already exists (same time and company)
          const exists = mergedRoute.schedule[day].some(
            (s) => s.time === sailing.time && s.company === sailing.company
          );
          if (!exists) {
            mergedRoute.schedule[day].push(sailing);
          }
        }
      }
    }
  }

  // Sort sailings by time for each day in each route
  for (const route of routeMap.values()) {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    for (const day of days) {
      route.schedule[day].sort((a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });
    }
  }

  return Array.from(routeMap.values());
}

async function mergeData() {
  try {
    // Read both timetable files
    const fullersPath = join(DATA_DIR, 'fullers_timetable.json');
    const islandDirectPath = join(DATA_DIR, 'island_direct_timetable.json');

    const fullersData = JSON.parse(await readFile(fullersPath, 'utf-8'));
    const islandDirectData = JSON.parse(
      await readFile(islandDirectPath, 'utf-8')
    );

    // Check if Island Direct is already in new format (has individual days) or old format (has day groups)
    let islandDirectRoutes = [];
    if (islandDirectData.routes && islandDirectData.routes.length > 0) {
      const firstRoute = islandDirectData.routes[0];
      const hasIndividualDays = firstRoute.schedule && (
        firstRoute.schedule.monday !== undefined ||
        firstRoute.schedule.tuesday !== undefined ||
        firstRoute.schedule.wednesday !== undefined
      );
      
      if (hasIndividualDays) {
        // Already in new format, use directly
        islandDirectRoutes = islandDirectData.routes;
      } else {
        // Old format, convert it
        islandDirectRoutes = convertIslandDirectFormat(islandDirectData);
      }
    }

    // Combine all routes
    const allRoutes = [...(fullersData.routes || []), ...islandDirectRoutes];

    // Merge routes by direction (from/to), combining sailings for each day
    const mergedRoutes = mergeRoutesByDirection(allRoutes);

    // Create merged data structure
    const mergedData = {
      lastUpdated: new Date().toISOString(),
      routes: mergedRoutes,
    };

    // Save merged data
    const outputPath = join(DATA_DIR, 'data.json');
    await writeFile(outputPath, JSON.stringify(mergedData, null, 2), 'utf-8');
    console.log(`✓ Merged timetable saved to ${outputPath}`);
    console.log(`  Total routes: ${mergedRoutes.length}`);

    // Also copy to public directory
    await mkdir(PUBLIC_DATA_DIR, { recursive: true });
    const publicPath = join(PUBLIC_DATA_DIR, 'data.json');
    await writeFile(publicPath, JSON.stringify(mergedData, null, 2), 'utf-8');
    console.log(`✓ Copied to ${publicPath}`);

    return mergedData;
  } catch (error) {
    console.error('Error merging data:', error);
    throw error;
  }
}

// Run the merge
mergeData().catch(console.error);

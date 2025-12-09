import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use homepage which has both directions visible at once
const ISLAND_DIRECT_URL = 'https://islanddirect.co.nz/';
const DATA_DIR = join(__dirname, '..', '..', 'data');
const HTML_DIR = join(DATA_DIR, 'html');

async function scrapeIslandDirect() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await mkdir(HTML_DIR, { recursive: true });

    console.log('Fetching Island Direct timetable...');
    const response = await fetch(ISLAND_DIRECT_URL);
    const html = await response.text();

    const htmlPath = join(HTML_DIR, 'island_direct.html');
    await writeFile(htmlPath, html, 'utf-8');
    console.log(`✓ Saved HTML to ${htmlPath}`);

    const $ = cheerio.load(html);

    const routes = [];

    // Extract Auckland to Waiheke schedule using data-time-table attribute
    const aucklandToWaiheke = extractSchedule($, 'Auckland');
    if (aucklandToWaiheke && hasAnySailings(aucklandToWaiheke)) {
      routes.push({
        from: 'Auckland',
        to: 'Waiheke',
        schedule: aucklandToWaiheke,
      });
      console.log(
        `  Auckland -> Waiheke: ${countSailings(
          aucklandToWaiheke
        )} Monday sailings`
      );
    }

    // Extract Waiheke to Auckland schedule using data-time-table attribute
    const waihekeToAuckland = extractSchedule($, 'Waiheke');
    if (waihekeToAuckland && hasAnySailings(waihekeToAuckland)) {
      routes.push({
        from: 'Waiheke',
        to: 'Auckland',
        schedule: waihekeToAuckland,
      });
      console.log(
        `  Waiheke -> Auckland: ${countSailings(
          waihekeToAuckland
        )} Monday sailings`
      );
    }

    const timetable = {
      lastUpdated: new Date().toISOString(),
      routes,
    };

    const outputPath = join(DATA_DIR, 'island_direct_timetable.json');
    await writeFile(outputPath, JSON.stringify(timetable, null, 2), 'utf-8');

    console.log(`✓ Island Direct timetable saved to ${outputPath}`);
    console.log(`  Routes found: ${routes.length}`);

    return timetable;
  } catch (error) {
    console.error('Error scraping Island Direct:', error);
    throw error;
  }
}

function hasAnySailings(schedule) {
  return Object.values(schedule).some((day) => day.length > 0);
}

function countSailings(schedule) {
  return schedule.monday?.length || 0;
}

function extractSchedule($, from) {
  const schedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  // Find the container using data-time-table attribute
  // This properly scopes the search to only this direction's times
  const $container = $(`[data-time-table="${from}"]`);

  if (!$container.length) {
    console.log(`  Warning: No [data-time-table="${from}"] found`);
    return schedule;
  }

  // Day patterns - maps day labels to actual days
  const dayPatterns = [
    {
      labels: ['mon & tues', 'mon & tue', 'monday & tuesday'],
      days: ['monday', 'tuesday'],
    },
    {
      labels: ['wednesday', 'wed'],
      days: ['wednesday'],
    },
    {
      labels: ['thurs & fri', 'thursday & friday', 'thu & fri'],
      days: ['thursday', 'friday'],
    },
    {
      labels: ['saturday', 'sat'],
      days: ['saturday'],
    },
    {
      labels: ['sunday', 'sun'],
      days: ['sunday'],
    },
  ];

  // Find all timetable_content_inn divs within this container
  // Each one has an h6 with the day label followed by p tags with times
  $container.find('.timetable_content_inn').each((i, contentDiv) => {
    const $contentDiv = $(contentDiv);

    // Get the day label from h6
    const dayLabel = $contentDiv
      .find('h6')
      .text()
      .trim()
      .toLowerCase()
      .replace(/\*/g, '');

    // Find which pattern this matches
    let matchedDays = null;
    for (const pattern of dayPatterns) {
      const normalizedLabel = dayLabel.replace(/[&\s]+/g, ' ').trim();
      if (
        pattern.labels.some((l) => {
          const normalizedPattern = l.replace(/[&\s]+/g, ' ').trim();
          return (
            normalizedLabel.includes(normalizedPattern) ||
            normalizedPattern.includes(normalizedLabel)
          );
        })
      ) {
        matchedDays = pattern.days;
        break;
      }
    }

    if (!matchedDays) {
      return; // Skip if no matching day pattern
    }

    // Extract times from all p tags in this section
    const times = [];
    $contentDiv.find('p').each((j, timeElem) => {
      const timeText = $(timeElem).text().trim();

      // Skip dashes and empty
      if (timeText === '-' || !timeText) return;

      // Match time patterns: "7:30 am", "10:00am", "12:30pm", etc.
      const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
      if (timeMatch) {
        const [, hour, minute, period] = timeMatch;
        let hour24 = parseInt(hour);

        // Convert to 24-hour format
        if (period.toLowerCase() === 'pm' && hour24 !== 12) {
          hour24 += 12;
        } else if (period.toLowerCase() === 'am' && hour24 === 12) {
          hour24 = 0;
        }

        const time24 = `${String(hour24).padStart(2, '0')}:${minute}`;
        if (!times.includes(time24)) {
          times.push(time24);
        }
      }
    });

    // Add times to all matched days
    for (const time of times) {
      const sailing = {
        time: time,
        company: 'Island Direct',
      };

      for (const day of matchedDays) {
        const exists = schedule[day].some((s) => s.time === time);
        if (!exists) {
          schedule[day].push(sailing);
        }
      }
    }
  });

  // Sort times for each day
  for (const day of Object.keys(schedule)) {
    schedule[day].sort((a, b) => {
      const [aH, aM] = a.time.split(':').map(Number);
      const [bH, bM] = b.time.split(':').map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });
  }

  return schedule;
}

// Run the scraper
scrapeIslandDirect().catch(console.error);

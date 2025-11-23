import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FULLERS_URL_AUCK_TO_WAIH = 'https://www.fullers.co.nz/timetables-and-fares/?from=AUCK&to=WAIH';
const FULLERS_URL_WAIH_TO_AUCK = 'https://www.fullers.co.nz/timetables-and-fares/?from=WAIH&to=AUCK';
const DATA_DIR = join(__dirname, '..', '..', 'data');
const HTML_DIR = join(DATA_DIR, 'html');

async function scrapeFullers() {
  try {
    // Ensure directories exist
    await mkdir(DATA_DIR, { recursive: true });
    await mkdir(HTML_DIR, { recursive: true });

    const routes = [];

    // Fetch and process Auckland to Waiheke
    console.log('Fetching Auckland to Waiheke timetable...');
    const responseAuckToWaih = await fetch(FULLERS_URL_AUCK_TO_WAIH);
    const htmlAuckToWaih = await responseAuckToWaih.text();
    
    // Save HTML for debugging
    const htmlPathAuckToWaih = join(HTML_DIR, 'fullers_auck_to_waih.html');
    await writeFile(htmlPathAuckToWaih, htmlAuckToWaih, 'utf-8');
    console.log(`✓ Saved HTML to ${htmlPathAuckToWaih}`);
    
    const $auckToWaih = cheerio.load(htmlAuckToWaih);
    const aucklandToWaiheke = extractSchedule($auckToWaih, 'Auckland', 'Waiheke');
    if (aucklandToWaiheke && Object.keys(aucklandToWaiheke).length > 0) {
      routes.push({
        from: 'Auckland',
        to: 'Waiheke',
        schedule: aucklandToWaiheke
      });
    }

    // Fetch and process Waiheke to Auckland
    console.log('Fetching Waiheke to Auckland timetable...');
    const responseWaihToAuck = await fetch(FULLERS_URL_WAIH_TO_AUCK);
    const htmlWaihToAuck = await responseWaihToAuck.text();
    
    // Save HTML for debugging
    const htmlPathWaihToAuck = join(HTML_DIR, 'fullers_waih_to_auck.html');
    await writeFile(htmlPathWaihToAuck, htmlWaihToAuck, 'utf-8');
    console.log(`✓ Saved HTML to ${htmlPathWaihToAuck}`);
    
    const $waihToAuck = cheerio.load(htmlWaihToAuck);
    const waihekeToAuckland = extractSchedule($waihToAuck, 'Waiheke', 'Auckland');
    if (waihekeToAuckland && Object.keys(waihekeToAuckland).length > 0) {
      routes.push({
        from: 'Waiheke',
        to: 'Auckland',
        schedule: waihekeToAuckland
      });
    }

    const timetable = {
      lastUpdated: new Date().toISOString(),
      routes
    };

    // Save to JSON file
    const outputPath = join(DATA_DIR, 'fullers_timetable.json');
    await writeFile(outputPath, JSON.stringify(timetable, null, 2), 'utf-8');

    console.log(`✓ Fullers timetable saved to ${outputPath}`);
    console.log(`  Routes found: ${routes.length}`);
    
    return timetable;
  } catch (error) {
    console.error('Error scraping Fullers:', error);
    throw error;
  }
}

function extractSchedule($, from, to) {
  // Initialize schedule for individual days
  const schedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };

  // Day patterns based on the actual Fullers website structure
  const dayPatterns = [
    { 
      key: 'monday-tuesday', 
      labels: ['Monday - Tuesday', 'Monday-Tuesday', 'Mon - Tue', 'Mon-Tue'],
      days: ['monday', 'tuesday']
    },
    { 
      key: 'wednesday-friday', 
      labels: ['Wednesday - Friday', 'Wednesday-Friday', 'Wed - Fri', 'Wed-Fri'],
      days: ['wednesday', 'thursday', 'friday']
    },
    { 
      key: 'saturday', 
      labels: ['Saturday', 'Sat'],
      days: ['saturday']
    },
    { 
      key: 'sunday', 
      labels: ['Sunday / Public Holiday', 'Sunday', 'Public Holiday'],
      days: ['sunday']
    }
  ];

  // Extract times for each day group
  // Look for timetable structure: .tt-head contains day label, followed by divs with times
  $('.tt-head, h3, h4, h5').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    
    for (const pattern of dayPatterns) {
      if (pattern.labels.some(label => text.includes(label))) {
        // Find the parent column container (.tt-col) or parent element
        let $column = $elem.closest('.tt-col');
        if (!$column.length) {
          $column = $elem.parent();
        }
        
        // If we found a column, get all divs after the header until next column/header
        let $timeContainer = $column;
        if ($column.length) {
          // Get all divs in this column that come after the header
          const $header = $column.find('.tt-head, h3, h4, h5').first();
          $timeContainer = $header.nextAll('div').addBack().parent();
        } else {
          // Fallback: search in parent and siblings
          $timeContainer = $elem.parent();
        }
        
        // Extract times from all divs in the container
        $timeContainer.find('div').each((j, timeElem) => {
          const $timeElem = $(timeElem);
          const timeText = $timeElem.text().trim();
          
          // Skip if it's just a dash or empty
          if (timeText === '-' || !timeText || timeText === '') return;
          
          // Match time patterns: "6:00 AM", "12:30 PM", etc.
          const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (timeMatch) {
            const [, hour, minute, period] = timeMatch;
            const hour24 = period.toUpperCase() === 'PM' && hour !== '12' 
              ? parseInt(hour) + 12 
              : period.toUpperCase() === 'AM' && hour === '12'
              ? 0
              : parseInt(hour);
            const time24 = `${String(hour24).padStart(2, '0')}:${minute}`;
            
            // Check if this sailing is via Devonport (marked with *)
            const isSlow = timeText.includes('*') && !timeText.includes('**');
            
            const sailing = {
              time: time24,
              company: 'Fullers'
            };
            
            if (isSlow) {
              sailing.slow = true;
            }
            
            // Add to all days in this pattern
            for (const day of pattern.days) {
              // Check if this time already exists for this day
              const exists = schedule[day].some(s => s.time === time24);
              if (!exists) {
                schedule[day].push(sailing);
              }
            }
          }
        });
      }
    }
  });

  // Fallback: search full text if no times found for any day
  if (Object.values(schedule).every(day => day.length === 0)) {
    const fullText = $.text();
    
    for (const pattern of dayPatterns) {
      for (const label of pattern.labels) {
        const labelRegex = new RegExp(label.replace(/[-\s]/g, '[\\s-]+'), 'i');
        const labelMatch = fullText.search(labelRegex);
        
        if (labelMatch !== -1) {
          // Extract a larger section of text around the day label (5000 chars to catch all times)
          const sectionStart = Math.max(0, labelMatch);
          const sectionEnd = Math.min(fullText.length, labelMatch + 5000);
          const sectionText = fullText.substring(sectionStart, sectionEnd);
          
          // Find all times in this section
          const timeMatches = [...sectionText.matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi)];
          for (const match of timeMatches) {
            const [, hour, minute, period] = match;
            const hour24 = period.toUpperCase() === 'PM' && hour !== '12' 
              ? parseInt(hour) + 12 
              : period.toUpperCase() === 'AM' && hour === '12'
              ? 0
              : parseInt(hour);
            const time24 = `${String(hour24).padStart(2, '0')}:${minute}`;
            
            // Check if marked with * (via Devonport) but not ** (Waiheke Reserve)
            const timeIndex = match.index;
            const contextBefore = sectionText.substring(Math.max(0, timeIndex - 20), timeIndex);
            const contextAfter = sectionText.substring(timeIndex + match[0].length, Math.min(sectionText.length, timeIndex + match[0].length + 20));
            const isSlow = (contextBefore.includes('*') || contextAfter.includes('*')) && 
                          !contextAfter.includes('**') && !contextBefore.includes('**');
            
            const sailing = {
              time: time24,
              company: 'Fullers'
            };
            
            if (isSlow) {
              sailing.slow = true;
            }
            
            // Add to all days in this pattern
            for (const day of pattern.days) {
              const exists = schedule[day].some(s => s.time === time24);
              if (!exists) {
                schedule[day].push(sailing);
              }
            }
          }
          break;
        }
      }
    }
  }

  // Sort times for each day
  for (const day of Object.keys(schedule)) {
    schedule[day].sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
  }

  return schedule;
}

// Run the scraper
scrapeFullers().catch(console.error);


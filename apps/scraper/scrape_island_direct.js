import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ISLAND_DIRECT_URL = 'https://islanddirect.co.nz/pages/timetable';
const DATA_DIR = join(__dirname, '..', '..', 'data');
const HTML_DIR = join(DATA_DIR, 'html');

async function scrapeIslandDirect() {
  try {
    // Ensure directories exist
    await mkdir(DATA_DIR, { recursive: true });
    await mkdir(HTML_DIR, { recursive: true });

    console.log('Fetching Island Direct timetable...');
    const response = await fetch(ISLAND_DIRECT_URL);
    const html = await response.text();
    
    // Save HTML for debugging
    const htmlPath = join(HTML_DIR, 'island_direct.html');
    await writeFile(htmlPath, html, 'utf-8');
    console.log(`✓ Saved HTML to ${htmlPath}`);
    
    const $ = cheerio.load(html);

    const routes = [];

    // Extract Auckland to Waiheke schedule
    const aucklandToWaiheke = extractSchedule($, 'Auckland', 'Waiheke');
    if (aucklandToWaiheke && Object.keys(aucklandToWaiheke).length > 0) {
      routes.push({
        from: 'Auckland',
        to: 'Waiheke',
        schedule: aucklandToWaiheke
      });
    }

    // Extract Waiheke to Auckland schedule
    const waihekeToAuckland = extractSchedule($, 'Waiheke', 'Auckland');
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

  // Day patterns based on Island Direct website structure
  const dayPatterns = [
    { 
      key: 'monday-tuesday', 
      labels: ['Mon & Tues', 'Mon & Tue', 'MON & TUES', 'Monday - Tuesday', 'Monday-Tuesday'],
      days: ['monday', 'tuesday']
    },
    { 
      key: 'wednesday', 
      labels: ['wednesday', 'WEDNESDAY', 'Wednesday', 'Wed'],
      days: ['wednesday']
    },
    { 
      key: 'thursday-friday', 
      labels: ['thurs & fri', 'THURS & FRI', 'Thursday - Friday', 'Thursday-Friday', 'Thu-Fri', 'Thu - Fri'],
      days: ['thursday', 'friday']
    },
    { 
      key: 'saturday', 
      labels: ['SATURDAY', 'Saturday', 'Sat'],
      days: ['saturday']
    },
    { 
      key: 'sunday', 
      labels: ['sunday', 'SUNDAY', 'Sunday', 'Sun'],
      days: ['sunday']
    }
  ];

  // Find the section for the route direction
  // Look for headings like "Departure times: Auckland" or "Departing: Auckland"
  const routeHeading = $(`h4, h5, h6, [class*="departure"], [class*="timetable"]`).filter((i, elem) => {
    const text = $(elem).text().toLowerCase();
    return text.includes('departure') && text.includes(from.toLowerCase());
  }).first();

  // Find the container with the timetable
  let $container = routeHeading.length ? routeHeading.parent() : $('body');
  if (!$container.length) {
    $container = $('body');
  }

  // Extract times for each day pattern
  // Look for h6 tags which contain day labels, then find times in following p tags
  $container.find('h5, h6').each((i, elem) => {
    const $elem = $(elem);
    const text = $elem.text().trim();
    
    for (const pattern of dayPatterns) {
      // Check if this heading matches any of the day labels
      const normalizedText = text.toLowerCase().replace(/[&\s]+/g, ' ');
      const matchesPattern = pattern.labels.some(label => {
        const normalizedLabel = label.toLowerCase().replace(/[&\s]+/g, ' ');
        return normalizedText.includes(normalizedLabel) || normalizedLabel.includes(normalizedText);
      });
      
      if (matchesPattern) {
        const times = [];
        
        // Find times in the next sibling elements (p tags that follow the h6)
        // Look for p tags that are siblings of the h6 or within the same parent
        let $timeContainer = $elem.parent();
        if (!$timeContainer.length) {
          $timeContainer = $elem.nextAll().first().parent();
        }
        
        // Get all p tags that come after this h6 until the next h5/h6
        const $nextSiblings = $elem.nextUntil('h5, h6');
        $nextSiblings.filter('p').each((j, timeElem) => {
          const $timeElem = $(timeElem);
          const timeText = $timeElem.text().trim();
          
          // Skip if it's just a dash or empty
          if (timeText === '-' || !timeText) return;
          
          // Match time patterns: "7:30 am", "10:00am", "12:30pm", etc.
          const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
          if (timeMatch) {
            const [, hour, minute, period] = timeMatch;
            const hour24 = period.toUpperCase() === 'PM' && hour !== '12' 
              ? parseInt(hour) + 12 
              : period.toUpperCase() === 'AM' && hour === '12'
              ? 0
              : parseInt(hour);
            const time24 = `${String(hour24).padStart(2, '0')}:${minute}`;
            if (!times.includes(time24)) {
              times.push(time24);
            }
          }
        });
        
        // Also check within the parent container for p tags
        if (times.length === 0) {
          $timeContainer.find('p').each((j, timeElem) => {
            const $timeElem = $(timeElem);
            const timeText = $timeElem.text().trim();
            
            if (timeText === '-' || !timeText) return;
            
            const timeMatch = timeText.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
            if (timeMatch) {
              const [, hour, minute, period] = timeMatch;
              const hour24 = period.toUpperCase() === 'PM' && hour !== '12' 
                ? parseInt(hour) + 12 
                : period.toUpperCase() === 'AM' && hour === '12'
                ? 0
                : parseInt(hour);
              const time24 = `${String(hour24).padStart(2, '0')}:${minute}`;
              if (!times.includes(time24)) {
                times.push(time24);
              }
            }
          });
        }

        // Convert times to sailing objects and add to ALL days in this pattern
        // This ensures "Mon & Tues" applies to both Monday and Tuesday
        // and "Thurs & Fri" applies to both Thursday and Friday
        for (const time of times) {
          const sailing = {
            time: time,
            company: 'Island Direct'
          };
          
          // Add to all days in this pattern (e.g., both monday and tuesday for "Mon & Tues")
          for (const day of pattern.days) {
            // Check if this time already exists for this day
            const exists = schedule[day].some(s => s.time === time);
            if (!exists) {
              schedule[day].push(sailing);
            }
          }
        }
      }
    }
  });

  // Fallback: search full text if no times found
  if (Object.values(schedule).every(day => day.length === 0)) {
    const fullText = $container.text();
    
    for (const pattern of dayPatterns) {
      for (const label of pattern.labels) {
        const labelRegex = new RegExp(label.replace(/[&\s]/g, '[\\s&]+'), 'i');
        const labelMatch = fullText.search(labelRegex);
        
        if (labelMatch !== -1) {
          // Extract a section of text around the day label
          const sectionStart = Math.max(0, labelMatch);
          const sectionEnd = Math.min(fullText.length, labelMatch + 2000);
          const sectionText = fullText.substring(sectionStart, sectionEnd);
          
          // Find all times in this section
          const timeMatches = [...sectionText.matchAll(/(\d{1,2}):(\d{2})\s*(am|pm)/gi)];
          for (const match of timeMatches) {
            const [, hour, minute, period] = match;
            const hour24 = period.toUpperCase() === 'PM' && hour !== '12' 
              ? parseInt(hour) + 12 
              : period.toUpperCase() === 'AM' && hour === '12'
              ? 0
              : parseInt(hour);
            const time24 = `${String(hour24).padStart(2, '0')}:${minute}`;
            
            const sailing = {
              time: time24,
              company: 'Island Direct'
            };
            
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
scrapeIslandDirect().catch(console.error);


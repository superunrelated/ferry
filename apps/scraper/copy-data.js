import { copyFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '..', '..', 'data');
const PUBLIC_DATA_DIR = join(__dirname, '..', 'ferry', 'public', 'data');

async function copyData() {
  try {
    await mkdir(PUBLIC_DATA_DIR, { recursive: true });

    const files = ['fullers_timetable.json', 'island_direct_timetable.json'];

    for (const file of files) {
      const source = join(DATA_DIR, file);
      const dest = join(PUBLIC_DATA_DIR, file);
      try {
        await copyFile(source, dest);
        console.log(`✓ Copied ${file}`);
      } catch (err) {
        console.warn(`⚠ Could not copy ${file}: ${err.message}`);
      }
    }

    console.log('Data files copied to public directory');
  } catch (error) {
    console.error('Error copying data:', error);
    process.exit(1);
  }
}

copyData();


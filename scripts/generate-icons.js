#!/usr/bin/env node

/**
 * Script to generate PNG icons from icon_original.png for mobile web app support
 * Run with: node scripts/generate-icons.js
 * 
 * Note: This requires sharp to be installed: npm install --save-dev sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path from scripts/ to apps/ferry/public/
const publicDir = path.join(__dirname, '..', 'apps', 'ferry', 'public');
const sourceIconPath = path.join(publicDir, 'icon_original.png');

async function generateIcons() {
  try {
    // Try to import sharp
    const sharp = (await import('sharp')).default;
    
    if (!fs.existsSync(sourceIconPath)) {
      console.error('Source icon not found at:', sourceIconPath);
      process.exit(1);
    }

    const sourceImage = sharp(sourceIconPath);
    
    // Generate 192x192 icon
    await sourceImage
      .clone()
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));
    console.log('✓ Generated icon-192.png');

    // Generate 512x512 icon
    await sourceImage
      .clone()
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));
    console.log('✓ Generated icon-512.png');

    // Generate 180x180 Apple touch icon
    await sourceImage
      .clone()
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');

    // Also generate a favicon (32x32)
    await sourceImage
      .clone()
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ Error: sharp is not installed.');
      console.error('Please install it with: npm install --save-dev sharp');
      console.error('\nAlternatively, you can use an online image converter');
      console.error('to generate the following sizes from icon_original.png:');
      console.error('  - 192x192 (icon-192.png)');
      console.error('  - 512x512 (icon-512.png)');
      console.error('  - 180x180 (apple-touch-icon.png)');
      console.error('  - 32x32 (favicon-32x32.png)');
    } else {
      console.error('Error generating icons:', error.message);
    }
    process.exit(1);
  }
}

generateIcons();


/**
 * seed-photos.cjs
 *
 * Parses Flutter data files to extract photo arrays per museum/historical place,
 * then creates MuseumPhoto / HistoricalPlacePhoto records in the database.
 *
 * Photos are served from /static/uploads/museums/ and /static/uploads/historicals/
 *
 * Usage:
 *   node scripts/seed-photos.cjs
 */

const fs = require('fs');
const path = require('path');

// Load .env
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, '../apps/api/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

const { PrismaClient } = require(
  path.resolve(__dirname, '../node_modules/@prisma/client'),
);
const prisma = new PrismaClient();

const BASE_URL = process.env.PHOTOS_BASE_URL || '/static';

// Paths
const APP_IMAGE_PATH = path.resolve(
  __dirname,
  '../../Projects/ozbekiston_museylari/lib/core/utils/app_image.dart',
);
const MUSEUM_DATA_PATH = path.resolve(
  __dirname,
  '../../Projects/ozbekiston_museylari/lib/core/data/data.dart',
);
const HISTORICAL_DATA_PATH = path.resolve(
  __dirname,
  '../../Projects/ozbekiston_museylari/lib/core/data/data_historical.dart',
);

// ---------------------------------------------------------------------------
// Step 1: Parse AppImage class to build fieldName -> assetPath map
// ---------------------------------------------------------------------------
function parseAppImageMap() {
  const content = fs.readFileSync(APP_IMAGE_PATH, 'utf-8');
  const map = {};

  // Match: static String fieldName = 'path/to/file.jpg';
  // Also: static String fieldName = '$_baseUrl/file.jpg';
  const lines = content.split('\n');

  // First extract base paths
  const bases = {};
  for (const line of lines) {
    const baseMatch = line.match(/static\s+const\s+String\s+(\w+)\s*=\s*'([^']+)'/);
    if (baseMatch) {
      bases[baseMatch[1]] = baseMatch[2];
    }
  }

  for (const line of lines) {
    // Match interpolated paths first: '$_baseUrl/file.jpg'
    const interpMatch = line.match(/^\s*static\s+String\s+(\w+)\s*=\s*'\$(\w+)\/([^']+)'/);
    if (interpMatch) {
      const fieldName = interpMatch[1];
      const baseVar = interpMatch[2];
      const filePart = interpMatch[3];
      const basePath = bases[baseVar] || '';
      map[fieldName] = `${basePath}/${filePart}`;
      continue;
    }

    // Fallback: plain path without interpolation
    const plainMatch = line.match(/^\s*static\s+String\s+(\w+)\s*=\s*'([^$'][^']*\.(?:jpg|png))'/);
    if (plainMatch && !line.includes('const')) {
      map[plainMatch[1]] = plainMatch[2];
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Step 2: Extract photos arrays from Dart data files
// ---------------------------------------------------------------------------
function extractPhotosPerEntry(content, modelName) {
  const results = [];
  const modelPattern = new RegExp(`${modelName}\\(`, 'g');
  let match;

  while ((match = modelPattern.exec(content)) !== null) {
    const startIdx = match.index + match[0].length;
    const blockEnd = findMatchingParen(content, startIdx - 1);
    if (blockEnd === -1) continue;

    const block = content.slice(startIdx, blockEnd);
    const photos = extractPhotosList(block);
    results.push(photos);
  }

  return results;
}

function findMatchingParen(str, openIdx) {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTripleSingle = false;
  let inTripleDouble = false;

  for (let i = openIdx; i < str.length; i++) {
    const c = str[i];
    const next2 = str.slice(i, i + 3);

    if (!inDoubleQuote && !inSingleQuote && !inTripleDouble) {
      if (next2 === "'''" && !inTripleSingle) { inTripleSingle = true; i += 2; continue; }
      if (next2 === "'''" && inTripleSingle) { inTripleSingle = false; i += 2; continue; }
    }
    if (!inSingleQuote && !inDoubleQuote && !inTripleSingle) {
      if (next2 === '"""' && !inTripleDouble) { inTripleDouble = true; i += 2; continue; }
      if (next2 === '"""' && inTripleDouble) { inTripleDouble = false; i += 2; continue; }
    }
    if (inTripleSingle || inTripleDouble) continue;

    if (c === "'" && !inDoubleQuote && !inTripleSingle && !inTripleDouble) {
      if (i > 0 && str[i - 1] === '\\') continue;
      inSingleQuote = !inSingleQuote; continue;
    }
    if (c === '"' && !inSingleQuote && !inTripleSingle && !inTripleDouble) {
      if (i > 0 && str[i - 1] === '\\') continue;
      inDoubleQuote = !inDoubleQuote; continue;
    }
    if (inSingleQuote || inDoubleQuote) continue;

    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') {
      depth--;
      if (depth === 0 && c === ')') return i;
    }
  }
  return -1;
}

function extractPhotosList(block) {
  // Find: photos: [ ... ]
  const photosMatch = block.match(/photos:\s*\[/);
  if (!photosMatch) return [];

  const bracketStart = block.indexOf('[', photosMatch.index);
  let depth = 0;
  let bracketEnd = -1;
  for (let i = bracketStart; i < block.length; i++) {
    if (block[i] === '[') depth++;
    else if (block[i] === ']') {
      depth--;
      if (depth === 0) { bracketEnd = i; break; }
    }
  }
  if (bracketEnd === -1) return [];

  const arrayContent = block.slice(bracketStart + 1, bracketEnd);

  // Extract AppImage.xxx references
  const refs = [];
  const refPattern = /AppImage\.(\w+)/g;
  let refMatch;
  while ((refMatch = refPattern.exec(arrayContent)) !== null) {
    refs.push(refMatch[1]);
  }

  return refs;
}

// ---------------------------------------------------------------------------
// Step 3: Convert AppImage field names to static URLs
// ---------------------------------------------------------------------------
function resolvePhotoUrl(fieldName, appImageMap) {
  const assetPath = appImageMap[fieldName];
  if (!assetPath) return null;

  // assets/museums/aq_1.jpg -> /static/uploads/museums/aq_1.jpg
  // assets/historicals/ark1.jpg -> /static/uploads/historicals/ark1.jpg
  if (assetPath.startsWith('assets/museums/')) {
    const filename = assetPath.replace('assets/museums/', '');
    return `${BASE_URL}/uploads/museums/${filename}`;
  }
  if (assetPath.startsWith('assets/historicals/')) {
    const filename = assetPath.replace('assets/historicals/', '');
    return `${BASE_URL}/uploads/historicals/${filename}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('========================================');
  console.log('  Muzeylari Photo Seed Script');
  console.log('========================================');

  // 1. Parse AppImage map
  const appImageMap = parseAppImageMap();
  console.log(`Parsed ${Object.keys(appImageMap).length} AppImage fields`);

  // 2. Parse museum data photos
  const museumContent = fs.readFileSync(MUSEUM_DATA_PATH, 'utf-8');
  const museumPhotos = extractPhotosPerEntry(museumContent, 'MuseumModel');
  console.log(`Parsed photos for ${museumPhotos.length} museums`);

  // 3. Parse historical places data photos
  const historicalContent = fs.readFileSync(HISTORICAL_DATA_PATH, 'utf-8');
  const historicalPhotos = extractPhotosPerEntry(historicalContent, 'HistoricalPlaceModel');
  console.log(`Parsed photos for ${historicalPhotos.length} historical places`);

  // 4. Clear existing photos
  const deletedMuseumPhotos = await prisma.museumPhoto.deleteMany({});
  const deletedPlacePhotos = await prisma.historicalPlacePhoto.deleteMany({});
  console.log(`\nCleared ${deletedMuseumPhotos.count} museum photos, ${deletedPlacePhotos.count} place photos`);

  // 5. Seed museum photos
  console.log(`\n--- Seeding museum photos ---`);
  let museumPhotoCount = 0;
  let museumSkipped = 0;

  for (let i = 0; i < museumPhotos.length; i++) {
    const legacyId = i + 1;
    const photoRefs = museumPhotos[i];

    if (!photoRefs || photoRefs.length === 0) {
      continue;
    }

    const museum = await prisma.museum.findUnique({
      where: { legacyId },
      select: { id: true, name: true },
    });

    if (!museum) {
      museumSkipped++;
      continue;
    }

    const urls = photoRefs
      .map((ref) => resolvePhotoUrl(ref, appImageMap))
      .filter(Boolean);

    if (urls.length === 0) continue;

    for (let j = 0; j < urls.length; j++) {
      await prisma.museumPhoto.create({
        data: {
          museumId: museum.id,
          url: urls[j],
          orderIdx: j,
        },
      });
      museumPhotoCount++;
    }

    const name = typeof museum.name === 'object' ? (museum.name.uz || museum.name.en) : museum.name;
    console.log(`  [${legacyId}] ${urls.length} photos -> "${name}"`);
  }

  // 6. Seed historical place photos
  console.log(`\n--- Seeding historical place photos ---`);
  let placePhotoCount = 0;
  let placeSkipped = 0;

  for (let i = 0; i < historicalPhotos.length; i++) {
    const legacyId = i + 1;
    const photoRefs = historicalPhotos[i];

    if (!photoRefs || photoRefs.length === 0) {
      continue;
    }

    const place = await prisma.historicalPlace.findUnique({
      where: { legacyId },
      select: { id: true, name: true },
    });

    if (!place) {
      placeSkipped++;
      continue;
    }

    const urls = photoRefs
      .map((ref) => resolvePhotoUrl(ref, appImageMap))
      .filter(Boolean);

    if (urls.length === 0) continue;

    for (let j = 0; j < urls.length; j++) {
      await prisma.historicalPlacePhoto.create({
        data: {
          historicalPlaceId: place.id,
          url: urls[j],
          orderIdx: j,
        },
      });
      placePhotoCount++;
    }

    const name = typeof place.name === 'object' ? (place.name.uz || place.name.en) : place.name;
    console.log(`  [${legacyId}] ${urls.length} photos -> "${name}"`);
  }

  // 7. Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('  PHOTO SEED COMPLETE');
  console.log('='.repeat(60));
  console.log(`Museum photos:     ${museumPhotoCount} created (${museumSkipped} museums not found)`);
  console.log(`Place photos:      ${placePhotoCount} created (${placeSkipped} places not found)`);
  console.log(`Total:             ${museumPhotoCount + placePhotoCount} photos`);
}

main()
  .catch((e) => {
    console.error('\nFatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

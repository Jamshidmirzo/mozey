/**
 * migrate-photos.js
 *
 * Migrates photo references from the Flutter app's Dart data files
 * to the backend database via the admin HTTP API.
 *
 * This script does NOT require direct database access or S3 access.
 * It works by:
 * 1. Parsing Flutter data files to build legacyId -> photo filenames mapping
 * 2. Logging into the admin API
 * 3. Fetching all museums/places from the admin API to get UUID -> legacyId mapping
 * 4. Calling POST /admin/museums/:id/photos/bulk for each entity
 *
 * The photo URLs point to static files served by the backend at /static/uploads/...
 * The actual photo files must be present on the server in the public/uploads/ directory.
 *
 * Usage:
 *   node scripts/migrate-photos.js
 *
 * Environment variables:
 *   API_BASE_URL      - Backend API URL (default: http://157.230.225.147:3000/api/v1)
 *   STATIC_BASE_URL   - Base URL for static photo files (default: http://157.230.225.147:3000/static)
 *   ADMIN_EMAIL       - Admin login email (default: admin@muzeylari.uz)
 *   ADMIN_PASSWORD    - Admin login password (default: change-me-admin-password)
 *   FLUTTER_PROJECT   - Path to Flutter project (default: ../../Projects/ozbekiston_museylari)
 *   DRY_RUN           - Set to "true" to preview without making changes
 *   SKIP_EXISTING     - Set to "true" to skip entities that already have photos (default: false)
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = process.env.API_BASE_URL || 'http://157.230.225.147:3000/api/v1';
const STATIC_BASE = process.env.STATIC_BASE_URL || 'http://157.230.225.147:3000/static';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@muzeylari.uz';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-admin-password';
const DRY_RUN = process.env.DRY_RUN === 'true';
const SKIP_EXISTING = process.env.SKIP_EXISTING === 'true';

const FLUTTER_PROJECT = resolve(
  __dirname,
  process.env.FLUTTER_PROJECT || '../../Projects/ozbekiston_museylari',
);

const APP_IMAGE_PATH = resolve(
  FLUTTER_PROJECT,
  'lib/core/utils/app_image.dart',
);
const MUSEUM_DATA_PATH = resolve(
  FLUTTER_PROJECT,
  'lib/core/data/data.dart',
);
const HISTORICAL_DATA_PATH = resolve(
  FLUTTER_PROJECT,
  'lib/core/data/data_historical.dart',
);

// ---------------------------------------------------------------------------
// AppImage parser: builds constantName -> relative asset path map
// ---------------------------------------------------------------------------

function parseAppImageConstants(content) {
  const constants = {};

  // Extract base URL constants
  const bases = {};
  const basePattern = /static\s+const\s+String\s+(\w+)\s*=\s*'([^']+)'/g;
  let baseMatch;
  while ((baseMatch = basePattern.exec(content)) !== null) {
    bases[baseMatch[1]] = baseMatch[2];
  }

  // Map known interpolation variables to their values
  const interpolations = {
    '$_baseImageUrl': bases['_baseImageUrl'] || 'assets/images',
    '$_baseHistoryUrl': bases['_baseHistoryUrl'] || 'assets/historicals',
    '$_baseUrl': bases['_baseUrl'] || 'assets/museums',
  };

  // Parse all static String fields
  const fieldPattern = /static\s+String\s+(\w+)\s*=\s*'([^']+)'/g;
  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(content)) !== null) {
    const name = fieldMatch[1];
    let path = fieldMatch[2];

    if (name.startsWith('_base')) continue;

    for (const [interp, value] of Object.entries(interpolations)) {
      path = path.replace(interp, value);
    }

    constants[name] = path;
  }

  return constants;
}

// ---------------------------------------------------------------------------
// Dart data parser: extracts photo arrays per model entry
// ---------------------------------------------------------------------------

function parsePhotosFromDartFile(content, modelName) {
  const allPhotos = [];
  const modelPattern = new RegExp(`${modelName}\\(`, 'g');
  let match;

  while ((match = modelPattern.exec(content)) !== null) {
    const startIdx = match.index + match[0].length;
    const blockEnd = findMatchingParen(content, startIdx - 1);
    if (blockEnd === -1) {
      allPhotos.push([]);
      continue;
    }

    const block = content.slice(startIdx, blockEnd);
    const photos = extractPhotosList(block);
    allPhotos.push(photos);
  }

  return allPhotos;
}

function extractPhotosList(block) {
  const commentedPattern = /\/\/\s*photos:\s*/;
  const activePattern = /photos:\s*\[/;

  const commentedMatch = commentedPattern.exec(block);
  const activeMatch = activePattern.exec(block);

  if (commentedMatch) {
    if (!activeMatch || commentedMatch.index < activeMatch.index) {
      return [];
    }
  }

  if (!activeMatch) {
    return [];
  }

  const bracketStart = block.indexOf('[', activeMatch.index);
  if (bracketStart === -1) return [];

  let depth = 0;
  let bracketEnd = -1;
  for (let i = bracketStart; i < block.length; i++) {
    if (block[i] === '[') depth++;
    else if (block[i] === ']') {
      depth--;
      if (depth === 0) {
        bracketEnd = i;
        break;
      }
    }
  }

  if (bracketEnd === -1) return [];

  const listContent = block.slice(bracketStart + 1, bracketEnd);

  const photos = [];
  const appImagePattern = /AppImage\.(\w+)/g;
  let photoMatch;
  while ((photoMatch = appImagePattern.exec(listContent)) !== null) {
    photos.push(photoMatch[1]);
  }

  return photos;
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
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (c === '"' && !inSingleQuote && !inTripleSingle && !inTripleDouble) {
      if (i > 0 && str[i - 1] === '\\') continue;
      inDoubleQuote = !inDoubleQuote;
      continue;
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

// ---------------------------------------------------------------------------
// Convert AppImage constant name to a static file URL
// ---------------------------------------------------------------------------

function resolvePhotoUrl(constantName, appImageMap) {
  const assetPath = appImageMap[constantName];
  if (!assetPath) return null;

  // assets/museums/aq_1.jpg -> /static/uploads/museums/aq_1.jpg
  // assets/historicals/ark1.jpg -> /static/uploads/historicals/ark1.jpg
  if (assetPath.startsWith('assets/museums/')) {
    const filename = assetPath.replace('assets/museums/', '');
    return `${STATIC_BASE}/uploads/museums/${filename}`;
  }
  if (assetPath.startsWith('assets/historicals/')) {
    const filename = assetPath.replace('assets/historicals/', '');
    return `${STATIC_BASE}/uploads/historicals/${filename}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

let accessToken = null;

async function login() {
  console.log(`\nLogging in as ${ADMIN_EMAIL}...`);

  const res = await fetch(`${API_BASE}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed (${res.status}): ${text}`);
  }

  const responseBody = await res.json();
  const data = responseBody.data || responseBody;
  accessToken = data.accessToken;
  console.log(`Logged in successfully as ${data.admin?.email || ADMIN_EMAIL} (${data.admin?.role || 'admin'})`);
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await res.json();
  return {
    status: res.status,
    data: json.data !== undefined ? json.data : json,
  };
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return {
    status: res.status,
    data: json.data !== undefined ? json.data : json,
  };
}

// ---------------------------------------------------------------------------
// Fetch all entities with pagination
// ---------------------------------------------------------------------------

async function fetchAllEntities(entityPath) {
  const allItems = [];
  let page = 1;
  const limit = 200;

  while (true) {
    const { status, data } = await apiGet(
      `/admin/${entityPath}?page=${page}&limit=${limit}`,
    );

    if (status !== 200) {
      throw new Error(
        `Failed to fetch ${entityPath} page ${page}: status ${status}`,
      );
    }

    const items = data.items || [];
    allItems.push(...items);

    if (items.length < limit || page >= (data.totalPages || 1)) {
      break;
    }
    page++;
  }

  return allItems;
}

// ---------------------------------------------------------------------------
// Process entities
// ---------------------------------------------------------------------------

function getEntityName(entity) {
  if (entity.name) {
    return entity.name.uz || entity.name.ru || entity.name.en || 'Unknown';
  }
  return 'Unknown';
}

async function processEntityPhotos(
  entityType,
  entityLabel,
  allPhotos,
  dbEntities,
  appImageMap,
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing photos for ${entityLabel}`);
  console.log('='.repeat(60));

  // Build legacyId -> dbEntity map
  const legacyIdToEntity = {};
  for (const entity of dbEntities) {
    if (entity.legacyId) {
      legacyIdToEntity[entity.legacyId] = entity;
    }
  }

  const stats = {
    totalEntities: 0,
    totalPhotos: 0,
    imported: 0,
    skippedNoEntity: 0,
    skippedNoUrl: 0,
    skippedExisting: 0,
    errors: [],
  };

  for (let i = 0; i < allPhotos.length; i++) {
    const legacyId = i + 1;
    const photoRefs = allPhotos[i];
    const dbEntity = legacyIdToEntity[legacyId];

    if (!dbEntity) {
      if (photoRefs.length > 0) {
        console.log(
          `  [${legacyId}/${allPhotos.length}] SKIP -- no DB entity for legacyId ${legacyId} (${photoRefs.length} photos)`,
        );
        stats.skippedNoEntity += photoRefs.length;
      }
      continue;
    }

    // Check if entity already has photos and SKIP_EXISTING is on
    const existingPhotos = dbEntity.photos || [];
    if (SKIP_EXISTING && existingPhotos.length > 0) {
      console.log(
        `  [${legacyId}/${allPhotos.length}] SKIP -- "${getEntityName(dbEntity)}" already has ${existingPhotos.length} photos`,
      );
      stats.skippedExisting += photoRefs.length;
      continue;
    }

    if (photoRefs.length === 0) {
      continue;
    }

    stats.totalEntities++;
    const entityName = getEntityName(dbEntity);

    // Resolve all photo URLs
    const photos = [];
    for (let j = 0; j < photoRefs.length; j++) {
      const url = resolvePhotoUrl(photoRefs[j], appImageMap);
      if (!url) {
        console.log(
          `    WARN: Cannot resolve URL for AppImage.${photoRefs[j]} -- skipping`,
        );
        stats.skippedNoUrl++;
        continue;
      }
      photos.push({ url, orderIdx: j });
    }

    if (photos.length === 0) continue;

    stats.totalPhotos += photos.length;

    if (DRY_RUN) {
      console.log(
        `  [${legacyId}/${allPhotos.length}] DRY -- "${entityName}": would import ${photos.length} photos`,
      );
      for (const p of photos) {
        console.log(`    [${p.orderIdx}] ${p.url}`);
      }
      stats.imported += photos.length;
      continue;
    }

    // Call bulk import endpoint
    const apiPath =
      entityType === 'museum'
        ? `/admin/museums/${dbEntity.id}/photos/bulk`
        : `/admin/historical-places/${dbEntity.id}/photos/bulk`;

    const { status, data } = await apiPost(apiPath, { photos });

    if (status === 201 || status === 200) {
      stats.imported += photos.length;
      console.log(
        `  [${legacyId}/${allPhotos.length}] OK -- "${entityName}": ${photos.length} photos imported (deleted ${data.deletedCount || 0} old)`,
      );
    } else {
      stats.errors.push(
        `Bulk import failed for "${entityName}" (legacyId ${legacyId}): status ${status} - ${JSON.stringify(data).slice(0, 200)}`,
      );
      console.log(
        `  [${legacyId}/${allPhotos.length}] ERROR -- "${entityName}": status ${status}`,
      );
    }
  }

  console.log(`\n${entityLabel} summary:`);
  console.log(`  Entities processed: ${stats.totalEntities}`);
  console.log(`  Photos imported:    ${stats.imported}`);
  console.log(`  Skipped (no DB entity): ${stats.skippedNoEntity}`);
  console.log(`  Skipped (no URL):       ${stats.skippedNoUrl}`);
  console.log(`  Skipped (existing):     ${stats.skippedExisting}`);
  if (stats.errors.length > 0) {
    console.log(`  Errors: ${stats.errors.length}`);
    for (const err of stats.errors) {
      console.log(`    - ${err}`);
    }
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('================================================');
  console.log('  Muzeylari Photo Migration Script (via API)');
  console.log('================================================');
  console.log(`API:             ${API_BASE}`);
  console.log(`Static base:     ${STATIC_BASE}`);
  console.log(`Admin:           ${ADMIN_EMAIL}`);
  console.log(`Flutter project: ${FLUTTER_PROJECT}`);
  console.log(`Dry run:         ${DRY_RUN}`);
  console.log(`Skip existing:   ${SKIP_EXISTING}`);

  // 1. Parse AppImage constants
  console.log('\n--- Parsing AppImage constants ---');
  let appImageContent;
  try {
    appImageContent = readFileSync(APP_IMAGE_PATH, 'utf-8');
  } catch (err) {
    console.error(`Cannot read AppImage file: ${err.message}`);
    process.exit(1);
  }

  const appImageMap = parseAppImageConstants(appImageContent);
  console.log(`Parsed ${Object.keys(appImageMap).length} AppImage constants`);

  // 2. Parse photo arrays from data files
  console.log('\n--- Parsing photo arrays from Dart data files ---');

  let museumContent;
  try {
    museumContent = readFileSync(MUSEUM_DATA_PATH, 'utf-8');
  } catch (err) {
    console.error(`Cannot read museum data file: ${err.message}`);
    process.exit(1);
  }

  let historicalContent;
  try {
    historicalContent = readFileSync(HISTORICAL_DATA_PATH, 'utf-8');
  } catch (err) {
    console.error(`Cannot read historical data file: ${err.message}`);
    process.exit(1);
  }

  const museumPhotos = parsePhotosFromDartFile(museumContent, 'MuseumModel');
  console.log(
    `Parsed ${museumPhotos.length} museums, ${museumPhotos.reduce((s, p) => s + p.length, 0)} total photo refs`,
  );

  const historicalPhotos = parsePhotosFromDartFile(
    historicalContent,
    'HistoricalPlaceModel',
  );
  console.log(
    `Parsed ${historicalPhotos.length} historical places, ${historicalPhotos.reduce((s, p) => s + p.length, 0)} total photo refs`,
  );

  // 3. Login
  await login();

  // 4. Fetch entities
  console.log('\n--- Fetching entities from API ---');

  const dbMuseums = await fetchAllEntities('museums');
  console.log(`Fetched ${dbMuseums.length} museums`);

  const dbPlaces = await fetchAllEntities('historical-places');
  console.log(`Fetched ${dbPlaces.length} historical places`);

  // 5. Process museums
  const museumStats = await processEntityPhotos(
    'museum',
    'Museums',
    museumPhotos,
    dbMuseums,
    appImageMap,
  );

  // 6. Process historical places
  const placeStats = await processEntityPhotos(
    'historical-place',
    'Historical Places',
    historicalPhotos,
    dbPlaces,
    appImageMap,
  );

  // 7. Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('  PHOTO MIGRATION COMPLETE');
  console.log('='.repeat(60));

  const totalImported = museumStats.imported + placeStats.imported;
  const totalErrors = museumStats.errors.length + placeStats.errors.length;

  console.log(`Museum photos imported:     ${museumStats.imported}`);
  console.log(`Historical photos imported: ${placeStats.imported}`);
  console.log(`Total imported:             ${totalImported}`);
  console.log(`Total errors:               ${totalErrors}`);

  if (DRY_RUN) {
    console.log('\n*** DRY RUN -- no actual changes were made ***');
  }

  if (totalErrors > 0) {
    console.log('\nSome imports failed. Check the error logs above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});

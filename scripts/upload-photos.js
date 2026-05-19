/**
 * upload-photos.js
 *
 * Reads photo references from the Flutter app's Dart data files,
 * resolves them to actual image files via AppImage constants,
 * uploads each image to MinIO via presigned URLs, and creates
 * photo records in the database via the admin API.
 *
 * Usage:
 *   node scripts/upload-photos.js
 *
 * Environment variables (optional):
 *   API_BASE_URL      — default: http://localhost:3000/api/v1
 *   ADMIN_EMAIL       — default: admin@muzeylari.uz
 *   ADMIN_PASSWORD    — default: change-me-admin-password
 *   FLUTTER_PROJECT   — default: ../../Projects/ozbekiston_museylari
 *   CONCURRENCY       — default: 3 (parallel uploads)
 *   DRY_RUN           — set to "true" to skip actual uploads
 *
 * Requires Node.js 20+ (uses built-in fetch and fs).
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@muzeylari.uz';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-admin-password';
const DRY_RUN = process.env.DRY_RUN === 'true';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '3', 10);

const __dirname = dirname(fileURLToPath(import.meta.url));

const FLUTTER_PROJECT = resolve(
  __dirname,
  process.env.FLUTTER_PROJECT || '../../Projects/ozbekiston_museylari',
);

const MUSEUM_DATA_PATH = resolve(
  FLUTTER_PROJECT,
  'lib/core/data/data.dart',
);
const HISTORICAL_DATA_PATH = resolve(
  FLUTTER_PROJECT,
  'lib/core/data/data_historical.dart',
);
const APP_IMAGE_PATH = resolve(
  FLUTTER_PROJECT,
  'lib/core/utils/app_image.dart',
);

// ---------------------------------------------------------------------------
// MIME type helper
// ---------------------------------------------------------------------------

function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/jpeg'; // fallback
  }
}

// ---------------------------------------------------------------------------
// AppImage parser
// ---------------------------------------------------------------------------

/**
 * Parse app_image.dart to build a map: constantName -> relative asset path.
 *
 * The Dart file has patterns like:
 *   static String alhakim = '$_baseHistoryUrl/alhakim.jpg';
 *   static String termiza1 = '$_baseUrl/termiza_1.jpg';
 *
 * We resolve the interpolated base URLs to actual paths.
 */
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

  // Parse all static String fields (non-const, since most are just `static String`)
  const fieldPattern = /static\s+String\s+(\w+)\s*=\s*'([^']+)'/g;
  let fieldMatch;
  while ((fieldMatch = fieldPattern.exec(content)) !== null) {
    const name = fieldMatch[1];
    let path = fieldMatch[2];

    // Skip base URL constants themselves
    if (name.startsWith('_base')) continue;

    // Resolve interpolations
    for (const [interp, value] of Object.entries(interpolations)) {
      path = path.replace(interp, value);
    }

    constants[name] = path;
  }

  // Also handle the string interpolation pattern: '$_baseUrl/filename.jpg'
  // Some entries use double quotes
  const fieldPattern2 = /static\s+String\s+(\w+)\s*=\s*"([^"]+)"/g;
  let fieldMatch2;
  while ((fieldMatch2 = fieldPattern2.exec(content)) !== null) {
    const name = fieldMatch2[1];
    let path = fieldMatch2[2];

    if (name.startsWith('_base')) continue;

    for (const [interp, value] of Object.entries(interpolations)) {
      path = path.replace(interp, value);
    }

    constants[name] = path;
  }

  return constants;
}

// ---------------------------------------------------------------------------
// Dart photo array parser
// ---------------------------------------------------------------------------

/**
 * Parse the photos: [...] array from each model constructor in data.dart.
 * Returns an array of arrays, where each inner array contains AppImage constant
 * names in order (e.g., ['aq1', 'aq2', 'aq3', 'aq4']).
 *
 * We correlate entries by their order (index) — the same legacyId = index+1
 * used in import-data.js.
 */
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

/**
 * Extract the list of AppImage.xxx references from a constructor block.
 * Handles:
 *   photos: [AppImage.aq1, AppImage.aq2, ...]
 *   // photos: ,   (commented out — returns empty)
 *   // photos: [AppImage.qk_1, ...]   (commented out — returns empty)
 */
function extractPhotosList(block) {
  // Check if photos is commented out
  const commentedPattern = /\/\/\s*photos:\s*/;
  const activePattern = /photos:\s*\[/;

  // Find both patterns, use the one that appears first
  const commentedMatch = commentedPattern.exec(block);
  const activeMatch = activePattern.exec(block);

  // If commented pattern found and it appears before (or instead of) active pattern
  if (commentedMatch) {
    if (!activeMatch || commentedMatch.index < activeMatch.index) {
      return []; // Photos are commented out
    }
  }

  if (!activeMatch) {
    return [];
  }

  // Find the matching closing bracket
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

  // Extract AppImage.xxx references
  const photos = [];
  const appImagePattern = /AppImage\.(\w+)/g;
  let photoMatch;
  while ((photoMatch = appImagePattern.exec(listContent)) !== null) {
    photos.push(photoMatch[1]);
  }

  return photos;
}

/**
 * Find the index of the closing ')' that matches the '(' at `openIdx`.
 * Reused from import-data.js.
 */
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
      if (next2 === "'''" && !inTripleSingle) {
        inTripleSingle = true;
        i += 2;
        continue;
      }
      if (next2 === "'''" && inTripleSingle) {
        inTripleSingle = false;
        i += 2;
        continue;
      }
    }

    if (!inSingleQuote && !inDoubleQuote && !inTripleSingle) {
      if (next2 === '"""' && !inTripleDouble) {
        inTripleDouble = true;
        i += 2;
        continue;
      }
      if (next2 === '"""' && inTripleDouble) {
        inTripleDouble = false;
        i += 2;
        continue;
      }
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

    if (c === '(' || c === '[' || c === '{') {
      depth++;
    } else if (c === ')' || c === ']' || c === '}') {
      depth--;
      if (depth === 0 && c === ')') {
        return i;
      }
    }
  }

  return -1;
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
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();
  return { status: res.status, data: json.data !== undefined ? json.data : json };
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

  const unwrapped = json.data !== undefined ? json.data : json;
  return { status: res.status, data: unwrapped };
}

// ---------------------------------------------------------------------------
// Fetch all entities with pagination
// ---------------------------------------------------------------------------

/**
 * Fetch all entities (museums or historical places) from the admin API,
 * paginating through all pages. Returns an array of entities.
 */
async function fetchAllEntities(entityPath) {
  const allItems = [];
  let page = 1;
  const limit = 200; // Max allowed by API

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
// Upload Logic
// ---------------------------------------------------------------------------

/**
 * Upload a single file to S3 via presigned URL, then register it as a photo.
 */
async function uploadAndRegisterPhoto(
  entityType,
  entityId,
  entityName,
  absoluteFilePath,
  orderIdx,
  stats,
) {
  const filename = absoluteFilePath.split('/').pop();
  const contentType = getContentType(absoluteFilePath);

  // Step 1: Get presigned URL
  const { status: presignStatus, data: presignData } = await apiPost(
    '/admin/upload/presign',
    { filename, contentType },
  );

  if (presignStatus !== 201) {
    stats.errors.push(
      `Presign failed for ${filename} (${entityName}): status ${presignStatus}`,
    );
    return false;
  }

  const { uploadUrl, fileUrl } = presignData;

  // Step 2: Upload file to presigned URL
  const fileBuffer = readFileSync(absoluteFilePath);

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => 'unknown error');
    stats.errors.push(
      `S3 upload failed for ${filename} (${entityName}): ${uploadRes.status} - ${errText.slice(0, 200)}`,
    );
    return false;
  }

  // Step 3: Register photo in database
  const photoPath =
    entityType === 'museum'
      ? `/admin/museums/${entityId}/photos`
      : `/admin/historical-places/${entityId}/photos`;

  const { status: photoStatus, data: photoData } = await apiPost(photoPath, {
    url: fileUrl,
    orderIdx,
  });

  if (photoStatus !== 201) {
    stats.errors.push(
      `Photo registration failed for ${filename} (${entityName}): status ${photoStatus} - ${JSON.stringify(photoData).slice(0, 200)}`,
    );
    return false;
  }

  return true;
}

/**
 * Process photos for a set of entities (museums or historical places).
 */
async function processEntityPhotos(
  entityType,
  entityLabel,
  allPhotos,
  dbEntities,
  appImageConstants,
) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Uploading photos for ${entityLabel}`);
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
    uploaded: 0,
    skippedNoEntity: 0,
    skippedNoFile: 0,
    skippedExisting: 0,
    errors: [],
  };

  for (let i = 0; i < allPhotos.length; i++) {
    const legacyId = i + 1;
    const photos = allPhotos[i];
    const dbEntity = legacyIdToEntity[legacyId];

    if (!dbEntity) {
      if (photos.length > 0) {
        console.log(
          `  [${legacyId}/${allPhotos.length}] SKIP — no DB entity found for legacyId ${legacyId} (${photos.length} photos)`,
        );
        stats.skippedNoEntity += photos.length;
      }
      continue;
    }

    // Check if entity already has photos
    const existingPhotos = dbEntity.photos || [];
    if (existingPhotos.length > 0) {
      console.log(
        `  [${legacyId}/${allPhotos.length}] SKIP — "${getEntityName(dbEntity)}" already has ${existingPhotos.length} photos`,
      );
      stats.skippedExisting += photos.length;
      continue;
    }

    if (photos.length === 0) {
      continue;
    }

    stats.totalEntities++;
    const entityName = getEntityName(dbEntity);

    // Process each photo for this entity
    let uploadedForEntity = 0;
    let skippedForEntity = 0;

    for (let photoIdx = 0; photoIdx < photos.length; photoIdx++) {
      const constantName = photos[photoIdx];
      const relativePath = appImageConstants[constantName];

      if (!relativePath) {
        console.log(
          `    WARN: No AppImage mapping for "${constantName}" — skipping`,
        );
        stats.skippedNoFile++;
        skippedForEntity++;
        continue;
      }

      const absolutePath = resolve(FLUTTER_PROJECT, relativePath);

      if (!existsSync(absolutePath)) {
        console.log(
          `    WARN: File not found: ${relativePath} — skipping`,
        );
        stats.skippedNoFile++;
        skippedForEntity++;
        continue;
      }

      stats.totalPhotos++;

      if (DRY_RUN) {
        const size = statSync(absolutePath).size;
        console.log(
          `    [DRY] Would upload: ${relativePath} (${(size / 1024).toFixed(1)} KB) → orderIdx ${photoIdx}`,
        );
        stats.uploaded++;
        uploadedForEntity++;
        continue;
      }

      const success = await uploadAndRegisterPhoto(
        entityType === 'museum' ? 'museum' : 'historical-place',
        dbEntity.id,
        entityName,
        absolutePath,
        photoIdx,
        stats,
      );

      if (success) {
        stats.uploaded++;
        uploadedForEntity++;
      }
    }

    const statusTag =
      skippedForEntity > 0
        ? ` (${skippedForEntity} skipped)`
        : '';
    console.log(
      `  [${legacyId}/${allPhotos.length}] ${DRY_RUN ? 'DRY' : 'OK'} — "${entityName}": ${uploadedForEntity}/${photos.length} photos${statusTag}`,
    );
  }

  console.log(`\n${entityLabel} photo upload summary:`);
  console.log(`  Entities processed: ${stats.totalEntities}`);
  console.log(`  Photos uploaded: ${stats.uploaded}`);
  console.log(`  Skipped (no DB entity): ${stats.skippedNoEntity}`);
  console.log(`  Skipped (no file): ${stats.skippedNoFile}`);
  console.log(`  Skipped (already has photos): ${stats.skippedExisting}`);

  if (stats.errors.length > 0) {
    console.log(`  Errors: ${stats.errors.length}`);
    for (const err of stats.errors) {
      console.log(`    - ${err}`);
    }
  }

  return stats;
}

function getEntityName(entity) {
  if (entity.name) {
    return entity.name.uz || entity.name.ru || entity.name.en || 'Unknown';
  }
  return 'Unknown';
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('================================================');
  console.log('  Muzeylari Photo Upload Script');
  console.log('================================================');
  console.log(`API:            ${API_BASE}`);
  console.log(`Admin:          ${ADMIN_EMAIL}`);
  console.log(`Flutter project: ${FLUTTER_PROJECT}`);
  console.log(`Dry run:        ${DRY_RUN}`);
  console.log(`Concurrency:    ${CONCURRENCY}`);

  // -----------------------------------------------------------------------
  // 1. Parse AppImage constants
  // -----------------------------------------------------------------------
  console.log('\n--- Parsing AppImage constants ---');

  let appImageContent;
  try {
    appImageContent = readFileSync(APP_IMAGE_PATH, 'utf-8');
    console.log(`Read ${APP_IMAGE_PATH} (${appImageContent.length} chars)`);
  } catch (err) {
    console.error(`Cannot read AppImage file: ${err.message}`);
    process.exit(1);
  }

  const appImageConstants = parseAppImageConstants(appImageContent);
  const totalConstants = Object.keys(appImageConstants).length;
  console.log(`Parsed ${totalConstants} AppImage constants`);

  // Validate: check a few known paths exist
  let validCount = 0;
  let missingCount = 0;
  for (const [name, relPath] of Object.entries(appImageConstants)) {
    const absPath = resolve(FLUTTER_PROJECT, relPath);
    if (existsSync(absPath)) {
      validCount++;
    } else {
      missingCount++;
      if (missingCount <= 5) {
        console.log(`  WARN: Missing file for AppImage.${name}: ${relPath}`);
      }
    }
  }
  console.log(
    `  Valid files: ${validCount}/${totalConstants} (${missingCount} missing)`,
  );

  // -----------------------------------------------------------------------
  // 2. Parse photo arrays from data files
  // -----------------------------------------------------------------------
  console.log('\n--- Parsing photo arrays from Dart data files ---');

  let museumContent;
  try {
    museumContent = readFileSync(MUSEUM_DATA_PATH, 'utf-8');
    console.log(`Read museum data (${museumContent.length} chars)`);
  } catch (err) {
    console.error(`Cannot read museum data file: ${err.message}`);
    process.exit(1);
  }

  let historicalContent;
  try {
    historicalContent = readFileSync(HISTORICAL_DATA_PATH, 'utf-8');
    console.log(`Read historical data (${historicalContent.length} chars)`);
  } catch (err) {
    console.error(`Cannot read historical data file: ${err.message}`);
    process.exit(1);
  }

  const museumPhotos = parsePhotosFromDartFile(museumContent, 'MuseumModel');
  console.log(
    `Parsed ${museumPhotos.length} museum entries, ` +
      `${museumPhotos.reduce((sum, p) => sum + p.length, 0)} total photo refs`,
  );

  const historicalPhotos = parsePhotosFromDartFile(
    historicalContent,
    'HistoricalPlaceModel',
  );
  console.log(
    `Parsed ${historicalPhotos.length} historical place entries, ` +
      `${historicalPhotos.reduce((sum, p) => sum + p.length, 0)} total photo refs`,
  );

  // Print first few for validation
  if (museumPhotos.length > 0) {
    console.log(`\nSample museum photos (first 3 entries):`);
    for (let i = 0; i < Math.min(3, museumPhotos.length); i++) {
      console.log(`  [${i + 1}] ${museumPhotos[i].join(', ') || '(no photos)'}`);
    }
  }

  if (historicalPhotos.length > 0) {
    console.log(`\nSample historical photos (first 3 entries):`);
    for (let i = 0; i < Math.min(3, historicalPhotos.length); i++) {
      console.log(
        `  [${i + 1}] ${historicalPhotos[i].join(', ') || '(no photos)'}`,
      );
    }
  }

  // -----------------------------------------------------------------------
  // 3. Login to admin API
  // -----------------------------------------------------------------------
  await login();

  // -----------------------------------------------------------------------
  // 4. Fetch all museums and historical places from DB
  // -----------------------------------------------------------------------
  console.log('\n--- Fetching entities from database ---');

  const dbMuseums = await fetchAllEntities('museums');
  console.log(`Fetched ${dbMuseums.length} museums from DB`);

  const dbHistoricalPlaces = await fetchAllEntities('historical-places');
  console.log(`Fetched ${dbHistoricalPlaces.length} historical places from DB`);

  // -----------------------------------------------------------------------
  // 5. Upload museum photos
  // -----------------------------------------------------------------------
  const museumStats = await processEntityPhotos(
    'museum',
    'Museums',
    museumPhotos,
    dbMuseums,
    appImageConstants,
  );

  // -----------------------------------------------------------------------
  // 6. Upload historical place photos
  // -----------------------------------------------------------------------
  const historicalStats = await processEntityPhotos(
    'historical-place',
    'Historical Places',
    historicalPhotos,
    dbHistoricalPlaces,
    appImageConstants,
  );

  // -----------------------------------------------------------------------
  // 7. Final summary
  // -----------------------------------------------------------------------
  console.log(`\n${'='.repeat(60)}`);
  console.log('  PHOTO UPLOAD COMPLETE');
  console.log('='.repeat(60));

  const totalUploaded = museumStats.uploaded + historicalStats.uploaded;
  const totalErrors = museumStats.errors.length + historicalStats.errors.length;
  const totalSkippedNoFile =
    museumStats.skippedNoFile + historicalStats.skippedNoFile;
  const totalSkippedNoEntity =
    museumStats.skippedNoEntity + historicalStats.skippedNoEntity;
  const totalSkippedExisting =
    museumStats.skippedExisting + historicalStats.skippedExisting;

  console.log(`Museum photos uploaded:     ${museumStats.uploaded}`);
  console.log(`Historical photos uploaded:  ${historicalStats.uploaded}`);
  console.log(`Total uploaded:             ${totalUploaded}`);
  console.log(`Skipped (already existing): ${totalSkippedExisting}`);
  console.log(`Skipped (no DB entity):     ${totalSkippedNoEntity}`);
  console.log(`Skipped (missing file):     ${totalSkippedNoFile}`);
  console.log(`Errors:                     ${totalErrors}`);

  if (DRY_RUN) {
    console.log('\n*** DRY RUN — no actual uploads were performed ***');
  }

  if (totalErrors > 0) {
    console.log('\nSome uploads failed. Check the error logs above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});

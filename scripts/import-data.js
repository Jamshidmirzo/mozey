/**
 * import-data.js
 *
 * Parses hardcoded Dart data files from the Flutter app and imports
 * museums + historical places into the NestJS API via admin endpoints.
 *
 * Usage:
 *   node scripts/import-data.js
 *
 * Environment variables (optional):
 *   API_BASE_URL   — default: http://localhost:3000/api/v1
 *   ADMIN_EMAIL    — default: admin@muzeylari.uz
 *   ADMIN_PASSWORD — default: change-me-admin-password
 *
 * Requires Node.js 20+ (uses built-in fetch).
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@muzeylari.uz';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-admin-password';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MUSEUM_DATA_PATH = resolve(
  __dirname,
  '../../Projects/ozbekiston_museylari/lib/core/data/data.dart',
);
const HISTORICAL_DATA_PATH = resolve(
  __dirname,
  '../../Projects/ozbekiston_museylari/lib/core/data/data_historical.dart',
);

// ---------------------------------------------------------------------------
// Dart Parser
// ---------------------------------------------------------------------------

/**
 * Parses a Dart list of MuseumModel or HistoricalPlaceModel constructors
 * out of the raw file content. Returns an array of plain objects with the
 * extracted fields.
 *
 * Strategy:
 *   1. Find every constructor call boundary (MuseumModel( ... ) or
 *      HistoricalPlaceModel( ... )).
 *   2. Inside each block, extract named parameters:
 *      - museums / description / ticketPrice  → Dart map literals
 *      - latitude / longitude                 → numeric
 *      - photos                               → list of strings (ignored for DB)
 *      - isHistorical                         → boolean (museums only)
 */

function parseDartFile(content, modelName) {
  const entries = [];
  const modelPattern = new RegExp(`${modelName}\\(`, 'g');
  let match;

  while ((match = modelPattern.exec(content)) !== null) {
    const startIdx = match.index + match[0].length;
    const blockEnd = findMatchingParen(content, startIdx - 1);
    if (blockEnd === -1) continue;

    const block = content.slice(startIdx, blockEnd);
    const entry = parseConstructorBlock(block);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

/**
 * Find the index of the closing ')' that matches the '(' at `openIdx`.
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

    // Handle triple-quoted strings first
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

    // Handle single-quoted strings
    if (c === "'" && !inDoubleQuote && !inTripleSingle && !inTripleDouble) {
      // Check it's not an escaped quote
      if (i > 0 && str[i - 1] === '\\') continue;
      inSingleQuote = !inSingleQuote;
      continue;
    }

    // Handle double-quoted strings
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

/**
 * Parse a constructor body block (the text between MuseumModel( and the
 * matching ) ) and extract named parameters.
 */
function parseConstructorBlock(block) {
  const result = {
    museums: null,
    description: null,
    ticketPrice: null,
    latitude: null,
    longitude: null,
    isHistorical: false,
  };

  // Extract 'museums:' map
  result.museums = extractDartMap(block, 'museums');

  // Extract 'description:' map
  result.description = extractDartMap(block, 'description');

  // Extract latitude/longitude
  result.latitude = extractNumber(block, 'latitude');
  result.longitude = extractNumber(block, 'longitude');

  // Extract ticketPrice (it's a simple string in data.dart)
  result.ticketPrice = extractSimpleString(block, 'ticketPrice');

  // Extract isHistorical
  const historicalMatch = block.match(/isHistorical:\s*(true|false)/);
  if (historicalMatch) {
    result.isHistorical = historicalMatch[1] === 'true';
  }

  return result;
}

/**
 * Extract a Dart Map<String, String> literal for a given named parameter.
 * Handles both single-line and multi-line maps with triple-quoted strings.
 */
function extractDartMap(block, paramName) {
  // Find "paramName:" followed by optional whitespace and "{"
  const pattern = new RegExp(`${paramName}:\\s*\\{`);
  const match = pattern.exec(block);
  if (!match) return null;

  // Find the matching closing brace
  const braceStart = match.index + match[0].length - 1;
  const braceEnd = findMatchingBrace(block, braceStart);
  if (braceEnd === -1) return null;

  const mapContent = block.slice(braceStart + 1, braceEnd);

  // Parse the key-value pairs from the map content
  return parseDartMapContent(mapContent);
}

/**
 * Find the matching '}' for the '{' at the given index.
 */
function findMatchingBrace(str, openIdx) {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTripleSingle = false;
  let inTripleDouble = false;

  for (let i = openIdx; i < str.length; i++) {
    const c = str[i];
    const next3 = str.slice(i, i + 3);

    // Triple-quoted strings
    if (!inDoubleQuote && !inSingleQuote && !inTripleDouble) {
      if (next3 === "'''" && !inTripleSingle) {
        inTripleSingle = true;
        i += 2;
        continue;
      }
      if (next3 === "'''" && inTripleSingle) {
        inTripleSingle = false;
        i += 2;
        continue;
      }
    }

    if (!inSingleQuote && !inDoubleQuote && !inTripleSingle) {
      if (next3 === '"""' && !inTripleDouble) {
        inTripleDouble = true;
        i += 2;
        continue;
      }
      if (next3 === '"""' && inTripleDouble) {
        inTripleDouble = false;
        i += 2;
        continue;
      }
    }

    if (inTripleSingle || inTripleDouble) continue;

    if (c === "'" && !inDoubleQuote) {
      if (i > 0 && str[i - 1] === '\\') continue;
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (c === '"' && !inSingleQuote) {
      if (i > 0 && str[i - 1] === '\\') continue;
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (inSingleQuote || inDoubleQuote) continue;

    if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

/**
 * Parse key-value pairs out of the inner content of a Dart map literal.
 * Keys are 'uz', 'ru', 'en' quoted strings; values are single, double,
 * or triple-quoted strings.
 */
function parseDartMapContent(content) {
  const result = {};
  // We'll scan through looking for key patterns
  const keyPattern = /['"](\w+)['"]\s*:\s*/g;
  let keyMatch;

  while ((keyMatch = keyPattern.exec(content)) !== null) {
    const key = keyMatch[1];
    const valueStart = keyMatch.index + keyMatch[0].length;
    const value = extractStringValue(content, valueStart);
    if (value !== null) {
      result[key] = value.trim();
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

/**
 * Extract a Dart string value starting at the given position.
 * Handles triple-double """, triple-single ''', regular single ' and double ".
 */
function extractStringValue(str, startIdx) {
  // Skip whitespace
  let i = startIdx;
  while (i < str.length && /\s/.test(str[i])) i++;

  const next3 = str.slice(i, i + 3);

  if (next3 === '"""') {
    // Triple double-quoted
    const endIdx = str.indexOf('"""', i + 3);
    if (endIdx === -1) return null;
    return str.slice(i + 3, endIdx);
  }

  if (next3 === "'''") {
    // Triple single-quoted
    const endIdx = str.indexOf("'''", i + 3);
    if (endIdx === -1) return null;
    return str.slice(i + 3, endIdx);
  }

  if (str[i] === '"') {
    // Regular double-quoted — find the unescaped closing "
    return extractRegularString(str, i, '"');
  }

  if (str[i] === "'") {
    // Regular single-quoted — find the unescaped closing '
    return extractRegularString(str, i, "'");
  }

  return null;
}

/**
 * Extract a regular (non-triple) quoted string starting at position i,
 * where str[i] is the opening quote character.
 */
function extractRegularString(str, startIdx, quoteChar) {
  let result = '';
  let i = startIdx + 1;

  while (i < str.length) {
    if (str[i] === '\\' && i + 1 < str.length) {
      result += str[i + 1];
      i += 2;
      continue;
    }
    if (str[i] === quoteChar) {
      return result;
    }
    result += str[i];
    i++;
  }

  return result;
}

/**
 * Extract a numeric value for a named parameter.
 */
function extractNumber(block, paramName) {
  const pattern = new RegExp(`${paramName}:\\s*([\\d.\\-]+)`);
  const match = pattern.exec(block);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return isNaN(num) ? null : num;
}

/**
 * Extract a simple single-quoted string for a named parameter like ticketPrice: '10000'.
 */
function extractSimpleString(block, paramName) {
  const pattern = new RegExp(`${paramName}:\\s*['"]([^'"]*)['"\\s,]`);
  const match = pattern.exec(block);
  if (!match) return null;
  return match[1];
}

// ---------------------------------------------------------------------------
// City Guesser
// ---------------------------------------------------------------------------

/**
 * Attempt to guess the city from the museum/place descriptions or name.
 * Falls back to 'Unknown' if nothing matches.
 */
const CITY_PATTERNS = [
  { regex: /\bташкент/i, city: 'Tashkent' },
  { regex: /\btashkent/i, city: 'Tashkent' },
  { regex: /\btoshkent/i, city: 'Tashkent' },
  { regex: /\bсамарканд/i, city: 'Samarkand' },
  { regex: /\bsamarqand/i, city: 'Samarkand' },
  { regex: /\bsamarkand/i, city: 'Samarkand' },
  { regex: /\bбухар/i, city: 'Bukhara' },
  { regex: /\bbuxor/i, city: 'Bukhara' },
  { regex: /\bbukhara/i, city: 'Bukhara' },
  { regex: /\bхив/i, city: 'Khiva' },
  { regex: /\bxiva/i, city: 'Khiva' },
  { regex: /\bkhiva/i, city: 'Khiva' },
  { regex: /\bнукус/i, city: 'Nukus' },
  { regex: /\bnukus/i, city: 'Nukus' },
  { regex: /\bтермез/i, city: 'Termez' },
  { regex: /\btermiz/i, city: 'Termez' },
  { regex: /\btermez/i, city: 'Termez' },
  { regex: /\bкоканд/i, city: 'Kokand' },
  { regex: /\bqoʻqon/i, city: 'Kokand' },
  { regex: /\bkokand/i, city: 'Kokand' },
  { regex: /\bfergan/i, city: 'Fergana' },
  { regex: /\bферган/i, city: 'Fergana' },
  { regex: /\bfarg'ona/i, city: 'Fergana' },
  { regex: /\bnamangan/i, city: 'Namangan' },
  { regex: /\bнаманган/i, city: 'Namangan' },
  { regex: /\bandij/i, city: 'Andijan' },
  { regex: /\bанди[жш]/i, city: 'Andijan' },
  { regex: /\bqarshi/i, city: 'Qarshi' },
  { regex: /\bкарш/i, city: 'Qarshi' },
  { regex: /\bnavoi/i, city: 'Navoi' },
  { regex: /\bнавои/i, city: 'Navoi' },
  { regex: /\bjizzax/i, city: 'Jizzakh' },
  { regex: /\bджизак/i, city: 'Jizzakh' },
  { regex: /\bguliston/i, city: 'Gulistan' },
  { regex: /\bгулистан/i, city: 'Gulistan' },
  { regex: /\burgench/i, city: 'Urgench' },
  { regex: /\bургенч/i, city: 'Urgench' },
  { regex: /\bshahrisabz/i, city: 'Shahrisabz' },
  { regex: /\bшахрисабз/i, city: 'Shahrisabz' },
  { regex: /\bsurxondaryo/i, city: 'Termez' },
  { regex: /\bсурхандарь/i, city: 'Termez' },
  { regex: /\bxorazm/i, city: 'Urgench' },
  { regex: /\bхорезм/i, city: 'Urgench' },
  { regex: /\bkhorezm/i, city: 'Urgench' },
  { regex: /\bkarakalpak/i, city: 'Nukus' },
  { regex: /\bqoraqalpoq/i, city: 'Nukus' },
  { regex: /\bкаракалпак/i, city: 'Nukus' },
  { regex: /\bqashqadaryo/i, city: 'Qarshi' },
  { regex: /\bкашкадарь/i, city: 'Qarshi' },
  { regex: /\bshurchi/i, city: 'Termez' },
  { regex: /\bdenov/i, city: 'Denov' },
  { regex: /\bденов/i, city: 'Denov' },
  { regex: /\bdenau/i, city: 'Denov' },
  { regex: /\bkumkurgan/i, city: 'Termez' },
  { regex: /\bкумкурган/i, city: 'Termez' },
  { regex: /\bqumqoʻrgʻon/i, city: 'Termez' },
  { regex: /\bchilanzar/i, city: 'Tashkent' },
  { regex: /\bчиланзар/i, city: 'Tashkent' },
  { regex: /\byakkasaroy/i, city: 'Tashkent' },
  { regex: /\bяккасарай/i, city: 'Tashkent' },
  { regex: /\bpaxtachi/i, city: 'Denov' },
  { regex: /\bпахтачи/i, city: 'Denov' },
];

/**
 * Guess city from lat/lng coordinates. Rough bounding boxes for major cities.
 */
const CITY_GEO = [
  { city: 'Tashkent', latMin: 41.2, latMax: 41.4, lngMin: 69.1, lngMax: 69.4 },
  { city: 'Samarkand', latMin: 39.6, latMax: 39.7, lngMin: 66.9, lngMax: 67.1 },
  { city: 'Bukhara', latMin: 39.7, latMax: 39.8, lngMin: 64.3, lngMax: 64.5 },
  { city: 'Khiva', latMin: 41.3, latMax: 41.4, lngMin: 60.6, lngMax: 60.7 },
  { city: 'Nukus', latMin: 42.4, latMax: 42.5, lngMin: 59.5, lngMax: 59.7 },
  { city: 'Termez', latMin: 37.1, latMax: 37.4, lngMin: 67.0, lngMax: 67.4 },
  { city: 'Kokand', latMin: 40.5, latMax: 40.6, lngMin: 70.9, lngMax: 71.0 },
  { city: 'Fergana', latMin: 40.3, latMax: 40.4, lngMin: 71.7, lngMax: 71.9 },
  { city: 'Shahrisabz', latMin: 39.0, latMax: 39.1, lngMin: 66.8, lngMax: 66.9 },
  { city: 'Qarshi', latMin: 38.8, latMax: 38.9, lngMin: 65.7, lngMax: 65.9 },
  { city: 'Navoi', latMin: 40.0, latMax: 40.2, lngMin: 65.3, lngMax: 65.5 },
  { city: 'Andijan', latMin: 40.7, latMax: 40.8, lngMin: 72.3, lngMax: 72.4 },
  { city: 'Namangan', latMin: 40.9, latMax: 41.1, lngMin: 71.6, lngMax: 71.7 },
  { city: 'Jizzakh', latMin: 40.1, latMax: 40.2, lngMin: 67.8, lngMax: 67.9 },
  { city: 'Urgench', latMin: 41.5, latMax: 41.6, lngMin: 60.6, lngMax: 60.7 },
  { city: 'Denov', latMin: 38.2, latMax: 38.4, lngMin: 67.8, lngMax: 68.0 },
  { city: 'Gulistan', latMin: 40.4, latMax: 40.6, lngMin: 68.7, lngMax: 68.9 },
];

function guessCity(entry) {
  // First try text matching against name and description
  const texts = [];
  if (entry.museums) {
    texts.push(...Object.values(entry.museums));
  }
  if (entry.description) {
    // Only check first 500 chars of each description to avoid false matches
    for (const val of Object.values(entry.description)) {
      if (typeof val === 'string') {
        texts.push(val.slice(0, 500));
      }
    }
  }

  const combined = texts.join(' ');

  for (const { regex, city } of CITY_PATTERNS) {
    if (regex.test(combined)) {
      return city;
    }
  }

  // Fallback: try geo coordinates
  if (entry.latitude && entry.longitude && entry.latitude !== 0) {
    for (const geo of CITY_GEO) {
      if (
        entry.latitude >= geo.latMin &&
        entry.latitude <= geo.latMax &&
        entry.longitude >= geo.lngMin &&
        entry.longitude <= geo.lngMax
      ) {
        return geo.city;
      }
    }
  }

  return 'Unknown';
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
  // API may wrap response in { data: { ... } }
  const data = responseBody.data || responseBody;
  accessToken = data.accessToken;
  console.log(`Logged in successfully as ${data.admin.email} (${data.admin.role})`);
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

  // API wraps successful responses in { data: { ... } }
  const unwrapped = json.data !== undefined ? json.data : json;

  return { status: res.status, data: unwrapped };
}

// ---------------------------------------------------------------------------
// Multilingual field helpers
// ---------------------------------------------------------------------------

/**
 * Ensure a multilingual map has all 3 keys (uz, ru, en).
 * Some museums only have 'uz' in their name map.
 */
function ensureTrilingualName(map) {
  if (!map) return { uz: '', ru: '', en: '' };

  return {
    uz: (map.uz || map.ru || map.en || '').trim(),
    ru: (map.ru || map.uz || map.en || '').trim(),
    en: (map.en || map.uz || map.ru || '').trim(),
  };
}

function ensureTrilingualDescription(map) {
  if (!map) return { uz: 'N/A', ru: 'N/A', en: 'N/A' };

  const uz = (map.uz || '').trim();
  const ru = (map.ru || '').trim();
  const en = (map.en || '').trim();

  // API requires @IsNotEmpty() for all 3 languages.
  // If any language is missing, fill from another available language.
  const fallback = uz || ru || en || 'N/A';

  return {
    uz: uz || fallback,
    ru: ru || fallback,
    en: en || fallback,
  };
}

/**
 * Build a trilingual ticketPrice object. Original data has a flat string
 * (e.g. '10000') or null. We produce {"uz": "10000 so'm", "ru": "10000 сум", "en": "10000 UZS"}.
 */
function buildTicketPrice(price) {
  if (!price || price === '0') {
    return {
      uz: "Bepul",
      ru: "Бесплатно",
      en: "Free",
    };
  }

  const formatted = Number(price).toLocaleString('en-US').replace(/,/g, ' ');

  return {
    uz: `${formatted} so'm`,
    ru: `${formatted} сум`,
    en: `${formatted} UZS`,
  };
}

// ---------------------------------------------------------------------------
// Import Logic
// ---------------------------------------------------------------------------

async function importMuseums(entries) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Importing ${entries.length} museums...`);
  console.log('='.repeat(60));

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const legacyId = i + 1;

    // Skip entries with empty/whitespace-only names
    const uzName = entry.museums?.uz || '';
    if (!uzName.trim()) {
      console.log(`  [${legacyId}] SKIP — empty name`);
      skipped++;
      continue;
    }

    // Skip entries with zero coordinates (likely placeholder/empty)
    if (entry.latitude === 0 && entry.longitude === 0) {
      console.log(`  [${legacyId}] SKIP — zero coordinates (placeholder entry): "${uzName.trim()}"`);
      skipped++;
      continue;
    }

    const name = ensureTrilingualName(entry.museums);
    const description = ensureTrilingualDescription(entry.description);
    const ticketPrice = buildTicketPrice(entry.ticketPrice);
    const city = guessCity(entry);

    const body = {
      legacyId,
      name,
      description,
      ticketPrice,
      latitude: entry.latitude || 0,
      longitude: entry.longitude || 0,
      city,
      isPublished: true,
    };

    const { status, data } = await apiPost('/admin/museums', body);

    if (status === 201) {
      created++;
      console.log(
        `  [${legacyId}] OK — "${name.uz}" (city: ${city}, id: ${data.id})`,
      );
    } else if (status === 409) {
      skipped++;
      console.log(
        `  [${legacyId}] SKIP (already exists) — "${name.uz}"`,
      );
    } else {
      failed++;
      console.error(
        `  [${legacyId}] FAIL (${status}) — "${name.uz}"`,
        JSON.stringify(data).slice(0, 300),
      );
      // Small delay on error to avoid hammering
      await sleep(200);
    }

    // Small delay between requests to be gentle
    if (i % 10 === 9) {
      await sleep(100);
    }
  }

  console.log(`\nMuseums summary: ${created} created, ${skipped} skipped, ${failed} failed`);
  return { created, skipped, failed };
}

async function importHistoricalPlaces(entries) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Importing ${entries.length} historical places...`);
  console.log('='.repeat(60));

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const legacyId = i + 1;

    // Skip entries with empty names
    const uzName = entry.museums?.uz || entry.museums?.en || '';
    if (!uzName.trim()) {
      console.log(`  [${legacyId}] SKIP — empty name`);
      skipped++;
      continue;
    }

    // Skip entries with zero coordinates
    if (
      (entry.latitude === 0 || entry.latitude === null) &&
      (entry.longitude === 0 || entry.longitude === null)
    ) {
      console.log(`  [${legacyId}] SKIP — zero coordinates: "${uzName.trim()}"`);
      skipped++;
      continue;
    }

    const name = ensureTrilingualName(entry.museums);
    const description = ensureTrilingualDescription(entry.description);
    const ticketPrice = buildTicketPrice(entry.ticketPrice);
    const city = guessCity(entry);

    const body = {
      legacyId,
      name,
      description,
      ticketPrice,
      latitude: entry.latitude || 0,
      longitude: entry.longitude || 0,
      city,
      isPublished: true,
    };

    const { status, data } = await apiPost('/admin/historical-places', body);

    if (status === 201) {
      created++;
      console.log(
        `  [${legacyId}] OK — "${name.uz}" (city: ${city}, id: ${data.id})`,
      );
    } else if (status === 409) {
      skipped++;
      console.log(
        `  [${legacyId}] SKIP (already exists) — "${name.uz}"`,
      );
    } else {
      failed++;
      console.error(
        `  [${legacyId}] FAIL (${status}) — "${name.uz}"`,
        JSON.stringify(data).slice(0, 300),
      );
      await sleep(200);
    }

    if (i % 10 === 9) {
      await sleep(100);
    }
  }

  console.log(
    `\nHistorical places summary: ${created} created, ${skipped} skipped, ${failed} failed`,
  );
  return { created, skipped, failed };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('========================================');
  console.log('  Muzeylari Data Import Script');
  console.log('========================================');
  console.log(`API: ${API_BASE}`);
  console.log(`Admin: ${ADMIN_EMAIL}`);

  // 1. Read and parse data files
  console.log('\n--- Parsing Dart data files ---');

  let museumContent;
  try {
    museumContent = readFileSync(MUSEUM_DATA_PATH, 'utf-8');
    console.log(`Read ${MUSEUM_DATA_PATH} (${museumContent.length} chars)`);
  } catch (err) {
    console.error(`Cannot read museum data file: ${err.message}`);
    process.exit(1);
  }

  let historicalContent;
  try {
    historicalContent = readFileSync(HISTORICAL_DATA_PATH, 'utf-8');
    console.log(`Read ${HISTORICAL_DATA_PATH} (${historicalContent.length} chars)`);
  } catch (err) {
    console.error(`Cannot read historical data file: ${err.message}`);
    process.exit(1);
  }

  const museums = parseDartFile(museumContent, 'MuseumModel');
  console.log(`Parsed ${museums.length} museums`);

  const historicalPlaces = parseDartFile(historicalContent, 'HistoricalPlaceModel');
  console.log(`Parsed ${historicalPlaces.length} historical places`);

  // Quick validation: print first few entries
  if (museums.length > 0) {
    const first = museums[0];
    console.log('\nFirst museum sample:');
    console.log(`  Name (uz): ${first.museums?.uz || 'N/A'}`);
    console.log(`  Lat/Lng: ${first.latitude}, ${first.longitude}`);
    console.log(`  TicketPrice: ${first.ticketPrice || 'N/A'}`);
    console.log(`  Description keys: ${first.description ? Object.keys(first.description).join(', ') : 'none'}`);
    console.log(`  Description (uz) preview: ${(first.description?.uz || '').slice(0, 80)}...`);
  }

  if (historicalPlaces.length > 0) {
    const first = historicalPlaces[0];
    console.log('\nFirst historical place sample:');
    console.log(`  Name (uz): ${first.museums?.uz || 'N/A'}`);
    console.log(`  Lat/Lng: ${first.latitude}, ${first.longitude}`);
    console.log(`  Description keys: ${first.description ? Object.keys(first.description).join(', ') : 'none'}`);
  }

  // 2. Login to admin API
  await login();

  // 3. Import museums
  const museumResult = await importMuseums(museums);

  // 4. Import historical places
  const historicalResult = await importHistoricalPlaces(historicalPlaces);

  // 5. Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('  IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Museums:           ${museumResult.created} created, ${museumResult.skipped} skipped, ${museumResult.failed} failed`);
  console.log(`Historical places: ${historicalResult.created} created, ${historicalResult.skipped} skipped, ${historicalResult.failed} failed`);
  console.log(`Total created:     ${museumResult.created + historicalResult.created}`);

  if (museumResult.failed > 0 || historicalResult.failed > 0) {
    console.log('\nSome imports failed. Check the error logs above.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});

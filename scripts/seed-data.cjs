/**
 * seed-data.cjs
 *
 * Parses hardcoded Dart data files from the Flutter app and inserts
 * museums + historical places directly into PostgreSQL via Prisma.
 *
 * Does NOT require the API server to be running.
 *
 * Usage:
 *   DATABASE_URL=postgresql://muzeylari:muzeylari_secret@localhost:5432/muzeylari \
 *     node scripts/seed-data.cjs
 *
 * Or from repo root (uses apps/api/.env automatically):
 *   node scripts/seed-data.cjs
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Load DATABASE_URL from apps/api/.env if not already set
// ---------------------------------------------------------------------------
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
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
    console.log(`Loaded DATABASE_URL from ${envPath}`);
  }
}

// Prisma client is installed at the monorepo root
const { PrismaClient } = require(
  path.resolve(__dirname, '../node_modules/@prisma/client'),
);

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Paths to Flutter data files
// ---------------------------------------------------------------------------
const MUSEUM_DATA_PATH = path.resolve(
  __dirname,
  '../../Projects/ozbekiston_museylari/lib/core/data/data.dart',
);
const HISTORICAL_DATA_PATH = path.resolve(
  __dirname,
  '../../Projects/ozbekiston_museylari/lib/core/data/data_historical.dart',
);

// ---------------------------------------------------------------------------
// Dart Parser (adapted from import-data.js)
// ---------------------------------------------------------------------------

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

function parseConstructorBlock(block) {
  const result = {
    museums: null,
    description: null,
    ticketPrice: null,
    latitude: null,
    longitude: null,
    isHistorical: false,
  };

  result.museums = extractDartMap(block, 'museums');
  result.description = extractDartMap(block, 'description');
  result.latitude = extractNumber(block, 'latitude');
  result.longitude = extractNumber(block, 'longitude');
  result.ticketPrice = extractSimpleString(block, 'ticketPrice');

  const historicalMatch = block.match(/isHistorical:\s*(true|false)/);
  if (historicalMatch) {
    result.isHistorical = historicalMatch[1] === 'true';
  }

  return result;
}

function extractDartMap(block, paramName) {
  const pattern = new RegExp(`${paramName}:\\s*\\{`);
  const match = pattern.exec(block);
  if (!match) return null;

  const braceStart = match.index + match[0].length - 1;
  const braceEnd = findMatchingBrace(block, braceStart);
  if (braceEnd === -1) return null;

  const mapContent = block.slice(braceStart + 1, braceEnd);
  return parseDartMapContent(mapContent);
}

function findMatchingBrace(str, openIdx) {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTripleSingle = false;
  let inTripleDouble = false;

  for (let i = openIdx; i < str.length; i++) {
    const c = str[i];
    const next3 = str.slice(i, i + 3);

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

function parseDartMapContent(content) {
  const result = {};
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

function extractStringValue(str, startIdx) {
  let i = startIdx;
  while (i < str.length && /\s/.test(str[i])) i++;

  const next3 = str.slice(i, i + 3);

  if (next3 === '"""') {
    const endIdx = str.indexOf('"""', i + 3);
    if (endIdx === -1) return null;
    return str.slice(i + 3, endIdx);
  }

  if (next3 === "'''") {
    const endIdx = str.indexOf("'''", i + 3);
    if (endIdx === -1) return null;
    return str.slice(i + 3, endIdx);
  }

  if (str[i] === '"') {
    return extractRegularString(str, i, '"');
  }

  if (str[i] === "'") {
    return extractRegularString(str, i, "'");
  }

  return null;
}

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

function extractNumber(block, paramName) {
  const pattern = new RegExp(`${paramName}:\\s*([\\d.\\-]+)`);
  const match = pattern.exec(block);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return isNaN(num) ? null : num;
}

function extractSimpleString(block, paramName) {
  const pattern = new RegExp(`${paramName}:\\s*['"]([^'"]*)['"\\s,]`);
  const match = pattern.exec(block);
  if (!match) return null;
  return match[1];
}

// ---------------------------------------------------------------------------
// City Guesser
// ---------------------------------------------------------------------------

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
  { regex: /\bqo[ʻ‘’']qon/i, city: 'Kokand' },
  { regex: /\bkokand/i, city: 'Kokand' },
  { regex: /\bfergan/i, city: 'Fergana' },
  { regex: /\bферган/i, city: 'Fergana' },
  { regex: /\bfarg[ʻ‘’']ona/i, city: 'Fergana' },
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
  { regex: /\bchilanzar/i, city: 'Tashkent' },
  { regex: /\bчиланзар/i, city: 'Tashkent' },
  { regex: /\byakkasaroy/i, city: 'Tashkent' },
  { regex: /\bяккасарай/i, city: 'Tashkent' },
  { regex: /\bpaxtachi/i, city: 'Denov' },
  { regex: /\bпахтачи/i, city: 'Denov' },
  { regex: /\bchust/i, city: 'Namangan' },
  { regex: /\bчуст/i, city: 'Namangan' },
  { regex: /\bkattaqo[ʻ‘’']rg[ʻ‘’']on/i, city: 'Samarkand' },
  { regex: /\bishtixon/i, city: 'Samarkand' },
  { regex: /\bishtikhon/i, city: 'Samarkand' },
];

const CITY_GEO = [
  { city: 'Tashkent', latMin: 41.2, latMax: 41.45, lngMin: 69.1, lngMax: 69.4 },
  { city: 'Samarkand', latMin: 39.6, latMax: 39.75, lngMin: 66.85, lngMax: 67.15 },
  { city: 'Bukhara', latMin: 39.7, latMax: 39.8, lngMin: 64.3, lngMax: 64.5 },
  { city: 'Khiva', latMin: 41.35, latMax: 41.42, lngMin: 60.6, lngMax: 60.7 },
  { city: 'Nukus', latMin: 42.4, latMax: 42.55, lngMin: 59.5, lngMax: 59.7 },
  { city: 'Termez', latMin: 37.1, latMax: 37.4, lngMin: 67.0, lngMax: 67.4 },
  { city: 'Kokand', latMin: 40.5, latMax: 40.6, lngMin: 70.9, lngMax: 71.0 },
  { city: 'Fergana', latMin: 40.3, latMax: 40.4, lngMin: 71.7, lngMax: 71.9 },
  { city: 'Shahrisabz', latMin: 39.0, latMax: 39.15, lngMin: 66.75, lngMax: 66.95 },
  { city: 'Qarshi', latMin: 38.8, latMax: 38.9, lngMin: 65.7, lngMax: 65.9 },
  { city: 'Navoi', latMin: 40.0, latMax: 40.2, lngMin: 65.3, lngMax: 65.5 },
  { city: 'Andijan', latMin: 40.7, latMax: 40.85, lngMin: 72.3, lngMax: 72.4 },
  { city: 'Namangan', latMin: 40.9, latMax: 41.1, lngMin: 71.5, lngMax: 71.7 },
  { city: 'Jizzakh', latMin: 40.1, latMax: 40.2, lngMin: 67.8, lngMax: 67.9 },
  { city: 'Urgench', latMin: 41.5, latMax: 41.6, lngMin: 60.6, lngMax: 60.7 },
  { city: 'Denov', latMin: 38.2, latMax: 38.4, lngMin: 67.8, lngMax: 68.0 },
  { city: 'Gulistan', latMin: 40.4, latMax: 40.6, lngMin: 68.7, lngMax: 68.9 },
];

function guessCity(entry) {
  const texts = [];
  if (entry.museums) {
    texts.push(...Object.values(entry.museums));
  }
  if (entry.description) {
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
// Region mapping (city -> region slug)
// ---------------------------------------------------------------------------

const CITY_TO_REGION_SLUG = {
  Tashkent: 'toshkent-shahar',
  Samarkand: 'samarqand',
  Bukhara: 'buxoro',
  Khiva: 'xorazm',
  Urgench: 'xorazm',
  Nukus: 'qoraqalpogiston',
  Termez: 'surxondaryo',
  Kokand: 'fargona',
  Fergana: 'fargona',
  Namangan: 'namangan',
  Andijan: 'andijon',
  Qarshi: 'qashqadaryo',
  Navoi: 'navoiy',
  Jizzakh: 'jizzax',
  Gulistan: 'sirdaryo',
  Denov: 'surxondaryo',
  Shahrisabz: 'qashqadaryo',
};

// Museum-name-based overrides for region (more precise than city guesser)
const MUSEUM_REGION_OVERRIDES = [
  { pattern: 'Ichan Qal', region: 'xorazm' },
  { pattern: 'maqomchilar', region: 'xorazm' },
  { pattern: 'Navoiy uy-muzeyi', region: 'xorazm' },
  { pattern: 'Al-Xorazmiy', region: 'xorazm' },
  { pattern: 'Allomalar', region: 'xorazm' },
  { pattern: 'Avesto', region: 'xorazm' },
  { pattern: "Xorazm San'ati", region: 'xorazm' },
  { pattern: 'Ogahiy', region: 'xorazm' },
  { pattern: 'Boltayev', region: 'xorazm' },
  { pattern: 'Namangan tarixi', region: 'namangan' },
  { pattern: 'Mashrab', region: 'namangan' },
  { pattern: 'Chust', region: 'namangan' },
  { pattern: 'Pop Arxeologiya', region: 'namangan' },
  { pattern: 'Axsikent', region: 'namangan' },
  { pattern: 'Kamoliddin Rahimov', region: 'namangan' },
  { pattern: 'Samarqand badiiy', region: 'samarqand' },
  { pattern: 'Samarqand universiteti', region: 'samarqand' },
  { pattern: 'Samarqand tarixi', region: 'samarqand' },
  { pattern: 'Afrosiyob', region: 'samarqand' },
  { pattern: "Ulug'bek rasadxonasi", region: 'samarqand' },
  { pattern: 'Sadriddin Ayniy', region: 'samarqand' },
  { pattern: "Kattaqo'rg'on", region: 'samarqand' },
  { pattern: 'Ishtixon', region: 'samarqand' },
  { pattern: 'Jumanbulbul', region: 'samarqand' },
  { pattern: 'Abdurasulov', region: 'samarqand' },
  { pattern: 'Behbudiy', region: 'samarqand' },
  { pattern: 'Paxtachi', region: 'samarqand' },
  { pattern: 'Surxondaryo', region: 'surxondaryo' },
  { pattern: 'Termiz Arxeologiya', region: 'surxondaryo' },
  { pattern: 'Termiziylar', region: 'surxondaryo' },
  { pattern: "Chag'aniyon", region: 'surxondaryo' },
  { pattern: "Nazar To'rayev", region: 'surxondaryo' },
  { pattern: 'Fayoztepa', region: 'surxondaryo' },
  { pattern: 'Kampirtepa', region: 'surxondaryo' },
  { pattern: 'Dalvarzintepa', region: 'surxondaryo' },
  { pattern: 'Sharof Rashidov', region: 'jizzax' },
  { pattern: 'Hamid Olimjon', region: 'jizzax' },
  { pattern: 'Jizzax tarixi', region: 'jizzax' },
];

// ---------------------------------------------------------------------------
// Multilingual field helpers
// ---------------------------------------------------------------------------

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
  const fallback = uz || ru || en || 'N/A';

  return {
    uz: uz || fallback,
    ru: ru || fallback,
    en: en || fallback,
  };
}

function buildTicketPrice(price) {
  if (!price || price === '0') {
    return {
      uz: 'Bepul',
      ru: 'Бесплатно',
      en: 'Free',
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
// Resolve region for an entry
// ---------------------------------------------------------------------------

function resolveRegionSlug(entry) {
  const nameUz = entry.museums?.uz || '';

  // First check museum-name overrides
  for (const { pattern, region } of MUSEUM_REGION_OVERRIDES) {
    if (nameUz.includes(pattern)) {
      return region;
    }
  }

  // Fall back to city -> region mapping
  const city = guessCity(entry);
  return { slug: CITY_TO_REGION_SLUG[city] || null, city };
}

// ---------------------------------------------------------------------------
// Main import logic
// ---------------------------------------------------------------------------

async function seedMuseums(entries, regionSlugToId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Seeding ${entries.length} museums...`);
  console.log('='.repeat(60));

  let created = 0;
  let skipped = 0;
  let skippedEmpty = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const legacyId = i + 1;

    // Skip entries with empty/whitespace-only names
    const uzName = (entry.museums?.uz || '').trim();
    if (!uzName) {
      console.log(`  [${legacyId}] SKIP -- empty name`);
      skippedEmpty++;
      continue;
    }

    // Skip entries with zero coordinates (placeholder/empty entries)
    if (
      (entry.latitude === 0 || entry.latitude === null) &&
      (entry.longitude === 0 || entry.longitude === null)
    ) {
      console.log(`  [${legacyId}] SKIP -- zero coordinates (placeholder): "${uzName}"`);
      skippedEmpty++;
      continue;
    }

    const name = ensureTrilingualName(entry.museums);
    const description = ensureTrilingualDescription(entry.description);
    const ticketPrice = buildTicketPrice(entry.ticketPrice);
    const city = guessCity(entry);

    // Resolve region
    let regionSlug = null;
    for (const { pattern, region } of MUSEUM_REGION_OVERRIDES) {
      if (uzName.includes(pattern)) {
        regionSlug = region;
        break;
      }
    }
    if (!regionSlug) {
      regionSlug = CITY_TO_REGION_SLUG[city] || null;
    }
    const regionId = regionSlug ? regionSlugToId[regionSlug] || null : null;

    // Check if already exists by legacyId
    const existing = await prisma.museum.findUnique({
      where: { legacyId },
    });

    if (existing) {
      console.log(`  [${legacyId}] SKIP (already exists) -- "${name.uz}"`);
      skipped++;
      continue;
    }

    await prisma.museum.create({
      data: {
        legacyId,
        name,
        description,
        ticketPrice,
        latitude: entry.latitude || 0,
        longitude: entry.longitude || 0,
        city,
        regionId,
        isPublished: true,
      },
    });

    created++;
    console.log(
      `  [${legacyId}] OK -- "${name.uz}" (city: ${city}, region: ${regionSlug || 'none'})`,
    );
  }

  console.log(
    `\nMuseums: ${created} created, ${skipped} already existed, ${skippedEmpty} skipped (empty/placeholder)`,
  );
  return { created, skipped, skippedEmpty };
}

async function seedHistoricalPlaces(entries, regionSlugToId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Seeding ${entries.length} historical places...`);
  console.log('='.repeat(60));

  let created = 0;
  let skipped = 0;
  let skippedEmpty = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const legacyId = i + 1;

    // Skip entries with empty names
    const uzName = (entry.museums?.uz || entry.museums?.en || '').trim();
    if (!uzName) {
      console.log(`  [${legacyId}] SKIP -- empty name`);
      skippedEmpty++;
      continue;
    }

    // Skip entries with zero/null coordinates
    if (
      (entry.latitude === 0 || entry.latitude === null) &&
      (entry.longitude === 0 || entry.longitude === null)
    ) {
      console.log(`  [${legacyId}] SKIP -- zero coordinates: "${uzName}"`);
      skippedEmpty++;
      continue;
    }

    const name = ensureTrilingualName(entry.museums);
    const description = ensureTrilingualDescription(entry.description);
    const ticketPrice = buildTicketPrice(entry.ticketPrice);
    const city = guessCity(entry);

    // Resolve region
    let regionSlug = null;
    for (const { pattern, region } of MUSEUM_REGION_OVERRIDES) {
      if (uzName.includes(pattern)) {
        regionSlug = region;
        break;
      }
    }
    if (!regionSlug) {
      regionSlug = CITY_TO_REGION_SLUG[city] || null;
    }
    const regionId = regionSlug ? regionSlugToId[regionSlug] || null : null;

    // Check if already exists by legacyId
    const existing = await prisma.historicalPlace.findUnique({
      where: { legacyId },
    });

    if (existing) {
      console.log(`  [${legacyId}] SKIP (already exists) -- "${name.uz}"`);
      skipped++;
      continue;
    }

    await prisma.historicalPlace.create({
      data: {
        legacyId,
        name,
        description,
        ticketPrice,
        latitude: entry.latitude || 0,
        longitude: entry.longitude || 0,
        city,
        regionId,
        isPublished: true,
      },
    });

    created++;
    console.log(
      `  [${legacyId}] OK -- "${name.uz}" (city: ${city}, region: ${regionSlug || 'none'})`,
    );
  }

  console.log(
    `\nHistorical places: ${created} created, ${skipped} already existed, ${skippedEmpty} skipped (empty/placeholder)`,
  );
  return { created, skipped, skippedEmpty };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('========================================');
  console.log('  Muzeylari Data Seed Script (Prisma)');
  console.log('========================================');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`);

  // 1. Read and parse Dart data files
  console.log('\n--- Parsing Dart data files ---');

  let museumContent;
  try {
    museumContent = fs.readFileSync(MUSEUM_DATA_PATH, 'utf-8');
    console.log(`Read ${MUSEUM_DATA_PATH} (${museumContent.length} chars)`);
  } catch (err) {
    console.error(`Cannot read museum data file: ${err.message}`);
    console.error(`Expected at: ${MUSEUM_DATA_PATH}`);
    process.exit(1);
  }

  let historicalContent;
  try {
    historicalContent = fs.readFileSync(HISTORICAL_DATA_PATH, 'utf-8');
    console.log(`Read ${HISTORICAL_DATA_PATH} (${historicalContent.length} chars)`);
  } catch (err) {
    console.error(`Cannot read historical data file: ${err.message}`);
    console.error(`Expected at: ${HISTORICAL_DATA_PATH}`);
    process.exit(1);
  }

  const museums = parseDartFile(museumContent, 'MuseumModel');
  console.log(`Parsed ${museums.length} museums`);

  const historicalPlaces = parseDartFile(historicalContent, 'HistoricalPlaceModel');
  console.log(`Parsed ${historicalPlaces.length} historical places`);

  // Quick validation
  if (museums.length > 0) {
    const first = museums[0];
    console.log('\nFirst museum sample:');
    console.log(`  Name (uz): ${first.museums?.uz || 'N/A'}`);
    console.log(`  Lat/Lng: ${first.latitude}, ${first.longitude}`);
    console.log(`  TicketPrice: ${first.ticketPrice || 'N/A'}`);
    console.log(`  Description keys: ${first.description ? Object.keys(first.description).join(', ') : 'none'}`);
  }

  if (historicalPlaces.length > 0) {
    const first = historicalPlaces[0];
    console.log('\nFirst historical place sample:');
    console.log(`  Name (uz): ${first.museums?.uz || first.museums?.en || 'N/A'}`);
    console.log(`  Lat/Lng: ${first.latitude}, ${first.longitude}`);
    console.log(`  Description keys: ${first.description ? Object.keys(first.description).join(', ') : 'none'}`);
  }

  // 2. Load region slug -> id map
  console.log('\n--- Loading regions ---');
  const allRegions = await prisma.region.findMany();
  if (allRegions.length === 0) {
    console.error(
      'No regions found in database. Run seed-regions.cjs first:\n' +
        '  node scripts/seed-regions.cjs',
    );
    process.exit(1);
  }

  const regionSlugToId = {};
  for (const r of allRegions) {
    regionSlugToId[r.slug] = r.id;
  }
  console.log(`Loaded ${allRegions.length} regions: ${Object.keys(regionSlugToId).join(', ')}`);

  // 3. Seed museums
  const museumResult = await seedMuseums(museums, regionSlugToId);

  // 4. Seed historical places
  const historicalResult = await seedHistoricalPlaces(historicalPlaces, regionSlugToId);

  // 5. Final counts from database
  const museumCount = await prisma.museum.count({ where: { deletedAt: null } });
  const historicalCount = await prisma.historicalPlace.count({
    where: { deletedAt: null },
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log('  SEED COMPLETE');
  console.log('='.repeat(60));
  console.log(`Museums:           ${museumResult.created} created, ${museumResult.skipped} already existed, ${museumResult.skippedEmpty} skipped`);
  console.log(`Historical places: ${historicalResult.created} created, ${historicalResult.skipped} already existed, ${historicalResult.skippedEmpty} skipped`);
  console.log(`\nTotal in database: ${museumCount} museums, ${historicalCount} historical places`);
}

main()
  .catch((e) => {
    console.error('\nFatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Seed script: creates all regions (viloyatlar) and assigns museums to them
 * by matching museum names.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... node scripts/seed-regions.js
 *
 * Or from apps/api:
 *   node ../../scripts/seed-regions.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// All 14 regions of Uzbekistan
const REGIONS = [
  {
    slug: 'toshkent-shahar',
    orderIdx: 1,
    name: {
      uz: 'Toshkent shahri',
      ru: 'город Ташкент',
      en: 'Tashkent City',
    },
  },
  {
    slug: 'toshkent',
    orderIdx: 2,
    name: {
      uz: 'Toshkent viloyati',
      ru: 'Ташкентская область',
      en: 'Tashkent Region',
    },
  },
  {
    slug: 'andijon',
    orderIdx: 3,
    name: {
      uz: 'Andijon viloyati',
      ru: 'Андижанская область',
      en: 'Andijan Region',
    },
  },
  {
    slug: 'buxoro',
    orderIdx: 4,
    name: {
      uz: 'Buxoro viloyati',
      ru: 'Бухарская область',
      en: 'Bukhara Region',
    },
  },
  {
    slug: 'fargona',
    orderIdx: 5,
    name: {
      uz: "Farg'ona viloyati",
      ru: 'Ферганская область',
      en: 'Fergana Region',
    },
  },
  {
    slug: 'jizzax',
    orderIdx: 6,
    name: {
      uz: 'Jizzax viloyati',
      ru: 'Джизакская область',
      en: 'Jizzakh Region',
    },
  },
  {
    slug: 'xorazm',
    orderIdx: 7,
    name: {
      uz: 'Xorazm viloyati',
      ru: 'Хорезмская область',
      en: 'Khorezm Region',
    },
  },
  {
    slug: 'namangan',
    orderIdx: 8,
    name: {
      uz: 'Namangan viloyati',
      ru: 'Наманганская область',
      en: 'Namangan Region',
    },
  },
  {
    slug: 'navoiy',
    orderIdx: 9,
    name: {
      uz: 'Navoiy viloyati',
      ru: 'Навоийская область',
      en: 'Navoi Region',
    },
  },
  {
    slug: 'qashqadaryo',
    orderIdx: 10,
    name: {
      uz: 'Qashqadaryo viloyati',
      ru: 'Кашкадарьинская область',
      en: 'Kashkadarya Region',
    },
  },
  {
    slug: 'samarqand',
    orderIdx: 11,
    name: {
      uz: 'Samarqand viloyati',
      ru: 'Самаркандская область',
      en: 'Samarkand Region',
    },
  },
  {
    slug: 'sirdaryo',
    orderIdx: 12,
    name: {
      uz: 'Sirdaryo viloyati',
      ru: 'Сырдарьинская область',
      en: 'Syrdarya Region',
    },
  },
  {
    slug: 'surxondaryo',
    orderIdx: 13,
    name: {
      uz: 'Surxondaryo viloyati',
      ru: 'Сурхандарьинская область',
      en: 'Surkhandarya Region',
    },
  },
  {
    slug: 'qoraqalpogiston',
    orderIdx: 14,
    name: {
      uz: "Qoraqalpog'iston Respublikasi",
      ru: 'Республика Каракалпакстан',
      en: 'Republic of Karakalpakstan',
    },
  },
];

// Museum name → region slug mapping
// These are substring matches on the UZ name field
const MUSEUM_REGION_MAP = [
  // Xorazm viloyati
  { pattern: 'Ichan Qal', region: 'xorazm' },
  { pattern: 'maqomchilar', region: 'xorazm' },
  { pattern: 'Navoiy uy-muzeyi', region: 'xorazm' },
  { pattern: 'Al-Xorazmiy', region: 'xorazm' },
  { pattern: 'Allomalar', region: 'xorazm' },
  { pattern: 'Avesto', region: 'xorazm' },
  { pattern: "Xorazm San'ati", region: 'xorazm' },
  { pattern: 'Ogahiy', region: 'xorazm' },
  { pattern: 'Boltayev', region: 'xorazm' },

  // Namangan viloyati
  { pattern: 'Namangan tarixi', region: 'namangan' },
  { pattern: 'Mashrab', region: 'namangan' },
  { pattern: 'Chust', region: 'namangan' },
  { pattern: 'Pop Arxeologiya', region: 'namangan' },
  { pattern: 'Axsikent', region: 'namangan' },
  { pattern: 'Kamoliddin Rahimov', region: 'namangan' },

  // Samarqand viloyati
  { pattern: 'Samarqand badiiy', region: 'samarqand' },
  { pattern: 'Samarqand universiteti Zoologiya', region: 'samarqand' },
  { pattern: 'Samarqand universiteti Arxeologiya', region: 'samarqand' },
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

  // Surxondaryo viloyati
  { pattern: 'Surxondaryo', region: 'surxondaryo' },
  { pattern: 'Termiz Arxeologiya', region: 'surxondaryo' },
  { pattern: 'Termiziylar', region: 'surxondaryo' },
  { pattern: "Chag'aniyon", region: 'surxondaryo' },
  { pattern: "Nazar To'rayev", region: 'surxondaryo' },
  { pattern: 'Fayoztepa', region: 'surxondaryo' },
  { pattern: 'Kampirtepa', region: 'surxondaryo' },
  { pattern: 'Dalvarzintepa', region: 'surxondaryo' },

  // Jizzax viloyati
  { pattern: 'Sharof Rashidov', region: 'jizzax' },
  { pattern: 'Hamid Olimjon', region: 'jizzax' },
  { pattern: 'Jizzax tarixi', region: 'jizzax' },
];

async function main() {
  console.log('=== Seeding regions ===\n');

  // 1. Upsert all regions
  for (const r of REGIONS) {
    const existing = await prisma.region.findUnique({
      where: { slug: r.slug },
    });

    if (existing) {
      await prisma.region.update({
        where: { slug: r.slug },
        data: { name: r.name, orderIdx: r.orderIdx },
      });
      console.log(`  Updated: ${r.slug}`);
    } else {
      await prisma.region.create({
        data: {
          name: r.name,
          slug: r.slug,
          orderIdx: r.orderIdx,
        },
      });
      console.log(`  Created: ${r.slug}`);
    }
  }

  // 2. Build slug → id map
  const allRegions = await prisma.region.findMany();
  const slugToId = {};
  for (const r of allRegions) {
    slugToId[r.slug] = r.id;
  }

  // 3. Assign museums to regions by name matching
  console.log('\n=== Assigning museums to regions ===\n');
  const museums = await prisma.museum.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, regionId: true },
  });

  let assigned = 0;
  let skipped = 0;
  let notMatched = 0;

  for (const museum of museums) {
    const nameUz = museum.name?.uz || '';

    let matchedRegionSlug = null;
    for (const mapping of MUSEUM_REGION_MAP) {
      if (nameUz.includes(mapping.pattern)) {
        matchedRegionSlug = mapping.region;
        break;
      }
    }

    if (matchedRegionSlug) {
      const regionId = slugToId[matchedRegionSlug];
      if (regionId && museum.regionId !== regionId) {
        await prisma.museum.update({
          where: { id: museum.id },
          data: { regionId },
        });
        console.log(`  ${nameUz} -> ${matchedRegionSlug}`);
        assigned++;
      } else {
        skipped++;
      }
    } else {
      notMatched++;
    }
  }

  console.log(
    `\nMuseums: ${assigned} assigned, ${skipped} already correct, ${notMatched} unmatched (assign manually in admin)`
  );

  // 4. Report unmatched museums
  if (notMatched > 0) {
    console.log('\n=== Unmatched museums (need manual assignment) ===\n');
    for (const museum of museums) {
      const nameUz = museum.name?.uz || '';
      const matched = MUSEUM_REGION_MAP.some((m) => nameUz.includes(m.pattern));
      if (!matched) {
        console.log(`  - ${nameUz}`);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROD_BASE = 'http://157.230.225.147:3000/api/v1';
const PROD_HOST = 'http://157.230.225.147:3000';

interface MultiLang {
  uz?: string;
  ru?: string;
  en?: string;
}

interface ApiRegion {
  id: string;
  name: MultiLang;
  slug: string;
  orderIdx?: number;
}

interface ApiPhoto {
  url: string;
  orderIdx?: number;
}

interface ApiEntity {
  id: string;
  legacyId: number;
  name: MultiLang;
  description: MultiLang;
  ticketPrice: MultiLang;
  latitude: number;
  longitude: number;
  city: string;
  regionId: string | null;
  isPublished: boolean;
  photos: ApiPhoto[];
  region?: { slug: string };
}

interface ApiList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function absolutize(url: string): string {
  return url.startsWith('http') ? url : `${PROD_HOST}${url}`;
}

async function importRegions(): Promise<number> {
  const res = await fetch(`${PROD_BASE}/regions`);
  const data = (await res.json()) as ApiList<ApiRegion>;
  for (const r of data.items) {
    await prisma.region.upsert({
      where: { slug: r.slug },
      update: { name: r.name as any, orderIdx: r.orderIdx ?? 0 },
      create: { name: r.name as any, slug: r.slug, orderIdx: r.orderIdx ?? 0 },
    });
  }
  return data.items.length;
}

async function fetchAll<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${PROD_BASE}${path}?limit=100&page=${page}`);
    if (!res.ok) throw new Error(`GET ${path} page ${page} → HTTP ${res.status}`);
    const data = (await res.json()) as ApiList<T>;
    out.push(...data.items);
    if (page >= data.totalPages || data.items.length === 0) break;
    page++;
  }
  return out;
}

async function importMuseums(): Promise<number> {
  const items = await fetchAll<ApiEntity>('/museums');
  for (const m of items) {
    const regionId = m.region?.slug
      ? (await prisma.region.findUnique({ where: { slug: m.region.slug } }))?.id ?? null
      : null;

    const museum = await prisma.museum.upsert({
      where: { legacyId: m.legacyId },
      update: {
        name: m.name as any,
        description: m.description as any,
        ticketPrice: m.ticketPrice as any,
        latitude: m.latitude,
        longitude: m.longitude,
        city: m.city,
        regionId,
        isPublished: m.isPublished,
      },
      create: {
        legacyId: m.legacyId,
        name: m.name as any,
        description: m.description as any,
        ticketPrice: m.ticketPrice as any,
        latitude: m.latitude,
        longitude: m.longitude,
        city: m.city,
        regionId,
        isPublished: m.isPublished,
      },
    });

    await prisma.museumPhoto.deleteMany({ where: { museumId: museum.id } });
    if (m.photos?.length) {
      await prisma.museumPhoto.createMany({
        data: m.photos.map((p) => ({
          museumId: museum.id,
          url: absolutize(p.url),
          orderIdx: p.orderIdx ?? 0,
        })),
      });
    }
  }
  return items.length;
}

async function importHistoricalPlaces(): Promise<number> {
  const items = await fetchAll<ApiEntity>('/historical-places');
  for (const m of items) {
    const regionId = m.region?.slug
      ? (await prisma.region.findUnique({ where: { slug: m.region.slug } }))?.id ?? null
      : null;

    const place = await prisma.historicalPlace.upsert({
      where: { legacyId: m.legacyId },
      update: {
        name: m.name as any,
        description: m.description as any,
        ticketPrice: m.ticketPrice as any,
        latitude: m.latitude,
        longitude: m.longitude,
        city: m.city,
        regionId,
        isPublished: m.isPublished,
      },
      create: {
        legacyId: m.legacyId,
        name: m.name as any,
        description: m.description as any,
        ticketPrice: m.ticketPrice as any,
        latitude: m.latitude,
        longitude: m.longitude,
        city: m.city,
        regionId,
        isPublished: m.isPublished,
      },
    });

    await prisma.historicalPlacePhoto.deleteMany({ where: { historicalPlaceId: place.id } });
    if (m.photos?.length) {
      await prisma.historicalPlacePhoto.createMany({
        data: m.photos.map((p) => ({
          historicalPlaceId: place.id,
          url: absolutize(p.url),
          orderIdx: p.orderIdx ?? 0,
        })),
      });
    }
  }
  return items.length;
}

(async () => {
  const t0 = Date.now();
  console.log('→ importing regions...');
  const r = await importRegions();
  console.log(`  ✓ regions: ${r}`);

  console.log('→ importing museums...');
  const m = await importMuseums();
  console.log(`  ✓ museums: ${m}`);

  console.log('→ importing historical places...');
  const p = await importHistoricalPlaces();
  console.log(`  ✓ historical places: ${p}`);

  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('Import failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});

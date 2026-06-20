import { API_BASE, MUSEUMS, PLACES, type MuseumItem } from './constants';

const API_HOST = API_BASE.replace(/\/api\/v1$/, '');

interface MultiLang {
  uz?: string;
  ru?: string;
  en?: string;
}

interface ApiRegion {
  id: string;
  name: MultiLang;
  slug: string;
}

interface ApiPhoto {
  id: string;
  url: string;
  orderIdx?: number;
}

interface ApiMuseum {
  id: string;
  legacyId: number;
  name: MultiLang;
  description: MultiLang;
  ticketPrice: MultiLang;
  latitude: number;
  longitude: number;
  city: string;
  regionId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  photos: ApiPhoto[];
  region: ApiRegion;
}

interface ApiListResponse {
  items: ApiMuseum[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  serverTime: string;
}

function mapApiToItem(api: ApiMuseum, locale: string = 'ru'): MuseumItem {
  const lang = locale as keyof MultiLang;
  const name = api.name?.[lang] || api.name?.ru || api.name?.uz || '';
  const description = api.description?.[lang] || api.description?.ru || api.description?.uz || '';
  const ticketPrice = api.ticketPrice?.[lang] || api.ticketPrice?.ru || '';

  const regionName = api.region?.name?.[lang] || api.region?.name?.ru || api.city || '';

  const resolvePhotoUrl = (raw: string) =>
    raw.startsWith('http') ? raw : `${API_HOST}${raw}`;
  const photos = (api.photos ?? [])
    .slice()
    .sort((a, b) => (a.orderIdx ?? 0) - (b.orderIdx ?? 0))
    .map((p) => resolvePhotoUrl(p.url));
  const photoUrl = photos[0];

  return {
    id: api.id,
    name,
    region: regionName,
    regionSlug: api.region?.slug || '',
    type: '',
    era: '',
    hours: '',
    price: ticketPrice !== '0' ? ticketPrice : '',
    coords: `${api.latitude}, ${api.longitude}`,
    tag: regionName,
    short: description.length > 150 ? description.slice(0, 150) + '...' : description,
    long: description,
    photoUrl,
    photos,
  };
}

interface FetchOptions {
  /**
   * When true, falls back to the hardcoded MUSEUMS/PLACES arrays from constants.ts
   * if the API returns an empty list or fails. Use ONLY for marketing surfaces
   * (hero phone-preview) where an empty state would look broken. Catalog/map/stats
   * MUST pass false (the default) so the page reflects admin reality.
   */
  fallbackToHardcoded?: boolean;
}

export async function fetchMuseums(
  locale: string = 'ru',
  opts: FetchOptions = {},
): Promise<MuseumItem[]> {
  try {
    const res = await fetch(`${API_BASE}/museums?limit=200`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiListResponse = await res.json();
    const items = (data.items ?? [])
      .filter((m) => m.isPublished && !m.deletedAt)
      .map((m) => mapApiToItem(m, locale));
    if (items.length > 0) return items;
    return opts.fallbackToHardcoded ? MUSEUMS : [];
  } catch {
    return opts.fallbackToHardcoded ? MUSEUMS : [];
  }
}

export async function fetchPlaces(
  locale: string = 'ru',
  opts: FetchOptions = {},
): Promise<MuseumItem[]> {
  try {
    const res = await fetch(`${API_BASE}/historical-places?limit=200`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiListResponse = await res.json();
    const items = (data.items ?? [])
      .filter((m) => m.isPublished && !m.deletedAt)
      .map((m) => mapApiToItem(m, locale));
    if (items.length > 0) return items;
    return opts.fallbackToHardcoded ? PLACES : [];
  } catch {
    return opts.fallbackToHardcoded ? PLACES : [];
  }
}

export async function fetchMuseum(id: string, locale: string = 'ru'): Promise<MuseumItem | null> {
  try {
    const res = await fetch(`${API_BASE}/museums/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiMuseum = await res.json();
    return mapApiToItem(data, locale);
  } catch {
    return MUSEUMS.find((m) => m.id === id) || null;
  }
}

export async function fetchPlace(id: string, locale: string = 'ru'): Promise<MuseumItem | null> {
  try {
    const res = await fetch(`${API_BASE}/historical-places/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiMuseum = await res.json();
    return mapApiToItem(data, locale);
  } catch {
    return PLACES.find((m) => m.id === id) || null;
  }
}

export interface RegionSummary {
  id: string;
  slug: string;
  name: string;
  count: number;
}

interface ApiRegionListItem {
  id: string;
  name: MultiLang;
  slug: string;
  _count?: { museums: number; historicalPlaces: number };
}

export async function fetchRegions(locale: string = 'ru'): Promise<RegionSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/regions`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { items: ApiRegionListItem[] } = await res.json();
    const lang = locale as keyof MultiLang;
    return (data.items ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name?.[lang] || r.name?.ru || r.name?.uz || r.slug,
      count: (r._count?.museums ?? 0) + (r._count?.historicalPlaces ?? 0),
    }));
  } catch {
    return [];
  }
}

export interface SiteStats {
  museums: number;
  places: number;
  regions: number;
  languages: number;
}

export async function fetchStats(): Promise<SiteStats> {
  try {
    const [mRes, pRes, rRes] = await Promise.all([
      fetch(`${API_BASE}/museums?limit=1`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE}/historical-places?limit=1`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE}/regions`, { next: { revalidate: 60 } }),
    ]);
    const m = mRes.ok ? ((await mRes.json()) as ApiListResponse) : { total: 0, items: [] as ApiMuseum[] };
    const p = pRes.ok ? ((await pRes.json()) as ApiListResponse) : { total: 0, items: [] as ApiMuseum[] };
    const r = rRes.ok ? ((await rRes.json()) as { items: ApiRegionListItem[] }) : { items: [] };
    return {
      museums: m.total ?? m.items?.length ?? 0,
      places: p.total ?? p.items?.length ?? 0,
      regions: r.items?.length ?? 0,
      languages: 3,
    };
  } catch {
    return { museums: 0, places: 0, regions: 0, languages: 3 };
  }
}

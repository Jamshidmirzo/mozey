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

  const rawPhoto = api.photos?.length > 0 ? api.photos[0].url : undefined;
  const photoUrl = rawPhoto
    ? rawPhoto.startsWith('http') ? rawPhoto : `${API_HOST}${rawPhoto}`
    : undefined;

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
  };
}

export async function fetchMuseums(locale: string = 'ru'): Promise<MuseumItem[]> {
  try {
    const res = await fetch(`${API_BASE}/museums?limit=200`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiListResponse = await res.json();
    const items = data.items
      .filter((m) => m.isPublished && !m.deletedAt)
      .map((m) => mapApiToItem(m, locale));
    return items.length > 0 ? items : MUSEUMS;
  } catch {
    return MUSEUMS;
  }
}

export async function fetchPlaces(locale: string = 'ru'): Promise<MuseumItem[]> {
  try {
    const res = await fetch(`${API_BASE}/historical-places?limit=200`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiListResponse = await res.json();
    const items = data.items
      .filter((m) => m.isPublished && !m.deletedAt)
      .map((m) => mapApiToItem(m, locale));
    return items.length > 0 ? items : PLACES;
  } catch {
    return PLACES;
  }
}

export async function fetchMuseum(id: string, locale: string = 'ru'): Promise<MuseumItem | null> {
  try {
    const res = await fetch(`${API_BASE}/museums/${id}`, {
      next: { revalidate: 300 },
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
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiMuseum = await res.json();
    return mapApiToItem(data, locale);
  } catch {
    return PLACES.find((m) => m.id === id) || null;
  }
}

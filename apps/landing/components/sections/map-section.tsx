import { fetchMuseums, fetchPlaces } from '@/lib/api';
import { MapSectionClient } from './map-section-client';

// Server component: fetches live museums + historical places from the API
// (the same backend the admin panel writes to) and hands them to the client
// component for interactive selection. REGION_POS (SVG coords) stays in the
// client — those are layout, not data.
export async function MapSection({ locale }: { locale: string }) {
  const [museums, places] = await Promise.all([
    fetchMuseums(locale),
    fetchPlaces(locale),
  ]);

  // All historical places + non-Tashkent museums. Tashkent already gets its
  // own dense cluster on the canvas and would crowd out other regions.
  const items = [
    ...places,
    ...museums.filter((m) => m.region !== 'Ташкент' && m.region !== 'Tashkent'),
  ].slice(0, 11);

  return <MapSectionClient items={items} />;
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://mozey.uz';

export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  'https://apps.apple.com/app/mozey/id0000000000';

export const GOOGLE_PLAY_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
  'https://play.google.com/store/apps/details?id=uz.mozey.app';

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@mozey.uz';

export const SOCIAL_LINKS = {
  telegram: 'https://t.me/mozey_uz',
  instagram: 'https://instagram.com/mozey_uz',
  facebook: 'https://facebook.com/mozey.uz',
} as const;

export const NAV_LINKS = [
  { key: 'features', href: '#features' },
  { key: 'screenshots', href: '#screenshots' },
  { key: 'statistics', href: '#statistics' },
  { key: 'download', href: '#download' },
] as const;

export const STATISTICS = {
  museums: 281,
  historicalPlaces: 101,
  languages: 3,
  regions: 14,
} as const;

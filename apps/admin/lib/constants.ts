// Route constants
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  MUSEUMS: '/museums',
  MUSEUM_NEW: '/museums/new',
  MUSEUM_EDIT: (id: string) => `/museums/${id}`,
  MUSEUM_PHOTOS: (id: string) => `/museums/${id}/photos`,
  HISTORICAL_PLACES: '/historical-places',
  HISTORICAL_PLACE_NEW: '/historical-places/new',
  HISTORICAL_PLACE_EDIT: (id: string) => `/historical-places/${id}`,
  REGIONS: '/regions',
  REGION_NEW: '/regions/new',
  REGION_EDIT: (id: string) => `/regions/${id}`,
  ADMINS: '/admins',
  AUDIT_LOG: '/audit-log',
} as const;

// API path constants
export const API_PATHS = {
  // Auth
  ADMIN_LOGIN: '/admin/auth/login',
  ADMIN_REFRESH: '/admin/auth/refresh',

  // Museums
  ADMIN_MUSEUMS: '/admin/museums',
  ADMIN_MUSEUM: (id: string) => `/admin/museums/${id}`,
  ADMIN_MUSEUM_PHOTOS: (id: string) => `/admin/museums/${id}/photos`,
  ADMIN_PHOTO: (id: string) => `/admin/photos/${id}`,

  // Regions
  ADMIN_REGIONS: '/admin/regions',
  ADMIN_REGION: (id: string) => `/admin/regions/${id}`,
  ADMIN_REGIONS_DROPDOWN: '/admin/regions/dropdown',

  // Historical Places
  ADMIN_HISTORICAL_PLACES: '/admin/historical-places',
  ADMIN_HISTORICAL_PLACE: (id: string) => `/admin/historical-places/${id}`,
  ADMIN_HISTORICAL_PLACE_PHOTOS: (id: string) => `/admin/historical-places/${id}/photos`,

  // Admins
  ADMIN_ADMINS: '/admin/admins',
  ADMIN_ADMIN: (id: string) => `/admin/admins/${id}`,

  // Audit Log
  ADMIN_AUDIT_LOG: '/admin/audit-log',
} as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Debounce delay for search inputs (ms)
export const SEARCH_DEBOUNCE_MS = 300;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Locale labels
export const LOCALE_LABELS: Record<string, string> = {
  ru: 'Русский',
  uz: "O'zbek",
  en: 'English',
};

// Content languages (for form tabs)
export const CONTENT_LANGUAGES = ['uz', 'ru', 'en'] as const;

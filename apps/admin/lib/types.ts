export interface LocalizedField {
  uz: string;
  ru: string;
  en: string;
}

export interface Region {
  id: string;
  name: LocalizedField;
  slug: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    museums: number;
    historicalPlaces: number;
  };
}

export interface RegionDropdown {
  id: string;
  name: LocalizedField;
  slug: string;
}

export interface RegionFormData {
  name: LocalizedField;
  slug: string;
  orderIdx: number;
}

export interface Museum {
  id: string;
  legacyId: number | null;
  name: LocalizedField;
  description: LocalizedField;
  ticketPrice: LocalizedField;
  latitude: number;
  longitude: number;
  city: string;
  regionId: string | null;
  region: RegionDropdown | null;
  isPublished: boolean;
  photos: MuseumPhoto[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MuseumPhoto {
  id: string;
  museumId: string;
  url: string;
  orderIdx: number;
  createdAt: string;
}

export interface HistoricalPlace {
  id: string;
  legacyId: number | null;
  name: LocalizedField;
  description: LocalizedField;
  ticketPrice: LocalizedField;
  latitude: number;
  longitude: number;
  city: string;
  regionId: string | null;
  region: RegionDropdown | null;
  isPublished: boolean;
  photos: HistoricalPlacePhoto[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface HistoricalPlacePhoto {
  id: string;
  historicalPlaceId: string;
  url: string;
  orderIdx: number;
  createdAt: string;
}

export interface Admin {
  id: string;
  email: string;
  role: 'superadmin' | 'editor';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  admin?: Admin;
  action: string;
  entityType: string;
  entityId: string;
  diff: Record<string, unknown> | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface MuseumFormData {
  name: LocalizedField;
  description: LocalizedField;
  ticketPrice: LocalizedField;
  latitude: number;
  longitude: number;
  city: string;
  regionId?: string | null;
  isPublished: boolean;
}

export interface HistoricalPlaceFormData {
  name: LocalizedField;
  description: LocalizedField;
  ticketPrice: LocalizedField;
  latitude: number;
  longitude: number;
  city: string;
  regionId?: string | null;
  isPublished: boolean;
}

export interface AdminFormData {
  email: string;
  password: string;
  role: 'superadmin' | 'editor';
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'published' | 'draft' | 'deleted' | 'all';
  regionId?: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  adminId?: string;
  entityType?: string;
  action?: string;
}

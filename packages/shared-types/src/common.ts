/**
 * Multilingual text stored as JSONB in PostgreSQL.
 * All content fields use this shape.
 */
export interface MultilingualText {
  uz: string;
  ru: string;
  en: string;
}

/**
 * Standard paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Standard error response.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Supported locales.
 */
export type Locale = 'uz' | 'ru' | 'en';

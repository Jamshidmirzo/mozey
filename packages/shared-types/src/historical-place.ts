import { MultilingualText } from './common';

/**
 * Historical place entity as returned by the API.
 */
export interface HistoricalPlace {
  id: string;
  legacyId: number | null;
  name: MultilingualText;
  description: MultilingualText;
  ticketPrice: MultilingualText;
  latitude: number;
  longitude: number;
  city: string;
  isPublished: boolean;
  photos: HistoricalPlacePhoto[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Historical place photo entity.
 */
export interface HistoricalPlacePhoto {
  id: string;
  historicalPlaceId: string;
  url: string;
  orderIdx: number;
  createdAt: string;
}

/**
 * Payload for creating a historical place (admin).
 */
export interface CreateHistoricalPlacePayload {
  legacyId?: number;
  name: MultilingualText;
  description: MultilingualText;
  ticketPrice: MultilingualText;
  latitude: number;
  longitude: number;
  city: string;
  isPublished?: boolean;
}

/**
 * Payload for updating a historical place (admin).
 */
export interface UpdateHistoricalPlacePayload {
  name?: MultilingualText;
  description?: MultilingualText;
  ticketPrice?: MultilingualText;
  latitude?: number;
  longitude?: number;
  city?: string;
  isPublished?: boolean;
}

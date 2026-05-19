import { MultilingualText } from './common';

/**
 * Museum entity as returned by the API.
 */
export interface Museum {
  id: string;
  legacyId: number | null;
  name: MultilingualText;
  description: MultilingualText;
  ticketPrice: MultilingualText;
  latitude: number;
  longitude: number;
  city: string;
  isPublished: boolean;
  photos: MuseumPhoto[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Museum photo entity.
 */
export interface MuseumPhoto {
  id: string;
  museumId: string;
  url: string;
  orderIdx: number;
  createdAt: string;
}

/**
 * Payload for creating a museum (admin).
 */
export interface CreateMuseumPayload {
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
 * Payload for updating a museum (admin).
 */
export interface UpdateMuseumPayload {
  name?: MultilingualText;
  description?: MultilingualText;
  ticketPrice?: MultilingualText;
  latitude?: number;
  longitude?: number;
  city?: string;
  isPublished?: boolean;
}

/**
 * Delta sync response returned by GET /museums?since= and GET /historical-places?since=
 */
export interface SyncResponse<T> {
  items: T[];
  deleted: string[];
  serverTime: string;
  nextSince: string;
}

/**
 * Single entity entry in the sync manifest.
 */
export interface ManifestEntry {
  id: string;
  updatedAt: string;
  hash: string;
}

/**
 * Full sync manifest returned by GET /sync/manifest.
 */
export interface SyncManifest {
  museums: ManifestEntry[];
  historicalPlaces: ManifestEntry[];
  serverTime: string;
}

/**
 * Result of a batch action sync.
 */
export interface SyncActionsResult {
  accepted: number;
  duplicates: number;
  failed: number;
}

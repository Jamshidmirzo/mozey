/**
 * Entity types that can be acted upon.
 */
export type EntityType = 'museum' | 'historical';

/**
 * Action types for user interactions.
 * Append-only: no updates or deletes.
 */
export type ActionType = 'like' | 'unlike' | 'save' | 'unsave';

/**
 * A single user action event.
 */
export interface UserAction {
  id: string;
  userId: string;
  entityType: EntityType;
  entityId: string;
  actionType: ActionType;
  clientEventId: string;
  createdAt: string;
}

/**
 * Payload for a single action in a sync batch.
 */
export interface SyncActionPayload {
  entityType: EntityType;
  entityId: string;
  actionType: ActionType;
  clientEventId: string;
  createdAt: string;
}

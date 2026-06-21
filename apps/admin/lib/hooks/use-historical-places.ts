'use client';

import { createEntityHooks } from './use-entity-crud';
import { API_PATHS } from '../constants';
import type { HistoricalPlace, HistoricalPlaceFormData } from '../types';

const placeHooks = createEntityHooks<HistoricalPlace, HistoricalPlaceFormData>({
  queryKey: 'admin-historical-places',
  basePath: API_PATHS.ADMIN_HISTORICAL_PLACES,
  entityPath: API_PATHS.ADMIN_HISTORICAL_PLACE,
});

export const useHistoricalPlaces = placeHooks.useList;
export const useHistoricalPlace = placeHooks.useDetail;
export const useCreateHistoricalPlace = placeHooks.useCreate;
export const useUpdateHistoricalPlace = placeHooks.useUpdate;
export const useDeleteHistoricalPlace = placeHooks.useDelete;
export const useRestoreHistoricalPlace = placeHooks.useRestore;

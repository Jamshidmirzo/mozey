'use client';

import { createEntityHooks } from './use-entity-crud';
import { API_PATHS } from '../constants';
import type { Museum, MuseumFormData } from '../types';

const museumHooks = createEntityHooks<Museum, MuseumFormData>({
  queryKey: 'admin-museums',
  basePath: API_PATHS.ADMIN_MUSEUMS,
  entityPath: API_PATHS.ADMIN_MUSEUM,
});

export const useMuseums = museumHooks.useList;
export const useMuseum = museumHooks.useDetail;
export const useCreateMuseum = museumHooks.useCreate;
export const useUpdateMuseum = museumHooks.useUpdate;
export const useDeleteMuseum = museumHooks.useDelete;
export const useRestoreMuseum = museumHooks.useRestore;

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, uploadToPresignedUrl } from '../api';
import { API_PATHS } from '../constants';
import type { PresignedUrlResponse, MuseumPhoto, HistoricalPlacePhoto } from '../types';

type EntityType = 'museum' | 'historical-place';

function getQueryKey(entityType: EntityType): string {
  return entityType === 'museum' ? 'admin-museums' : 'admin-historical-places';
}

function getPhotosPath(entityType: EntityType, entityId: string): string {
  return entityType === 'museum'
    ? API_PATHS.ADMIN_MUSEUM_PHOTOS(entityId)
    : API_PATHS.ADMIN_HISTORICAL_PLACE_PHOTOS(entityId);
}

export function useUploadEntityPhoto(entityType: EntityType, entityId: string) {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(entityType);

  return useMutation({
    mutationFn: async (file: File) => {
      const presigned = await api.post<PresignedUrlResponse>(
        '/admin/upload/presign',
        { filename: file.name, contentType: file.type }
      );

      await uploadToPresignedUrl(presigned.uploadUrl, file);

      await api.post(getPhotosPath(entityType, entityId), {
        url: presigned.fileUrl,
      });

      return presigned.fileUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey, entityId] });
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });
}

/** @deprecated Use useUploadEntityPhoto('museum', id) instead */
export function useUploadMuseumPhoto(museumId: string) {
  return useUploadEntityPhoto('museum', museumId);
}

/** @deprecated Use useUploadEntityPhoto('historical-place', id) instead */
export function useUploadHistoricalPlacePhoto(placeId: string) {
  return useUploadEntityPhoto('historical-place', placeId);
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      api.delete<void>(API_PATHS.ADMIN_PHOTO(photoId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-museums'] });
      queryClient.invalidateQueries({ queryKey: ['admin-historical-places'] });
    },
  });
}

export function useReorderPhotos(entityType: EntityType, entityId: string) {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(entityType);

  return useMutation({
    mutationFn: (photoIds: string[]) => {
      const basePath = getPhotosPath(entityType, entityId);
      return api.patch<(MuseumPhoto | HistoricalPlacePhoto)[]>(
        `${basePath}/reorder`,
        { photoIds }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey, entityId] });
    },
  });
}

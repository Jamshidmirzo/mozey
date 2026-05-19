'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, uploadToPresignedUrl } from '../api';
import { API_PATHS } from '../constants';
import type { PresignedUrlResponse, MuseumPhoto, HistoricalPlacePhoto } from '../types';

export function useUploadMuseumPhoto(museumId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const presigned = await api.post<PresignedUrlResponse>(
        '/admin/upload/presign',
        { filename: file.name, contentType: file.type }
      );

      await uploadToPresignedUrl(presigned.uploadUrl, file);

      await api.post(API_PATHS.ADMIN_MUSEUM_PHOTOS(museumId), {
        url: presigned.fileUrl,
      });

      return presigned.fileUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-museums', museumId] });
      queryClient.invalidateQueries({ queryKey: ['admin-museums'] });
    },
  });
}

export function useUploadHistoricalPlacePhoto(placeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const presigned = await api.post<PresignedUrlResponse>(
        '/admin/upload/presign',
        { filename: file.name, contentType: file.type }
      );

      await uploadToPresignedUrl(presigned.uploadUrl, file);

      await api.post(API_PATHS.ADMIN_HISTORICAL_PLACE_PHOTOS(placeId), {
        url: presigned.fileUrl,
      });

      return presigned.fileUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin-historical-places', placeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin-historical-places'],
      });
    },
  });
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

export function useReorderPhotos(entityType: 'museum' | 'historical-place', entityId: string) {
  const queryClient = useQueryClient();
  const queryKey = entityType === 'museum' ? 'admin-museums' : 'admin-historical-places';

  return useMutation({
    mutationFn: (photoIds: string[]) => {
      const basePath =
        entityType === 'museum'
          ? API_PATHS.ADMIN_MUSEUM_PHOTOS(entityId)
          : API_PATHS.ADMIN_HISTORICAL_PLACE_PHOTOS(entityId);
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

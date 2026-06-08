'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { API_PATHS, DEFAULT_PAGE_SIZE } from '../constants';
import type {
  Museum,
  MuseumFormData,
  PaginatedResponse,
  ListParams,
} from '../types';

const MUSEUMS_KEY = 'admin-museums';

function buildQueryString(params: ListParams): string {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.status && params.status !== 'all')
    searchParams.set('status', params.status);
  if (params.regionId) searchParams.set('regionId', params.regionId);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export function useMuseums(params: ListParams = {}) {
  const finalParams = { page: 1, limit: DEFAULT_PAGE_SIZE, ...params };
  return useQuery({
    queryKey: [MUSEUMS_KEY, finalParams],
    queryFn: () =>
      api.get<PaginatedResponse<Museum>>(
        `${API_PATHS.ADMIN_MUSEUMS}${buildQueryString(finalParams)}`
      ),
  });
}

export function useMuseum(id: string) {
  return useQuery({
    queryKey: [MUSEUMS_KEY, id],
    queryFn: () => api.get<Museum>(API_PATHS.ADMIN_MUSEUM(id)),
    enabled: !!id,
  });
}

export function useCreateMuseum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MuseumFormData) =>
      api.post<Museum>(API_PATHS.ADMIN_MUSEUMS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MUSEUMS_KEY] });
    },
  });
}

export function useUpdateMuseum(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MuseumFormData>) =>
      api.patch<Museum>(API_PATHS.ADMIN_MUSEUM(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MUSEUMS_KEY] });
    },
  });
}

export function useDeleteMuseum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(API_PATHS.ADMIN_MUSEUM(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MUSEUMS_KEY] });
    },
  });
}

export function useRestoreMuseum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<Museum>(API_PATHS.ADMIN_MUSEUM(id), { deletedAt: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MUSEUMS_KEY] });
    },
  });
}

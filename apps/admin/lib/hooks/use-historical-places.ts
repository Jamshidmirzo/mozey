'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { API_PATHS, DEFAULT_PAGE_SIZE } from '../constants';
import type {
  HistoricalPlace,
  HistoricalPlaceFormData,
  PaginatedResponse,
  ListParams,
} from '../types';

const PLACES_KEY = 'admin-historical-places';

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

export function useHistoricalPlaces(params: ListParams = {}) {
  const finalParams = { page: 1, limit: DEFAULT_PAGE_SIZE, ...params };
  return useQuery({
    queryKey: [PLACES_KEY, finalParams],
    queryFn: () =>
      api.get<PaginatedResponse<HistoricalPlace>>(
        `${API_PATHS.ADMIN_HISTORICAL_PLACES}${buildQueryString(finalParams)}`
      ),
  });
}

export function useHistoricalPlace(id: string) {
  return useQuery({
    queryKey: [PLACES_KEY, id],
    queryFn: () =>
      api.get<HistoricalPlace>(API_PATHS.ADMIN_HISTORICAL_PLACE(id)),
    enabled: !!id,
  });
}

export function useCreateHistoricalPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HistoricalPlaceFormData) =>
      api.post<HistoricalPlace>(API_PATHS.ADMIN_HISTORICAL_PLACES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLACES_KEY] });
    },
  });
}

export function useUpdateHistoricalPlace(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<HistoricalPlaceFormData>) =>
      api.patch<HistoricalPlace>(API_PATHS.ADMIN_HISTORICAL_PLACE(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLACES_KEY] });
    },
  });
}

export function useDeleteHistoricalPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<void>(API_PATHS.ADMIN_HISTORICAL_PLACE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLACES_KEY] });
    },
  });
}

export function useRestoreHistoricalPlace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<HistoricalPlace>(API_PATHS.ADMIN_HISTORICAL_PLACE(id), {
        deletedAt: null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLACES_KEY] });
    },
  });
}

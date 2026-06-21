'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { DEFAULT_PAGE_SIZE } from '../constants';
import type { PaginatedResponse, ListParams } from '../types';

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

interface EntityCrudConfig<T, TFormData> {
  queryKey: string;
  basePath: string;
  entityPath: (id: string) => string;
}

export function createEntityHooks<T, TFormData>(config: EntityCrudConfig<T, TFormData>) {
  const { queryKey, basePath, entityPath } = config;

  function useList(params: ListParams = {}) {
    const finalParams = { page: 1, limit: DEFAULT_PAGE_SIZE, ...params };
    return useQuery({
      queryKey: [queryKey, finalParams],
      queryFn: () =>
        api.get<PaginatedResponse<T>>(
          `${basePath}${buildQueryString(finalParams)}`
        ),
    });
  }

  function useDetail(id: string) {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: () => api.get<T>(entityPath(id)),
      enabled: !!id,
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: TFormData) =>
        api.post<T>(basePath, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  }

  function useUpdate(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: Partial<TFormData>) =>
        api.patch<T>(entityPath(id), data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.delete<void>(entityPath(id)),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  }

  function useRestore() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) =>
        api.patch<T>(entityPath(id), { deletedAt: null }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  }

  return { useList, useDetail, useCreate, useUpdate, useDelete, useRestore };
}

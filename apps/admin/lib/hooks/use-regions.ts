'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { API_PATHS } from '../constants';
import type {
  Region,
  RegionDropdown,
  RegionFormData,
} from '../types';

const REGIONS_KEY = 'admin-regions';
const REGIONS_DROPDOWN_KEY = 'admin-regions-dropdown';

export function useRegions(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const qs = params.toString();
  const path = qs
    ? `${API_PATHS.ADMIN_REGIONS}?${qs}`
    : API_PATHS.ADMIN_REGIONS;

  return useQuery({
    queryKey: [REGIONS_KEY, search],
    queryFn: () => api.get<{ items: Region[]; total: number }>(path),
  });
}

export function useRegion(id: string) {
  return useQuery({
    queryKey: [REGIONS_KEY, id],
    queryFn: () => api.get<Region>(API_PATHS.ADMIN_REGION(id)),
    enabled: !!id,
  });
}

export function useRegionsDropdown() {
  return useQuery({
    queryKey: [REGIONS_DROPDOWN_KEY],
    queryFn: () =>
      api.get<RegionDropdown[]>(API_PATHS.ADMIN_REGIONS_DROPDOWN),
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}

export function useCreateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegionFormData) =>
      api.post<Region>(API_PATHS.ADMIN_REGIONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REGIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [REGIONS_DROPDOWN_KEY] });
    },
  });
}

export function useUpdateRegion(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RegionFormData>) =>
      api.patch<Region>(API_PATHS.ADMIN_REGION(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REGIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [REGIONS_DROPDOWN_KEY] });
    },
  });
}

export function useDeleteRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<void>(API_PATHS.ADMIN_REGION(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REGIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [REGIONS_DROPDOWN_KEY] });
    },
  });
}

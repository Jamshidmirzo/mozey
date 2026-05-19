'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { API_PATHS } from '../constants';
import type { Admin, AdminFormData } from '../types';

const ADMINS_KEY = 'admin-admins';

export function useAdmins() {
  return useQuery({
    queryKey: [ADMINS_KEY],
    queryFn: () => api.get<Admin[]>(API_PATHS.ADMIN_ADMINS),
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminFormData) =>
      api.post<Admin>(API_PATHS.ADMIN_ADMINS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<void>(API_PATHS.ADMIN_ADMIN(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMINS_KEY] });
    },
  });
}

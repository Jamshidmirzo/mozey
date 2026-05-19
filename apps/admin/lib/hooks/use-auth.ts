'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import {
  setToken,
  setRefreshToken,
  setStoredAdmin,
  removeTokens,
} from '../auth';
import { API_PATHS } from '../constants';
import type { LoginRequest, LoginResponse } from '../types';
import { useRouter } from '@/i18n/navigation';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<LoginResponse>(API_PATHS.ADMIN_LOGIN, data, {
        skipAuth: true,
      }),
    onSuccess: (data) => {
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setStoredAdmin(data.admin);
      queryClient.clear();
      router.push('/museums');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      removeTokens();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });
}

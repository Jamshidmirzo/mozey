'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { API_PATHS, DEFAULT_PAGE_SIZE } from '../constants';
import type { AuditLogEntry, AuditLogParams, PaginatedResponse } from '../types';

const AUDIT_LOG_KEY = 'admin-audit-log';

function buildQueryString(params: AuditLogParams): string {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.adminId) searchParams.set('adminId', params.adminId);
  if (params.entityType) searchParams.set('entityType', params.entityType);
  if (params.action) searchParams.set('action', params.action);
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export function useAuditLog(params: AuditLogParams = {}) {
  const finalParams = { page: 1, limit: DEFAULT_PAGE_SIZE, ...params };
  return useQuery({
    queryKey: [AUDIT_LOG_KEY, finalParams],
    queryFn: () =>
      api.get<PaginatedResponse<AuditLogEntry>>(
        `${API_PATHS.ADMIN_AUDIT_LOG}${buildQueryString(finalParams)}`
      ),
  });
}

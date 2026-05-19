/**
 * Admin roles.
 */
export type AdminRole = 'superadmin' | 'editor';

/**
 * Admin entity as returned by the API.
 */
export interface Admin {
  id: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

/**
 * Payload for creating an admin (superadmin only).
 */
export interface CreateAdminPayload {
  email: string;
  password: string;
  role: AdminRole;
}

/**
 * Admin login payload.
 */
export interface AdminLoginPayload {
  email: string;
  password: string;
}

/**
 * Admin auth response with tokens.
 */
export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}

/**
 * Token refresh payload.
 */
export interface RefreshTokenPayload {
  refreshToken: string;
}

/**
 * Device auth payload.
 */
export interface DeviceAuthPayload {
  deviceId: string;
  locale?: string;
  appVersion?: string;
}

/**
 * Device auth response.
 */
export interface DeviceAuthResponse {
  token: string;
  userId: string;
}

/**
 * Audit log entry.
 */
export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  diff: Record<string, unknown> | null;
  createdAt: string;
}

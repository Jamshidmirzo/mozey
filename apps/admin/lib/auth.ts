import Cookies from 'js-cookie';
import type { Admin } from './types';

const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const ADMIN_KEY = 'admin_user';

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 1, // 1 day
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    expires: 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function removeTokens(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_KEY);
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getStoredAdmin(): Admin | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(ADMIN_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredAdmin(admin: Admin): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }
}

export function isSuperAdmin(): boolean {
  const admin = getStoredAdmin();
  return admin?.role === 'superadmin';
}

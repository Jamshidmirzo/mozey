import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { ru, uz, enUS } from 'date-fns/locale';
import type { LocalizedField } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateLocales: Record<string, typeof ru> = {
  ru,
  uz,
  en: enUS,
};

export function formatDate(dateString: string, locale: string = 'ru'): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy HH:mm', {
      locale: dateLocales[locale] || ru,
    });
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy');
  } catch {
    return dateString;
  }
}

export function getLocalizedValue(
  field: LocalizedField | undefined | null,
  locale: string
): string {
  if (!field) return '';
  return field[locale as keyof LocalizedField] || field.ru || field.uz || field.en || '';
}

export function emptyLocalizedField(): LocalizedField {
  return { uz: '', ru: '', en: '' };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { locales, localeNames, type Locale } from '@/i18n/request';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  function switchLocale(newLocale: Locale) {
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/') || '/');
    onClose();
  }

  function handleNavClick(href: string) {
    onClose();
    // Small delay to let the drawer close before scrolling
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Mozey"
              width={32}
              height={32}
            />
            <span className="font-display text-base font-bold text-deep-blue">
              Mozey
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                onClick={() => handleNavClick(link.href)}
                className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium text-gray-600 transition-colors hover:bg-warm-white hover:text-deep-blue"
              >
                {t(link.key)}
              </button>
            ))}
          </div>

          {/* Language switcher */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Language
            </p>
            <div className="space-y-1">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors',
                    l === locale
                      ? 'bg-museum-gold/10 font-semibold text-deep-blue'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <span className="text-xs font-bold text-gray-400">
                    {l.toUpperCase()}
                  </span>
                  <span>{localeNames[l]}</span>
                  {l === locale && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto text-museum-gold"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4">
          <a
            href="#download"
            onClick={() => handleNavClick('#download')}
            className="flex w-full items-center justify-center rounded-xl bg-museum-gold px-6 py-3 text-sm font-semibold text-deep-blue transition-all hover:bg-museum-gold-300 active:scale-[0.98]"
          >
            {t('download')}
          </a>
        </div>
      </div>
    </>
  );
}

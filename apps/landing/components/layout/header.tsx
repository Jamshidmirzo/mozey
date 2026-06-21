'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, Download, Menu, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { APP_STORE_URL, NAV_LINKS } from '@/lib/constants';
import { Logo } from '@/components/ui/logo';

const LOCALES = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
] as const;

function useLocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    if (segments.length > 1 && ['uz', 'ru', 'en'].includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || '/';
    router.push(newPath);
  };

  return { locale, switchLocale };
}

function LocaleSwitcher() {
  const { locale, switchLocale } = useLocaleSwitcher();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLabel = LOCALES.find((l) => l.code === locale)?.label || 'UZ';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        className="hidden sm:inline-flex items-center gap-1.5 rounded-full font-mono text-xs font-semibold tracking-[1px] text-ink2 uppercase cursor-pointer bg-transparent"
        style={{
          padding: '7px 12px',
          border: '0.5px solid rgba(30,24,19,0.10)',
        }}
      >
        <Globe size={14} color="#736A5C" strokeWidth={1.9} />
        {currentLabel}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 bg-surface overflow-hidden z-50"
          style={{
            borderRadius: 12,
            border: '0.5px solid rgba(30,24,19,0.10)',
            boxShadow: '0 8px 24px rgba(30,24,19,0.12)',
            minWidth: 100,
          }}
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                switchLocale(l.code);
                setOpen(false);
              }}
              className="w-full text-left border-none cursor-pointer font-ui text-[14px] transition-colors duration-150"
              style={{
                padding: '10px 16px',
                background: l.code === locale ? 'rgba(21,94,122,0.08)' : 'transparent',
                color: l.code === locale ? '#155E7A' : '#736A5C',
                fontWeight: l.code === locale ? 600 : 400,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileLocaleButton({
  code,
  label,
  onClose,
}: {
  code: string;
  label: string;
  onClose: () => void;
}) {
  const { locale, switchLocale } = useLocaleSwitcher();

  return (
    <button
      onClick={() => {
        switchLocale(code);
        onClose();
      }}
      className="rounded-full font-mono text-xs font-semibold tracking-[1px] uppercase cursor-pointer border-none"
      style={{
        padding: '8px 16px',
        background: code === locale ? '#155E7A' : 'rgba(30,24,19,0.05)',
        color: code === locale ? '#fff' : '#736A5C',
      }}
    >
      {label}
    </button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('nav');
  const th = useTranslations('header');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(247,243,235,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled
          ? '0.5px solid rgba(30,24,19,0.07)'
          : '0.5px solid transparent',
      }}
    >
      <div
        className="mx-auto max-w-[1200px] flex items-center justify-between gap-5"
        style={{ padding: '16px clamp(20px, 4vw, 40px)' }}
      >
        <Logo size={26} />

        {/* Desktop nav */}
        <nav className="main-nav hidden md:flex items-center gap-[30px]">
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className="font-ui text-[15px] font-medium text-ink2 no-underline -tracking-[0.1px] transition-colors duration-200 hover:text-ink"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />

          {/* CTA button */}
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 no-underline bg-primary text-white rounded-full font-ui text-[15px] font-semibold -tracking-[0.2px] transition-transform duration-200 hover:-translate-y-0.5"
            style={{
              padding: '10px 18px',
              boxShadow: '0 6px 18px rgba(21,94,122,0.28)',
            }}
          >
            <Download size={16} color="#fff" strokeWidth={2.2} />
            {th('download')}
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border-none bg-transparent cursor-pointer text-ink"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden bg-canvas border-t"
          style={{
            borderColor: 'rgba(30,24,19,0.07)',
            padding: '16px clamp(20px, 4vw, 40px)',
          }}
        >
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-ui text-[16px] font-medium text-ink2 no-underline"
              >
                {t(link.key)}
              </a>
            ))}

            {/* Mobile locale switcher */}
            <div className="flex gap-2 mt-2">
              {LOCALES.map((l) => (
                <MobileLocaleButton
                  key={l.code}
                  code={l.code}
                  label={l.label}
                  onClose={() => setMobileOpen(false)}
                />
              ))}
            </div>

            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 no-underline bg-primary text-white rounded-full font-ui text-[15px] font-semibold mt-2"
              style={{ padding: '12px 24px' }}
            >
              <Download size={16} color="#fff" strokeWidth={2.2} />
              {th('downloadApp')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

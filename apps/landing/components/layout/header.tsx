'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { LocaleSwitcher } from './locale-switcher';
import { MobileNav } from '@/components/ui/mobile-nav';
import { MagneticButton } from '@/components/effects/magnetic-button';

export function Header() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-white/80 shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="container-landing">
        <nav className="flex h-16 items-center justify-between sm:h-20">
          <a href="#" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <Image
              src="/logo.svg"
              alt="Mozey"
              width={40}
              height={40}
              className="h-9 w-9 sm:h-10 sm:w-10"
            />
            <span
              className={cn(
                'hidden font-display text-lg font-bold tracking-tight transition-colors duration-300 sm:inline',
                scrolled ? 'text-deep-blue' : 'text-white'
              )}
            >
              Mozey
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <MagneticButton key={link.key} strength={0.15}>
                <a
                  href={link.href}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-medium transition-all duration-300',
                    scrolled
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-deep-blue'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {t(link.key)}
                </a>
              </MagneticButton>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LocaleSwitcher scrolled={scrolled} />

            <MagneticButton strength={0.2}>
              <a
                href="#download"
                className={cn(
                  'hidden rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 md:inline-flex',
                  scrolled
                    ? 'bg-deep-blue text-white hover:bg-deep-blue-500'
                    : 'bg-white text-deep-blue hover:bg-museum-gold'
                )}
              >
                {t('download')}
              </a>
            </MagneticButton>

            <button
              onClick={() => setMobileOpen(true)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-colors md:hidden',
                scrolled
                  ? 'text-deep-blue hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              )}
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

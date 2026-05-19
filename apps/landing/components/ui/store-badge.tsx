'use client';

import { cn } from '@/lib/utils';

interface StoreBadgeProps {
  store: 'apple' | 'google';
  href: string;
  className?: string;
}

export function StoreBadge({ store, href, className }: StoreBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center gap-3 rounded-xl border-2 border-white/20 bg-black/80 px-5 py-3 transition-all duration-200',
        'hover:border-museum-gold/50 hover:bg-black hover:scale-105',
        'active:scale-100',
        className
      )}
      aria-label={store === 'apple' ? 'Download on App Store' : 'Get it on Google Play'}
    >
      {store === 'apple' ? <AppleIcon /> : <GooglePlayIcon />}
      <div className="flex flex-col">
        <span className="text-[10px] font-medium text-gray-300">
          {store === 'apple' ? 'Download on the' : 'GET IT ON'}
        </span>
        <span className="text-sm font-semibold text-white sm:text-base">
          {store === 'apple' ? 'App Store' : 'Google Play'}
        </span>
      </div>
    </a>
  );
}

function AppleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="white"
      className="flex-shrink-0"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      className="flex-shrink-0"
    >
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" fill="#4285F4" />
      <path d="M17.727 8.056L5.66.842C4.862.371 4.1.556 3.609 1.186l.001.001L13.792 12l3.935-3.944z" fill="#00C853" />
      <path d="M17.728 15.944L13.792 12 3.609 22.814c.491.63 1.253.815 2.051.344l12.068-7.214z" fill="#F44336" />
      <path d="M21.39 12c0-.658-.376-1.295-1.101-1.729l-2.562-1.53L13.792 12l3.935 3.944 2.563-1.215c.725-.434 1.101-1.071 1.101-1.729z" fill="#FFD500" />
    </svg>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { APP_STORE_URL, GOOGLE_PLAY_URL } from '@/lib/constants';

function AppleIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M16.4 12.7c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-1 2.3-2c.7-1.1 1-2.2 1-2.3 0 0-2-.8-2-3.1zM14.5 6.3c.5-.7.9-1.6.8-2.6-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.3-1z" />
    </svg>
  );
}

function PlayIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M5 3.5v17l14-8.5z" />
    </svg>
  );
}

function StoreButton({
  icon,
  top,
  bottom,
  light = false,
  href,
}: {
  icon: 'apple' | 'play';
  top: string;
  bottom: string;
  light?: boolean;
  href: string;
}) {
  const bg = light ? '#FFFFFF' : '#1E1813';
  const fg = light ? '#1E1813' : '#F2EADC';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[11px] no-underline transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: bg,
        color: fg,
        padding: '11px 18px 11px 16px',
        borderRadius: 14,
        border: light ? '1px solid rgba(30,24,19,0.10)' : 'none',
        boxShadow: light
          ? '0 1px 2px rgba(30,24,19,0.05)'
          : '0 6px 18px rgba(30,24,19,0.18)',
      }}
    >
      {icon === 'apple' ? (
        <AppleIcon size={24} color={fg} />
      ) : (
        <PlayIcon size={24} color={fg} />
      )}
      <span className="flex flex-col text-left" style={{ lineHeight: 1.15 }}>
        <span className="font-ui text-[10.5px] tracking-[0.3px] opacity-70">
          {top}
        </span>
        <span className="font-ui text-[16px] font-semibold -tracking-[0.2px]">
          {bottom}
        </span>
      </span>
    </a>
  );
}

export function StoreButtons({ light = false }: { light?: boolean }) {
  const t = useTranslations('common');

  return (
    <div className="flex gap-3 flex-wrap">
      <StoreButton
        icon="apple"
        top={t('downloadFromAppStore')}
        bottom={t('appStore')}
        light={light}
        href={APP_STORE_URL}
      />
      <StoreButton
        icon="play"
        top={t('availableOnGooglePlay')}
        bottom={t('googlePlay')}
        light={light}
        href={GOOGLE_PLAY_URL}
      />
    </div>
  );
}

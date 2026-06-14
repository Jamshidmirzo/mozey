'use client';

import { WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StoreButtons } from '@/components/ui/store-buttons';
import { PhonePreview } from '@/components/ui/phone-preview';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section
      id="top"
      className="mx-auto max-w-[1200px]"
      style={{ padding: '150px clamp(20px, 4vw, 40px) 70px' }}
    >
      <div
        className="hero-grid grid items-center"
        style={{
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: 'clamp(32px, 5vw, 72px)',
        }}
      >
        {/* Left column */}
        <div>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-[9px] rounded-full mb-[26px]"
            style={{ padding: '8px 14px', background: 'rgba(21,94,122,0.08)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              style={{ boxShadow: '0 0 0 3px rgba(21,94,122,0.14)' }}
            />
            <span className="font-mono text-xs font-semibold tracking-[1.4px] text-primary uppercase">
              {t('badge')}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-serif font-medium text-ink m-0"
            style={{
              fontSize: 'clamp(40px, 6vw, 66px)',
              lineHeight: 1.02,
              letterSpacing: -1.2,
            }}
          >
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
            <br />
            <span className="italic text-primary">{t('titleLine3')}</span>
          </h1>

          {/* Subtitle */}
          <p className="font-ui text-[19px] leading-[1.6] text-ink2 max-w-[520px] mt-6">
            {t('subtitle')}
          </p>

          {/* Store buttons */}
          <div className="mt-8">
            <StoreButtons />
          </div>

          {/* Offline badge */}
          <div className="flex items-center gap-[9px] mt-[22px] font-ui text-[14.5px] text-ink3">
            <WifiOff size={17} color="#9C6F22" strokeWidth={1.9} />
            {t('offlineBadge')}
          </div>
        </div>

        {/* Right column - Phone */}
        <div className="flex justify-center">
          <PhonePreview />
        </div>
      </div>
    </section>
  );
}

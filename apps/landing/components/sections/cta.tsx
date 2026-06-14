'use client';

import { useTranslations } from 'next-intl';
import { Overline } from '@/components/ui/overline';
import { StoreButtons } from '@/components/ui/store-buttons';

export function CTA() {
  const t = useTranslations('cta');

  return (
    <section
      id="cta"
      className="mx-auto max-w-[1200px]"
      style={{ padding: '40px clamp(20px, 4vw, 40px) 80px' }}
    >
      <div
        className="cta-box relative overflow-hidden text-white"
        style={{
          borderRadius: 30,
          padding: 'clamp(40px, 6vw, 72px)',
          background: '#155E7A',
          backgroundImage:
            'radial-gradient(80% 120% at 100% 0%, rgba(255,255,255,0.16), transparent 55%), radial-gradient(70% 100% at 0% 100%, rgba(156,111,34,0.4), transparent 60%)',
        }}
      >
        {/* Pattern overlay */}
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{
            opacity: 0.1,
            backgroundImage:
              'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.7) 0deg 4deg, transparent 4deg 41deg)',
            backgroundSize: '90px 90px',
          }}
        />

        <div className="relative max-w-[620px]">
          <Overline color="rgba(255,255,255,0.7)">
            {t('overline')}
          </Overline>
          <h2
            className="font-serif font-medium m-0 mt-[14px]"
            style={{
              fontSize: 'clamp(34px, 5vw, 56px)',
              lineHeight: 1.04,
              letterSpacing: -0.8,
            }}
          >
            {t('title')}
          </h2>
          <p className="font-ui text-[18px] leading-[1.6] mt-[18px] max-w-[520px]" style={{ color: 'rgba(255,255,255,0.86)' }}>
            {t('subtitle')}
          </p>
          <div className="mt-[30px]">
            <StoreButtons light />
          </div>
        </div>
      </div>
    </section>
  );
}

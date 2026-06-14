'use client';

import { useTranslations } from 'next-intl';

const statKeys = [
  { value: '281', key: 'museums' },
  { value: '101', key: 'places' },
  { value: '5', key: 'regions' },
  { value: '3', key: 'languages' },
] as const;

export function Stats() {
  const t = useTranslations('stats');

  return (
    <section style={{ background: '#1E1813', color: '#F2EADC' }}>
      <div
        className="mx-auto max-w-[1200px]"
        style={{ padding: '64px clamp(20px, 4vw, 40px)' }}
      >
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          }}
        >
          {statKeys.map((s, i) => (
            <div key={i} className="text-center">
              <div
                className="font-serif font-medium text-white"
                style={{
                  fontSize: 'clamp(46px, 6vw, 68px)',
                  lineHeight: 1,
                  letterSpacing: -1,
                }}
              >
                {s.value}
              </div>
              <div className="font-ui text-[15.5px] mt-[10px]" style={{ color: 'rgba(242,234,220,0.66)' }}>
                {t(s.key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

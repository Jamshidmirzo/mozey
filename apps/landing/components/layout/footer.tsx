'use client';

import { useTranslations } from 'next-intl';
import { StoreButtons } from '@/components/ui/store-buttons';

function Logo({ size = 26, light = false }: { size?: number; light?: boolean }) {
  const ink = light ? '#F2EADC' : '#1E1813';
  return (
    <a href="#top" className="inline-flex items-center gap-[11px] no-underline">
      <span
        className="flex-shrink-0 inline-flex items-center justify-center bg-primary"
        style={{
          width: size,
          height: size,
          borderRadius: 7,
          transform: 'rotate(45deg)',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.25)',
        }}
      >
        <span
          style={{
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: 3,
            background: '#9C6F22',
          }}
        />
      </span>
      <span className="flex flex-col" style={{ lineHeight: 1 }}>
        <span
          className="font-serif font-semibold"
          style={{ fontSize: size * 0.72, letterSpacing: -0.2, color: ink }}
        >
          O&apos;zbekiston
        </span>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: size * 0.34,
            letterSpacing: 3,
            marginTop: 2,
            color: light ? 'rgba(242,234,220,0.6)' : '#A99F8E',
          }}
        >
          Muzeylari
        </span>
      </span>
    </a>
  );
}

export function Footer() {
  const t = useTranslations('footer');

  const cols: [string, [string, string][]][] = [
    [
      t('colCatalog'),
      [
        ['#catalog', t('linkMuseums')],
        ['#catalog', t('linkPlaces')],
        ['#map', t('linkMap')],
      ],
    ],
    [
      t('colApp'),
      [
        ['#about', t('linkFeatures')],
        ['#cta', t('linkDownload')],
        ['#cta', t('linkAudioguide')],
      ],
    ],
    [
      t('colHelp'),
      [
        ['#', t('linkFaq')],
        ['#', t('linkContact')],
        ['#', t('linkPrivacy')],
      ],
    ],
  ];

  return (
    <footer className="bg-sand" style={{ borderTop: '0.5px solid rgba(30,24,19,0.10)' }}>
      <div
        className="mx-auto max-w-[1200px]"
        style={{ padding: '56px clamp(20px, 4vw, 40px) 36px' }}
      >
        <div
          className="footer-grid grid gap-8"
          style={{ gridTemplateColumns: '1.6fr 1fr 1fr 1fr' }}
        >
          {/* Brand column */}
          <div>
            <Logo size={26} />
            <p className="font-ui text-[14.5px] leading-[1.6] text-ink2 mt-[18px] max-w-[300px]">
              {t('description')}
            </p>
            <div className="mt-5">
              <StoreButtons />
            </div>
          </div>

          {/* Link columns */}
          {cols.map((c, i) => (
            <div key={i}>
              <div className="font-mono text-[11.5px] tracking-[1.5px] uppercase text-ink3 mb-4">
                {c[0]}
              </div>
              <div className="flex flex-col gap-3">
                {c[1].map((l, j) => (
                  <a
                    key={j}
                    href={l[0]}
                    className="font-ui text-[15px] text-ink2 no-underline transition-colors duration-200 hover:text-primary"
                  >
                    {l[1]}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex items-center justify-between flex-wrap gap-4 mt-11 pt-6"
          style={{ borderTop: '0.5px solid rgba(30,24,19,0.10)' }}
        >
          <span className="font-ui text-[13.5px] text-ink3">
            &copy; 2026 {t('copyright')}
          </span>
          <div className="flex items-center gap-[10px]">
            <span className="font-mono text-[11px] tracking-[2px] text-ink3 uppercase">
              Powered by
            </span>
            <span className="font-serif text-[18px] font-semibold text-ink tracking-[1px]">
              VIBESOFT
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { WifiOff, Map, Bookmark, Headphones } from 'lucide-react';
import { useTranslations } from 'next-intl';

const featureKeys = [
  { icon: WifiOff, key: 'offline' },
  { icon: Map, key: 'map' },
  { icon: Bookmark, key: 'bookmarks' },
  { icon: Headphones, key: 'audio' },
] as const;

export function Features() {
  const t = useTranslations('features');

  return (
    <section
      id="about"
      className="mx-auto max-w-[1200px]"
      style={{ padding: '40px clamp(20px, 4vw, 40px) 30px' }}
    >
      <div
        className="grid gap-[18px]"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {featureKeys.map((f, i) => (
          <div
            key={i}
            className="bg-surface"
            style={{
              borderRadius: 22,
              padding: '26px 24px',
              border: '0.5px solid rgba(30,24,19,0.06)',
              boxShadow: '0 1px 2px rgba(30,24,19,0.04)',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: 'rgba(21,94,122,0.09)',
              }}
            >
              <f.icon size={23} color="#155E7A" strokeWidth={1.9} />
            </div>
            <div className="font-serif text-[22px] font-medium text-ink -tracking-[0.3px] mt-[18px]">
              {t(`${f.key}.title`)}
            </div>
            <div className="font-ui text-[14.5px] leading-[1.5] text-ink2 mt-[9px]">
              {t(`${f.key}.text`)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

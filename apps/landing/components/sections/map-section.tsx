'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MapCanvas } from '@/components/ui/map-canvas';
import { Photo } from '@/components/ui/photo';
import { Overline } from '@/components/ui/overline';
import { Chip } from '@/components/ui/chip';
import { MUSEUMS, PLACES, REGION_POS } from '@/lib/constants';

function jitter(seed: number) {
  const n = ((seed * 9301 + 49297) % 233280) / 233280;
  return (n - 0.5) * 12;
}

export function MapSection() {
  const t = useTranslations('mapSection');
  const items = [
    ...PLACES,
    ...MUSEUMS.filter((m) => m.region !== 'Ташкент'),
  ].slice(0, 11);

  const pinsData = items.map((it, i) => {
    const p = REGION_POS[it.region] || { x: 50, y: 50 };
    return { item: it, x: p.x + jitter(i + 1), y: p.y + jitter(i + 7) };
  });

  const [sel, setSel] = useState(0);
  const cur = pinsData[sel].item;
  const pins = pinsData.map((p, i) => ({
    x: p.x,
    y: p.y,
    active: i === sel,
    label: p.item.name,
  }));

  return (
    <section
      id="map"
      className="mx-auto max-w-[1200px]"
      style={{ padding: '60px clamp(20px, 4vw, 40px)' }}
    >
      {/* Header */}
      <div className="text-center mb-9">
        <Overline color="#9C6F22">{t('overline')}</Overline>
        <h2
          className="font-serif font-medium text-ink m-0 mt-[10px] leading-[1.0]"
          style={{
            fontSize: 'clamp(32px, 4.4vw, 48px)',
            letterSpacing: -0.8,
          }}
        >
          {t('title')}
        </h2>
        <p className="font-ui text-[17px] leading-[1.6] text-ink2 max-w-[560px] mx-auto mt-[14px]">
          {t('subtitle')}
        </p>
      </div>

      {/* Map + preview grid */}
      <div
        className="map-grid grid items-stretch gap-[22px]"
        style={{ gridTemplateColumns: '1.7fr 1fr' }}
      >
        {/* Map */}
        <div
          className="overflow-hidden"
          style={{
            borderRadius: 24,
            border: '0.5px solid rgba(30,24,19,0.10)',
            boxShadow: '0 14px 34px rgba(30,24,19,0.1)',
            minHeight: 440,
          }}
        >
          <MapCanvas height={480} pins={pins} onPin={setSel} />
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          {/* Preview card */}
          <div
            className="text-left overflow-hidden bg-surface"
            style={{
              borderRadius: 22,
              boxShadow: '0 10px 28px rgba(30,24,19,0.1)',
              padding: 0,
            }}
          >
            <Photo
              region={cur.region}
              radius={0}
              scrim
              label={false}
              style={{ height: 200 }}
            >
              <div className="absolute left-[18px] right-[18px] bottom-4 z-[3]">
                <Overline color="rgba(255,255,255,0.85)" className="!text-[10.5px]">
                  {cur.region} · {cur.tag}
                </Overline>
                <div className="font-serif text-[26px] font-medium text-white leading-[1.04] mt-[5px]">
                  {cur.name}
                </div>
              </div>
            </Photo>
            <div style={{ padding: '16px 18px 18px' }}>
              <div className="font-ui text-[14.5px] leading-[1.5] text-ink2">
                {cur.short}
              </div>
              <div className="flex gap-2 mt-[14px]">
                {cur.hours && <Chip icon="clock">{cur.hours}</Chip>}
                {cur.price && <Chip icon="ticket">{cur.price}</Chip>}
              </div>
            </div>
          </div>

          {/* Info strip */}
          <div
            className="flex items-center gap-[9px] font-ui text-[14px] text-ink2"
            style={{
              padding: '14px 18px',
              borderRadius: 16,
              background: 'rgba(21,94,122,0.07)',
            }}
          >
            <MapPin size={18} color="#155E7A" strokeWidth={1.9} />
            {t('nearbyPoints', { count: pinsData.length })}
          </div>
        </div>
      </div>
    </section>
  );
}

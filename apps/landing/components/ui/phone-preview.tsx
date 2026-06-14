'use client';

import { Search, Compass, Bookmark, Map, SlidersHorizontal } from 'lucide-react';
import { Photo } from './photo';
import { Overline } from './overline';
import { MUSEUMS } from '@/lib/constants';

function MiniCard({ item }: { item: typeof MUSEUMS[0] }) {
  return (
    <div
      className="flex gap-[11px] bg-white"
      style={{
        padding: 9,
        borderRadius: 16,
        boxShadow:
          '0 1px 2px rgba(30,24,19,0.05), 0 6px 16px rgba(30,24,19,0.05)',
      }}
    >
      <Photo
        region={item.region}
        radius={11}
        label={false}
        className="flex-shrink-0"
        style={{ width: 74, height: 74 }}
      />
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <Overline color="#155E7A" className="!text-[9.5px] !tracking-[1.6px]">
          {item.region}
        </Overline>
        <div className="font-serif text-[16px] font-medium text-ink leading-[1.08] mt-[3px]">
          {item.name}
        </div>
        <div
          className="font-ui text-[11.5px] text-ink2 leading-[1.3] mt-1 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.short}
        </div>
      </div>
    </div>
  );
}

export function PhonePreview() {
  const featured = MUSEUMS[0];
  const tabItems = [
    { icon: Compass, label: 'Обзор', active: true },
    { icon: Bookmark, label: 'Избранное', active: false },
    { icon: Map, label: 'Карта', active: false },
    { icon: SlidersHorizontal, label: 'Ещё', active: false },
  ];

  return (
    <div
      className="flex-shrink-0"
      style={{
        width: 320,
        borderRadius: 46,
        padding: 11,
        background: '#161310',
        boxShadow:
          '0 40px 80px rgba(30,24,19,0.32), 0 8px 24px rgba(30,24,19,0.2), inset 0 0 0 2px rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="relative overflow-hidden bg-canvas"
        style={{ borderRadius: 36, height: 620 }}
      >
        {/* Notch */}
        <div
          className="absolute top-[10px] left-1/2 -translate-x-1/2 z-10"
          style={{
            width: 108,
            height: 30,
            background: '#161310',
            borderRadius: 999,
          }}
        />
        {/* Time */}
        <div className="absolute top-4 left-[22px] font-ui text-[13px] font-semibold text-ink z-[9]">
          9:41
        </div>

        {/* Content */}
        <div
          className="h-full overflow-hidden"
          style={{ padding: '50px 16px 16px' }}
        >
          <div className="flex items-end justify-between">
            <div>
              <Overline className="!text-[9.5px] !tracking-[1.6px]">
                O&apos;zbekiston · 281 музей
              </Overline>
              <div className="font-serif text-[30px] font-medium text-ink -tracking-[0.5px] mt-[5px]">
                Обзор
              </div>
            </div>
            <div className="flex items-center gap-[5px] rounded-full mb-[3px]" style={{ padding: '5px 9px', background: 'rgba(21,94,122,0.08)' }}>
              <span className="w-[5px] h-[5px] rounded-full bg-primary" />
              <span className="font-mono text-[9px] font-semibold tracking-[0.5px] text-primary uppercase">
                Офлайн
              </span>
            </div>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 mt-[14px]"
            style={{
              height: 40,
              padding: '0 13px',
              borderRadius: 999,
              background: '#fff',
              border: '0.5px solid rgba(30,24,19,0.10)',
            }}
          >
            <Search size={16} color="#A99F8E" strokeWidth={2} />
            <span className="font-ui text-[14px] text-ink3">Поиск музеев</span>
          </div>

          {/* Featured */}
          <div className="mt-[14px] overflow-hidden relative" style={{ borderRadius: 18, boxShadow: '0 10px 24px rgba(30,24,19,0.16)' }}>
            <Photo region={featured.region} radius={18} scrim label={false} style={{ height: 150 }}>
              <div className="absolute left-[14px] right-[14px] bottom-[13px] z-[3]">
                <Overline color="rgba(255,255,255,0.85)" className="!text-[9px] !tracking-[1.4px]">
                  {featured.region} · {featured.tag}
                </Overline>
                <div className="font-serif text-[21px] font-medium text-white leading-[1.02] mt-1">
                  {featured.name}
                </div>
              </div>
            </Photo>
          </div>

          {/* Mini cards */}
          <div className="flex flex-col gap-[9px] mt-[14px]">
            <MiniCard item={MUSEUMS[1]} />
            <MiniCard item={MUSEUMS[2]} />
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="absolute left-[14px] right-[14px] bottom-[14px] flex z-[8]"
          style={{
            padding: 6,
            borderRadius: 999,
            background: 'rgba(247,243,235,0.72)',
            backdropFilter: 'blur(22px) saturate(180%)',
            WebkitBackdropFilter: 'blur(22px) saturate(180%)',
            border: '0.5px solid rgba(30,24,19,0.07)',
            boxShadow: '0 10px 30px rgba(30,24,19,0.14)',
          }}
        >
          {tabItems.map((tb) => (
            <div
              key={tb.label}
              className="flex-1 flex flex-col items-center gap-[3px]"
              style={{ padding: '5px 0' }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 34,
                  height: 26,
                  background: tb.active ? '#155E7A' : 'transparent',
                }}
              >
                <tb.icon
                  size={17}
                  color={tb.active ? '#fff' : '#A99F8E'}
                  strokeWidth={1.9}
                />
              </div>
              <span
                className="font-ui text-[8.5px] font-semibold"
                style={{ color: tb.active ? '#1E1813' : '#A99F8E' }}
              >
                {tb.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

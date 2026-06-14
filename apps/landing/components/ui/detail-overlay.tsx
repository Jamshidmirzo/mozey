'use client';

import { useEffect } from 'react';
import {
  ChevronLeft,
  Share2,
  Bookmark,
  Clock,
  Info,
  Ticket,
  MapPin,
  ArrowUpRight,
  Headphones,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Photo } from './photo';
import { Overline } from './overline';
import { Chip } from './chip';
import { MapCanvas } from './map-canvas';
import type { MuseumItem } from '@/lib/constants';

function FactRow({
  icon: Icon,
  label,
  value,
  last = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-[14px]"
      style={{
        padding: '15px 0',
        borderBottom: last ? 'none' : '0.5px solid rgba(30,24,19,0.10)',
      }}
    >
      <Icon size={20} color="#155E7A" strokeWidth={1.9} />
      <span className="font-ui text-[16px] text-ink2 flex-1">{label}</span>
      <span className="font-ui text-[16px] font-semibold text-ink">{value}</span>
    </div>
  );
}

interface DetailOverlayProps {
  item: MuseumItem;
  category: 'museums' | 'historical';
  saved: boolean;
  allItems?: MuseumItem[];
  onClose: () => void;
  onSave: (id: string) => void;
  onOpen: (id: string) => void;
}

export function DetailOverlay({
  item,
  category,
  saved,
  allItems = [],
  onClose,
  onSave,
  onOpen,
}: DetailOverlayProps) {
  const t = useTranslations('detail');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const related = allItems.filter((i) => i.id !== item.id).slice(0, 5);
  const desc = item.long || item.short;
  const drop = desc.charAt(0);

  return (
    <div className="fixed inset-0 z-[200] flex justify-center animate-fade-in">
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: 'rgba(20,16,11,0.55)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        className="relative w-full max-w-[880px] bg-canvas overflow-y-auto animate-sheet-up"
        style={{ boxShadow: '0 0 80px rgba(0,0,0,0.4)' }}
      >
        <Photo region={item.region} regionSlug={item.regionSlug} photoUrl={item.photoUrl} radius={0} scrim label={false} style={{ height: 420 }}>
          <div className="absolute top-[22px] left-[22px] right-[22px] flex justify-between z-[5]">
            <button onClick={onClose} className="glass-btn">
              <ChevronLeft size={22} color="#fff" strokeWidth={2.4} />
            </button>
            <div className="flex gap-[11px]">
              <button className="glass-btn">
                <Share2 size={19} color="#fff" strokeWidth={2} />
              </button>
              <button onClick={() => onSave(item.id)} className="glass-btn">
                <Bookmark
                  size={20}
                  color="#fff"
                  strokeWidth={2}
                  fill={saved ? '#fff' : 'none'}
                />
              </button>
            </div>
          </div>
          <div className="absolute left-8 right-8 bottom-[34px] z-[5]">
            <Overline color="rgba(255,255,255,0.85)">
              {item.region} {item.type && <>· {item.type}</>}
            </Overline>
            <div
              className="font-serif text-[46px] font-medium leading-[1.0] text-white -tracking-[0.6px] mt-[9px]"
              style={{ textShadow: '0 2px 18px rgba(0,0,0,0.35)' }}
            >
              {item.name}
            </div>
          </div>
        </Photo>

        <div
          className="relative -mt-[26px] bg-canvas"
          style={{
            borderRadius: '30px 30px 0 0',
            padding: '30px clamp(24px, 6vw, 56px) 56px',
          }}
        >
          <div className="flex gap-[9px] flex-wrap">
            {item.tag && <Chip icon="star" tone="gold">{item.tag}</Chip>}
            {item.hours && <Chip icon="clock">{item.hours}</Chip>}
            {item.era && <Chip icon="info">{item.era}</Chip>}
            {item.price && <Chip icon="ticket">{item.price}</Chip>}
          </div>

          {desc && (
            <p className="font-ui text-[18px] leading-[1.72] text-ink mt-6 mb-0 whitespace-pre-line">
              <span className="float-left font-serif text-[64px] leading-[0.78] font-medium text-primary mr-3 mt-[6px]">
                {drop}
              </span>
              {desc.slice(1)}
            </p>
          )}

          <div className="detail-grid grid grid-cols-2 gap-[clamp(24px,5vw,48px)] mt-10 items-start">
            <div>
              <Overline>{t('info')}</Overline>
              <div className="mt-2">
                {item.hours && (
                  <FactRow icon={Clock} label={t('hours')} value={item.hours} />
                )}
                {item.price && (
                  <FactRow icon={Ticket} label={t('ticket')} value={item.price} />
                )}
                <FactRow icon={Headphones} label={t('languages')} value="uz · ru · en" />
                {item.era && (
                  <FactRow icon={Info} label={t('foundation')} value={item.era} last />
                )}
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-3">
                <Overline>{t('location')}</Overline>
                {item.coords && item.coords !== '0, 0' && (
                  <span className="font-mono text-[11.5px] text-ink3">
                    {item.coords}
                  </span>
                )}
              </div>
              <div
                className="overflow-hidden"
                style={{
                  borderRadius: 20,
                  border: '0.5px solid rgba(30,24,19,0.10)',
                }}
              >
                <MapCanvas
                  height={180}
                  pins={[{ x: 50, y: 52, active: true, label: item.name }]}
                />
                {item.coords && item.coords !== '0, 0' && (
                  <a
                    href={`https://www.google.com/maps?q=${item.coords.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full border-none cursor-pointer flex items-center justify-center gap-[9px] bg-primary text-white font-ui text-[15.5px] font-bold -tracking-[0.2px]"
                    style={{ padding: 16 }}
                  >
                    <MapPin size={17} color="#fff" strokeWidth={2} />
                    {t('openGoogleMaps')}
                    <ArrowUpRight size={15} color="#fff" strokeWidth={2.2} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-11">
              <div className="font-serif text-[26px] font-medium text-ink -tracking-[0.3px] mb-4">
                {category === 'museums' ? t('otherMuseums') : t('nearby')}
              </div>
              <div className="flex gap-[14px] overflow-x-auto pb-[6px] hide-scroll">
                {related.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => onOpen(it.id)}
                    className="border-none bg-transparent p-0 cursor-pointer text-left flex-shrink-0"
                    style={{ width: 180 }}
                  >
                    <Photo region={it.region} regionSlug={it.regionSlug} photoUrl={it.photoUrl} radius={16} style={{ height: 124 }} />
                    <div className="font-serif text-[18px] font-medium text-ink mt-[9px] leading-[1.1]">
                      {it.name}
                    </div>
                    <div className="font-ui text-[13px] text-ink2 mt-[3px]">
                      {it.region}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

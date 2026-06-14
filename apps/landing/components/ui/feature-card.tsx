'use client';

import { Bookmark, Star, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Photo } from './photo';
import { Overline } from './overline';
import type { MuseumItem } from '@/lib/constants';

interface FeatureCardProps {
  item: MuseumItem;
  saved: boolean;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
}

export function FeatureCard({ item, saved, onOpen, onSave }: FeatureCardProps) {
  const t = useTranslations('catalog');

  return (
    <div
      role="button"
      onClick={() => onOpen(item.id)}
      className="cursor-pointer overflow-hidden relative"
      style={{
        borderRadius: 26,
        boxShadow: '0 18px 44px rgba(30,24,19,0.18)',
      }}
    >
      <Photo
        region={item.region}
        regionSlug={item.regionSlug}
        photoUrl={item.photoUrl}
        radius={26}
        scrim
        label={false}
        style={{ height: 380, minHeight: 380 }}
      >
        {/* Recommended badge */}
        <div className="absolute top-[18px] left-[18px] z-[3]">
          <span
            className="inline-flex items-center gap-[7px] rounded-full font-mono text-[11px] tracking-[1.6px] uppercase text-white font-semibold"
            style={{
              padding: '7px 13px',
              background: 'rgba(255,255,255,0.16)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <Star size={12} fill="#F0C868" color="#F0C868" strokeWidth={0} />
            {t('recommended')}
          </span>
        </div>

        {/* Save button */}
        <div
          className="absolute top-4 right-4 z-[3]"
          onClick={(e) => {
            e.stopPropagation();
            onSave(item.id);
          }}
        >
          <button
            className="w-11 h-11 rounded-full border-none cursor-pointer flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              boxShadow:
                'inset 0 0 0 0.5px rgba(255,255,255,0.4), 0 4px 14px rgba(0,0,0,0.16)',
            }}
          >
            <Bookmark
              size={21}
              color="#fff"
              strokeWidth={2}
              fill={saved ? '#fff' : 'none'}
            />
          </button>
        </div>

        {/* Content */}
        <div className="absolute left-[26px] right-[26px] bottom-[26px] z-[3] max-w-[620px]">
          <Overline color="rgba(255,255,255,0.85)">
            {item.region} {item.tag && <>· {item.tag}</>}
          </Overline>
          <div
            className="font-serif text-[42px] font-medium leading-[1.0] text-white -tracking-[0.6px] mt-[9px]"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}
          >
            {item.name}
          </div>
          <div className="font-ui text-[16px] leading-[1.5] text-white/90 mt-[11px]">
            {item.short}
          </div>
          <div className="inline-flex items-center gap-2 mt-[18px] font-ui text-[15px] font-semibold text-white">
            {t('openCard')}{' '}
            <ArrowUpRight size={16} color="#fff" strokeWidth={2.2} />
          </div>
        </div>
      </Photo>
    </div>
  );
}

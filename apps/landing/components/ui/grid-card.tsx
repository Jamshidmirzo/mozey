'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Photo } from './photo';
import { Overline } from './overline';
import { Chip } from './chip';
import type { MuseumItem } from '@/lib/constants';

interface GridCardProps {
  item: MuseumItem;
  saved: boolean;
  onOpen: (id: string) => void;
  onSave: (id: string) => void;
}

export function GridCard({ item, saved, onOpen, onSave }: GridCardProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => onOpen(item.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="cursor-pointer bg-surface overflow-hidden flex flex-col"
      style={{
        borderRadius: 22,
        border: '0.5px solid rgba(30,24,19,0.06)',
        boxShadow: hover
          ? '0 18px 40px rgba(30,24,19,0.13)'
          : '0 1px 2px rgba(30,24,19,0.05), 0 8px 22px rgba(30,24,19,0.05)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition:
          'transform 280ms cubic-bezier(.2,.8,.2,1), box-shadow 280ms ease',
      }}
    >
      <div className="relative">
        <Photo region={item.region} regionSlug={item.regionSlug} photoUrl={item.photoUrl} radius={0} style={{ height: 188 }}>
          <div
            className="absolute top-3 right-3 z-[4]"
            onClick={(e) => {
              e.stopPropagation();
              onSave(item.id);
            }}
          >
            <button
              className="w-[38px] h-[38px] rounded-full border-none cursor-pointer flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(14px) saturate(160%)',
                WebkitBackdropFilter: 'blur(14px) saturate(160%)',
                boxShadow:
                  'inset 0 0 0 0.5px rgba(255,255,255,0.4), 0 4px 14px rgba(0,0,0,0.16)',
              }}
            >
              <Bookmark
                size={19}
                color="#fff"
                strokeWidth={2}
                fill={saved ? '#fff' : 'none'}
              />
            </button>
          </div>
        </Photo>
      </div>
      <div className="p-[15px_17px_18px] flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <Overline color="#155E7A">{item.region}</Overline>
          <span className="font-mono text-[10.5px] tracking-[1px] text-ink3 uppercase">
            {item.type}
          </span>
        </div>
        <div className="font-serif text-[22px] font-medium leading-[1.1] text-ink -tracking-[0.3px] mt-[7px]">
          {item.name}
        </div>
        <div className="font-ui text-[14px] leading-[1.45] text-ink2 mt-2 flex-1">
          {item.short}
        </div>
        <div className="flex items-center gap-2 mt-[15px] flex-wrap">
          <Chip icon="star" tone="gold">
            {item.tag}
          </Chip>
          {item.hours && <Chip icon="clock">{item.hours}</Chip>}
        </div>
      </div>
    </div>
  );
}

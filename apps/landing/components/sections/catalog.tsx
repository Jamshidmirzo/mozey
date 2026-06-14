'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Switcher } from '@/components/ui/switcher';
import { Overline } from '@/components/ui/overline';
import { GridCard } from '@/components/ui/grid-card';
import { FeatureCard } from '@/components/ui/feature-card';
import { DetailOverlay } from '@/components/ui/detail-overlay';
import {
  MUSEUMS,
  PLACES,
  STORAGE_KEY,
  type MuseumItem,
} from '@/lib/constants';
import { fetchMuseums, fetchPlaces } from '@/lib/api';

function loadSaved(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(s) ? new Set(s) : new Set();
  } catch {
    return new Set();
  }
}

export function Catalog() {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const [category, setCategory] = useState<'museums' | 'historical'>('museums');
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [saved, setSaved] = useState<Set<string>>(() => loadSaved());
  const [detailId, setDetailId] = useState<string | null>(null);

  const [museums, setMuseums] = useState<MuseumItem[]>(MUSEUMS);
  const [places, setPlaces] = useState<MuseumItem[]>(PLACES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [m, p] = await Promise.all([fetchMuseums(locale), fetchPlaces(locale)]);
      if (!cancelled) {
        setMuseums(m);
        setPlaces(p);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(saved)));
  }, [saved]);

  const onSave = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(Array.from(prev));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onOpen = useCallback((id: string) => {
    setDetailId(id);
  }, []);

  const base = category === 'museums' ? museums : places;
  const q = query.trim().toLowerCase();
  const filtered = base.filter(
    (it) =>
      (region === 'all' || it.region === region) &&
      (q === '' ||
        it.name.toLowerCase().includes(q) ||
        it.short.toLowerCase().includes(q) ||
        it.region.toLowerCase().includes(q))
  );

  const availableRegions = Array.from(new Set(base.map((it) => it.region))).sort();

  const showFeatured = region === 'all' && q === '' && filtered.length > 1;
  const featured = filtered[0];
  const grid = showFeatured
    ? filtered.filter((i) => i.id !== featured?.id)
    : filtered;

  const chips: [string, string][] = [
    ['all', t('allRegions')],
    ...availableRegions.map((r) => [r, r] as [string, string]),
  ];

  const allItems = [...museums, ...places];
  const detItem = detailId ? allItems.find((i) => i.id === detailId) : null;
  const detCat =
    detItem && museums.some((m) => m.id === detItem.id)
      ? 'museums'
      : 'historical';

  return (
    <>
      <section
        id="catalog"
        className="mx-auto max-w-[1200px]"
        style={{ padding: '70px clamp(20px, 4vw, 40px) 40px' }}
      >
        <div className="flex items-end justify-between gap-6 flex-wrap mb-7">
          <div>
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
          </div>
          <Switcher
            value={category}
            onChange={(k) => {
              setCategory(k as 'museums' | 'historical');
              setRegion('all');
              setQuery('');
            }}
            options={[
              { key: 'museums', label: t('switchMuseums', { count: museums.length }) },
              { key: 'historical', label: t('switchPlaces', { count: places.length }) },
            ]}
          />
        </div>

        <div className="flex gap-[14px] flex-wrap items-center mb-[26px]">
          <div
            className="flex items-center gap-[10px] bg-surface"
            style={{
              height: 48,
              padding: '0 16px',
              borderRadius: 999,
              border: '0.5px solid rgba(30,24,19,0.10)',
              flex: '1 1 280px',
              minWidth: 220,
              boxShadow: '0 1px 2px rgba(30,24,19,0.04)',
            }}
          >
            <Search size={18} color="#A99F8E" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                category === 'museums'
                  ? t('searchMuseums')
                  : t('searchPlaces')
              }
              className="flex-1 border-none outline-none bg-transparent font-ui text-[16px] text-ink -tracking-[0.2px] placeholder:text-ink3"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="border-none bg-transparent cursor-pointer p-0 flex"
              >
                <X size={17} color="#A99F8E" strokeWidth={2.2} />
              </button>
            )}
          </div>
          <div className="flex gap-[9px] overflow-x-auto flex-1 hide-scroll">
            {chips.map(([k, l]) => {
              const active = region === k;
              return (
                <button
                  key={k}
                  onClick={() => setRegion(k)}
                  className="flex-shrink-0 cursor-pointer whitespace-nowrap font-ui text-[14px] font-semibold -tracking-[0.1px] transition-all duration-200"
                  style={{
                    padding: '9px 16px',
                    borderRadius: 999,
                    border: active
                      ? '1px solid #155E7A'
                      : '0.5px solid rgba(30,24,19,0.10)',
                    background: active ? '#155E7A' : '#FFFFFF',
                    color: active ? '#fff' : '#736A5C',
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-ink2 gap-3">
            <Loader2 size={24} className="animate-spin" color="#155E7A" />
            <span className="font-ui text-[16px]">{t('loading')}</span>
          </div>
        ) : (
          <>
            {showFeatured && featured && (
              <div className="mb-6">
                <FeatureCard
                  item={featured}
                  saved={saved.has(featured.id)}
                  onOpen={onOpen}
                  onSave={onSave}
                />
              </div>
            )}

            <div className="flex items-baseline justify-between mb-4">
              <div className="font-serif text-[22px] font-medium text-ink">
                {region === 'all'
                  ? category === 'museums'
                    ? t('allMuseums')
                    : t('allPlaces')
                  : region}
              </div>
              <span className="font-mono text-[12.5px] text-ink3 tracking-[0.5px]">
                {filtered.length}{' '}
                {filtered.length === 1 ? t('countSingular') : t('countPlural')}
              </span>
            </div>

            {grid.length === 0 ? (
              <div className="text-center text-ink2" style={{ padding: '70px 20px' }}>
                <Search size={34} color="#A99F8E" strokeWidth={1.6} />
                <div className="font-serif text-[22px] text-ink mt-4">
                  {t('emptyTitle')}
                </div>
                <div className="font-ui text-[15px] mt-[6px]">
                  {t('emptyText')}
                </div>
              </div>
            ) : (
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                }}
              >
                {grid.map((it) => (
                  <GridCard
                    key={it.id}
                    item={it}
                    saved={saved.has(it.id)}
                    onOpen={onOpen}
                    onSave={onSave}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {detItem && (
        <DetailOverlay
          item={detItem}
          category={detCat as 'museums' | 'historical'}
          saved={saved.has(detItem.id)}
          allItems={detCat === 'museums' ? museums : places}
          onClose={() => setDetailId(null)}
          onSave={onSave}
          onOpen={onOpen}
        />
      )}
    </>
  );
}

'use client';

import { REGION_COLORS } from '@/lib/constants';

interface PhotoProps {
  region: string;
  regionSlug?: string;
  photoUrl?: string;
  radius?: number;
  scrim?: boolean;
  label?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Photo({
  region,
  regionSlug,
  photoUrl,
  radius = 18,
  scrim = false,
  label = true,
  className = '',
  style = {},
  children,
}: PhotoProps) {
  const c = (regionSlug && REGION_COLORS[regionSlug]) || REGION_COLORS['toshkent-shahar'] || { deep: '#2C3A47', light: '#6E8398' };
  const angle = 45;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: radius,
        backgroundColor: c.deep,
        backgroundImage: photoUrl
          ? undefined
          : [
              `radial-gradient(120% 90% at 22% 12%, ${c.light}88 0%, transparent 55%)`,
              `radial-gradient(90% 80% at 90% 100%, ${c.deep} 0%, transparent 60%)`,
              `repeating-linear-gradient(${angle}deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 18px)`,
              `repeating-linear-gradient(${-angle}deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 18px)`,
              `repeating-linear-gradient(${angle}deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 36px)`,
              `linear-gradient(160deg, ${c.light}22, ${c.deep})`,
            ].join(','),
        ...style,
      }}
    >
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}
      {!photoUrl && (
        <div
          className="absolute inset-0 mix-blend-soft-light"
          style={{
            opacity: 0.16,
            backgroundImage:
              'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.6) 0deg 4deg, transparent 4deg 41deg)',
            backgroundSize: '64px 64px',
            backgroundPosition: 'center',
          }}
        />
      )}
      {scrim && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(8,18,24,0.78) 0%, rgba(8,18,24,0.20) 42%, transparent 70%)',
          }}
        />
      )}
      {label && (
        <div className="absolute top-3 left-3.5 z-[2] flex items-center gap-1.5 font-mono text-[10px] tracking-[1.6px] uppercase text-white/80">
          <span className="w-1 h-1 rounded-full bg-white/90" />
          {region}
        </div>
      )}
      {children}
    </div>
  );
}

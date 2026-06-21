'use client';

interface LogoProps {
  size?: number;
  light?: boolean;
}

export function Logo({ size = 26, light = false }: LogoProps) {
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

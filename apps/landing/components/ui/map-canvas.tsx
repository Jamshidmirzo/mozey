'use client';

interface Pin {
  x: number;
  y: number;
  active: boolean;
  label: string;
}

interface MapCanvasProps {
  radius?: number;
  height?: number;
  pins?: Pin[];
  onPin?: (index: number) => void;
  children?: React.ReactNode;
}

export function MapCanvas({
  radius = 0,
  height = 220,
  pins = [],
  onPin,
  children,
}: MapCanvasProps) {
  const base = '#E5DECF';
  const road = 'rgba(255,255,255,0.85)';
  const block = 'rgba(255,255,255,0.4)';
  const water = 'rgba(120,180,196,0.5)';

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height,
        borderRadius: radius,
        background: base,
        backgroundImage: [
          `repeating-linear-gradient(0deg, ${road} 0 2px, transparent 2px 64px)`,
          `repeating-linear-gradient(90deg, ${road} 0 2px, transparent 2px 74px)`,
          `repeating-linear-gradient(34deg, ${block} 0 1px, transparent 1px 34px)`,
        ].join(','),
      }}
    >
      {/* Diagonal road */}
      <div
        className="absolute"
        style={{
          left: '-10%',
          width: '120%',
          height: 16,
          background: road,
          transform: 'rotate(-18deg)',
          top: '38%',
        }}
      />
      {/* Water */}
      <div
        className="absolute"
        style={{
          left: '-10%',
          bottom: '-12%',
          width: '120%',
          height: 54,
          background: water,
          transform: 'rotate(-9deg)',
          borderRadius: 40,
          filter: 'blur(0.5px)',
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 70px rgba(120,100,60,0.14)' }}
      />
      {/* Pins */}
      {pins.map((p, i) => (
        <button
          key={i}
          onClick={() => onPin?.(i)}
          className="absolute border-none bg-transparent p-0"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: 'translate(-50%,-100%)',
            zIndex: p.active ? 5 : 2,
            cursor: onPin ? 'pointer' : 'default',
          }}
        >
          <div className="flex flex-col items-center" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.24))' }}>
            {p.active && (
              <div
                className="rounded-full mb-[5px] font-ui text-[12.5px] font-bold text-white whitespace-nowrap"
                style={{
                  padding: '5px 12px',
                  background: '#155E7A',
                }}
              >
                {p.label}
              </div>
            )}
            <div
              className="rounded-full"
              style={{
                width: p.active ? 18 : 13,
                height: p.active ? 18 : 13,
                background: p.active ? '#155E7A' : '#9C6F22',
                border: '2.5px solid #fff',
              }}
            />
          </div>
        </button>
      ))}
      {children}
    </div>
  );
}

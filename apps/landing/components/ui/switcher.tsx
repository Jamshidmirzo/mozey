'use client';

interface SwitcherOption {
  key: string;
  label: string;
}

interface SwitcherProps {
  value: string;
  onChange: (key: string) => void;
  options: SwitcherOption[];
}

export function Switcher({ value, onChange, options }: SwitcherProps) {
  const idx = options.findIndex((o) => o.key === value);

  return (
    <div
      className="relative inline-flex p-[5px] rounded-full"
      style={{
        background: 'rgba(30,24,19,0.05)',
        border: '0.5px solid rgba(30,24,19,0.10)',
      }}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-[5px] bottom-[5px] rounded-full bg-primary"
        style={{
          left: `calc(${idx * 50}% + 5px)`,
          width: `calc(50% - 10px)`,
          boxShadow: '0 1px 5px rgba(21,94,122,0.32)',
          transition: 'left 380ms cubic-bezier(.34,1.2,.4,1)',
        }}
      />
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className="relative z-[1] flex-1 border-none bg-transparent cursor-pointer rounded-full whitespace-nowrap font-ui text-[15px] font-semibold -tracking-[0.2px] transition-colors duration-200"
            style={{
              padding: '10px 26px',
              color: active ? '#FFFFFF' : '#736A5C',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

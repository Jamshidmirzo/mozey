interface OverlineProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Overline({ children, color, className = '' }: OverlineProps) {
  return (
    <div
      className={`font-mono text-xs tracking-[2.5px] uppercase font-medium ${className}`}
      style={{ color: color || '#A99F8E' }}
    >
      {children}
    </div>
  );
}

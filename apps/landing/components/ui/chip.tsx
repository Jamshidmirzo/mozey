import {
  Star,
  Clock,
  Info,
  Ticket,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  star: Star,
  clock: Clock,
  info: Info,
  ticket: Ticket,
};

interface ChipProps {
  children: React.ReactNode;
  icon?: string;
  tone?: 'gold' | 'default';
}

export function Chip({ children, icon, tone }: ChipProps) {
  const isGold = tone === 'gold';
  const IconComp = icon ? ICON_MAP[icon] : null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap font-ui text-[13px] font-semibold -tracking-[0.1px]"
      style={{
        padding: '6px 11px',
        background: isGold ? 'rgba(156,111,34,0.10)' : 'rgba(30,24,19,0.05)',
        color: isGold ? '#9C6F22' : '#736A5C',
      }}
    >
      {IconComp && (
        <IconComp
          size={14}
          strokeWidth={2}
          color={isGold ? '#9C6F22' : '#736A5C'}
        />
      )}
      {children}
    </span>
  );
}

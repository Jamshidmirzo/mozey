import * as React from 'react';
import { cn } from './utils';

export interface LogoProps extends React.SVGAttributes<SVGElement> {
  size?: number;
  showText?: boolean;
}

function Logo({ className, size = 40, showText = false, ...props }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        {...props}
      >
        <rect width="48" height="48" rx="10" fill="#1B365D" />
        <path
          d="M24 8L36 16V32L24 40L12 32V16L24 8Z"
          fill="none"
          stroke="#D4A853"
          strokeWidth="2"
        />
        <path
          d="M24 12L32 17.5V28.5L24 34L16 28.5V17.5L24 12Z"
          fill="#D4A853"
          fillOpacity="0.15"
        />
        <rect x="20" y="18" width="8" height="14" rx="1" fill="#D4A853" />
        <rect x="22" y="20" width="4" height="5" rx="0.5" fill="#1B365D" />
        <path d="M20 18L24 13L28 18" fill="#D4A853" />
        <rect
          x="14"
          y="24"
          width="5"
          height="8"
          rx="1"
          fill="#D4A853"
          fillOpacity="0.7"
        />
        <rect x="15" y="25.5" width="3" height="3" rx="0.5" fill="#1B365D" />
        <rect
          x="29"
          y="24"
          width="5"
          height="8"
          rx="1"
          fill="#D4A853"
          fillOpacity="0.7"
        />
        <rect x="30" y="25.5" width="3" height="3" rx="0.5" fill="#1B365D" />
      </svg>
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-[#1B365D]">
          Muzeylari
        </span>
      )}
    </div>
  );
}

export { Logo };

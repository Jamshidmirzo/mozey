import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-primary/12 text-primary dark:bg-primary/20',
        secondary:
          'bg-secondary text-secondary-foreground',
        destructive:
          'bg-destructive/12 text-destructive dark:bg-destructive/20',
        outline: 'ring-1 ring-border/60 text-foreground',
        success:
          'bg-emerald-500/12 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
        warning:
          'bg-amber-500/12 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

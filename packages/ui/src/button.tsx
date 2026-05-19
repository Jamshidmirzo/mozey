import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[#1B365D] text-white hover:bg-[#2B5380] focus-visible:ring-[#1B365D] active:scale-[0.98]',
        gold: 'bg-[#D4A853] text-[#1B365D] hover:bg-[#E3C76E] focus-visible:ring-[#D4A853] active:scale-[0.98] font-semibold',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        outline:
          'border-2 border-[#1B365D] bg-transparent text-[#1B365D] hover:bg-[#1B365D] hover:text-white focus-visible:ring-[#1B365D]',
        'outline-gold':
          'border-2 border-[#D4A853] bg-transparent text-[#D4A853] hover:bg-[#D4A853] hover:text-[#1B365D] focus-visible:ring-[#D4A853]',
        secondary:
          'bg-[#FFF8F0] text-[#1B365D] hover:bg-[#FFE5C4] focus-visible:ring-[#D4A853]',
        ghost:
          'hover:bg-[#1B365D]/5 text-[#1B365D] focus-visible:ring-[#1B365D]',
        link: 'text-[#1B365D] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

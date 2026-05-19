import * as React from 'react';
import { cn } from './utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF8F0] text-[#D4A853]">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-[#1B365D]">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-gray-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };

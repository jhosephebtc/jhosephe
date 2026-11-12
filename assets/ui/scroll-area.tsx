import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

export function ScrollArea({ children, label = 'Scrollable content', maxHeight = 240, className, ...props }: {
  children: ReactNode; label?: string; maxHeight?: number; className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>) {
  return <div className="jh-scroll-frame" style={{ maxHeight }}>
    <div className={cn('jh-scroll-area', className)} role="region" aria-label={label} tabIndex={0} style={{ maxHeight }} {...props}>{children}</div>
  </div>;
}

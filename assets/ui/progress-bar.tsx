import type { HTMLAttributes } from 'react';
import { cn } from './utils';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  label: string;
  value?: number;
  max?: number;
}

/** A monochrome progress track. Omit value for a moving, indeterminate state. */
export function ProgressBar({ label, value, max = 100, className, ...props }: ProgressBarProps) {
  const indeterminate = value === undefined;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const current = indeterminate ? undefined : Math.max(0, Math.min(safeMax, Number.isFinite(value) ? value : 0));
  const percent = current === undefined ? undefined : (current / safeMax) * 100;
  return <div
    className={cn('jh-progress', className)}
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={safeMax}
    aria-valuenow={current}
    data-indeterminate={indeterminate || undefined}
    {...props}
  ><span className="jh-progress__track"><span className="jh-progress__fill" style={percent === undefined ? undefined : { width: `${percent}%` }} /></span></div>;
}

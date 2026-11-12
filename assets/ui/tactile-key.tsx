import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './utils';

export interface TactileKeyProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean; onPressedChange?: (pressed: boolean) => void; size?: 'compact' | 'large';
}

export const TactileKey = forwardRef<HTMLButtonElement, TactileKeyProps>(function TactileKey({ className, pressed = false, onPressedChange, size = 'large', children, onClick, ...props }, ref) {
  return <button ref={ref} type="button" className={cn('jh-tactile-key', className)} data-size={size} aria-pressed={onPressedChange ? pressed : undefined} onClick={event => { onPressedChange?.(!pressed); onClick?.(event); }} {...props}><span className="jh-tactile-key__face">{children}</span></button>;
});

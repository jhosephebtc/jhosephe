import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface TactileKeyProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean; onPressedChange?: (pressed: boolean) => void; size?: 'compact' | 'large'; material?: SurfaceMaterial;
}

export const TactileKey = forwardRef<HTMLButtonElement, TactileKeyProps>(function TactileKey({ className, pressed = false, onPressedChange, size = 'large', material, children, onClick, ...props }, ref) {
  return <button ref={ref} type="button" className={cn('jh-tactile-key', className)} data-size={size} data-jh-material={material ? surfaceMaterialAttr(material) : undefined} aria-pressed={onPressedChange ? pressed : undefined} onClick={event => { onPressedChange?.(!pressed); onClick?.(event); }} {...props}><span className="jh-tactile-key__face">{children}</span></button>;
});

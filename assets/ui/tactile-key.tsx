import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface TactileKeyProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  shape?: 'pad' | 'dish' | 'circle' | 'pill';
  tone?: 'surface' | 'contrast' | 'accent';
  ledPosition?: 'bottom' | 'top-left' | 'top-right' | 'center' | 'none';
  accentColor?: string;
  pressed?: boolean; onPressedChange?: (pressed: boolean) => void; size?: 'compact' | 'large'; material?: SurfaceMaterial;
}

export const TactileKey = forwardRef<HTMLButtonElement, TactileKeyProps>(function TactileKey({ className, pressed = false, onPressedChange, size = 'large', shape = 'pad', tone = 'surface', ledPosition = 'bottom', accentColor, material, style, children, onClick, ...props }, ref) {
  const mergedStyle = accentColor ? { ...style, ['--jh-tactile-led-color' as string]: accentColor } : style;
  return <button ref={ref} type="button" className={cn('jh-tactile-key', className)} data-size={size} data-shape={shape} data-tone={tone} data-led={ledPosition} data-jh-material={material ? surfaceMaterialAttr(material) : undefined} aria-pressed={onPressedChange ? pressed : undefined} style={mergedStyle} onClick={event => { onPressedChange?.(!pressed); onClick?.(event); }} {...props}><span className="jh-tactile-key__face">{children}</span></button>;
});

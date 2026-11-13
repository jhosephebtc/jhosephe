import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { useEffect, useState, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { cn } from './utils';

export interface SliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  labelId: string;
  thumbThickness?: number;
  thumbHeight?: number;
  thumbRadius?: number;
  accentColor?: string;
  accentColorEnd?: string;
  accentGradient?: boolean;
  glowIntensity?: number;
  glowBlur?: number;
  onDraggingChange?: (dragging: boolean) => void;
}

export function Slider({
  className,
  labelId,
  thumbThickness = 15,
  thumbHeight = 34,
  thumbRadius = 7,
  accentColor = 'oklch(100% 0 0)',
  accentColorEnd = 'oklch(88% 0 0)',
  accentGradient = false,
  glowIntensity = 68,
  glowBlur = 5,
  onDraggingChange,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  style,
  ...props
}: SliderProps) {
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    onDraggingChange?.(dragging);
  }, [dragging, onDraggingChange]);

  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [dragging]);

  const intensity = Math.max(0, Math.min(100, glowIntensity));
  const rootStyle = {
    ...style,
    '--jh-slider-accent-color': accentColor,
    '--jh-slider-accent-color-end': accentColorEnd,
    '--jh-slider-glow-color': accentGradient ? `color-mix(in oklch, ${accentColor} 50%, ${accentColorEnd} 50%)` : accentColor,
    '--jh-slider-glow-strength': `${intensity}%`,
    '--jh-slider-glow-strength-mid': `${Math.round(intensity * .62)}%`,
    '--jh-slider-glow-strength-edge': `${Math.round(intensity * .3)}%`,
    '--jh-slider-glow-blur': `${Math.max(0, Math.min(16, glowBlur))}px`,
  } as CSSProperties;
  return (
    <SliderPrimitive.Root
      className={cn('jh-slider', className)}
      data-accent-gradient={accentGradient || undefined}
      data-dragging={dragging ? 'true' : undefined}
      style={rootStyle}
      onPointerDown={event => {
        if (!props.disabled && event.button === 0) setDragging(true);
        onPointerDown?.(event);
      }}
      onPointerUp={event => {
        setDragging(false);
        onPointerUp?.(event);
      }}
      onPointerCancel={event => {
        setDragging(false);
        onPointerCancel?.(event);
      }}
      onKeyDown={event => {
        if (!props.disabled && /^(Arrow|Page|Home|End)/.test(event.key)) setDragging(true);
        onKeyDown?.(event);
      }}
      onKeyUp={event => {
        setDragging(false);
        onKeyUp?.(event);
      }}
      onBlur={event => {
        setDragging(false);
        onBlur?.(event);
      }}
      {...props}
    >
      <SliderPrimitive.Track className="jh-slider__track"><SliderPrimitive.Range className="jh-slider__range" /></SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="jh-slider__thumb" aria-labelledby={labelId} style={{ width: Math.max(8, thumbThickness), height: Math.max(20, thumbHeight), borderRadius: Math.max(0, thumbRadius) }} />
    </SliderPrimitive.Root>
  );
}

export function Switch({ className, ...props }: ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>) {
  return <SwitchPrimitive.Root className={cn('jh-switch', className)} {...props}><SwitchPrimitive.Thumb className="jh-switch__thumb" /></SwitchPrimitive.Root>;
}

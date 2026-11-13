import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

export interface BarSliderProps {
  value: number; onValueChange: (value: number) => void; label: string;
  min?: number; max?: number; step?: number; disabled?: boolean;
  thumbThickness?: number; thumbHeight?: number; thumbRadius?: number;
  accentColor?: string; accentColorEnd?: string; accentGradient?: boolean; glowIntensity?: number; glowBlur?: number;
}

export function BarSlider({ value, onValueChange, label, min = 0, max = 100, step = 1, disabled = false, thumbThickness = 15, thumbHeight = 44, thumbRadius = 7, accentColor = 'oklch(100% 0 0)', accentColorEnd = 'oklch(92% 0.035 250)', accentGradient = false, glowIntensity = 68, glowBlur = 5 }: BarSliderProps) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const fraction = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const leadIndex = Math.floor(fraction * 40 + 1e-6);
  const intensity = Math.max(0, Math.min(100, glowIntensity));
  const stopDrag = () => setDragging(false);
  return <div className="jh-bar-control"><div className="jh-bar-control__label"><span id={id}>{label}</span><output>{value}</output></div>
    <SliderPrimitive.Root className="jh-bar-slider" data-dragging={dragging || undefined} data-accent-gradient={accentGradient || undefined} style={{ '--jh-slider-accent-color': accentColor, '--jh-slider-accent-color-end': accentColorEnd, '--jh-slider-glow-color': accentGradient ? `color-mix(in oklch, ${accentColor} 50%, ${accentColorEnd} 50%)` : accentColor, '--jh-slider-glow-strength': `${intensity}%`, '--jh-slider-glow-strength-mid': `${Math.round(intensity * .62)}%`, '--jh-slider-glow-strength-edge': `${Math.round(intensity * .3)}%`, '--jh-slider-glow-blur': `${Math.max(0, Math.min(16, glowBlur))}px` } as CSSProperties} value={[value]} onValueChange={values => onValueChange(values[0])} onValueCommit={stopDrag} onPointerDown={() => { if (!disabled) setDragging(true); }} onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={stopDrag} min={min} max={max} step={step} disabled={disabled}>
      <SliderPrimitive.Track className="jh-bar-slider__track"><div className="jh-bar-slider__bars" aria-hidden="true">{Array.from({ length: 41 }, (_, index) => { const position = index / 40; const color = accentGradient ? `color-mix(in oklch, ${accentColor} ${Math.round((1 - position) * 100)}%, ${accentColorEnd} ${Math.round(position * 100)}%)` : accentColor; return <span key={index} data-active={position <= fraction} data-lead={index === leadIndex ? 'true' : undefined} data-major={index % 5 === 0} style={{ '--jh-bar-cell-accent': color } as CSSProperties} />; })}</div></SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="jh-bar-slider__thumb" aria-labelledby={id} style={{ width: Math.max(8, thumbThickness), height: Math.max(24, thumbHeight), borderRadius: Math.max(0, thumbRadius) }} />
    </SliderPrimitive.Root><div className="jh-bar-control__limits" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
  </div>;
}

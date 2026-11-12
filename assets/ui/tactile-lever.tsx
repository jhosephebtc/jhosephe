import type { CSSProperties } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

export interface TactileLeverProps {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  unit?: string;
  accentColor?: string;
  accentColorEnd?: string;
  accentGradient?: boolean;
  glowIntensity?: number;
  glowBlur?: number;
}

/** A vertical, low-profile glass lever with range semantics and keyboard control. */
export function TactileLever({
  value,
  onValueChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  unit = '',
  accentColor = 'oklch(100% 0 0)',
  accentColorEnd = 'oklch(92% 0.035 250)',
  accentGradient = false,
  glowIntensity = 68,
  glowBlur = 5,
}: TactileLeverProps) {
  const intensity = Math.max(0, Math.min(100, glowIntensity));
  const style = {
    '--jh-slider-accent-color': accentColor,
    '--jh-slider-accent-color-end': accentColorEnd,
    '--jh-slider-glow-color': accentGradient
      ? `color-mix(in oklch, ${accentColor} 50%, ${accentColorEnd} 50%)`
      : accentColor,
    '--jh-slider-glow-strength': `${intensity}%`,
    '--jh-slider-glow-strength-mid': `${Math.round(intensity * 0.62)}%`,
    '--jh-slider-glow-strength-edge': `${Math.round(intensity * 0.3)}%`,
    '--jh-slider-glow-blur': `${Math.max(0, Math.min(16, glowBlur))}px`,
  } as CSSProperties;

  return (
    <section className="jh-tactile-lever">
      <div className="jh-tactile-lever__heading">
        <span>{label}</span>
        <output>{value}{unit}</output>
      </div>
      <div className="jh-tactile-lever__body">
        <SliderPrimitive.Root
          className="jh-tactile-lever__slider"
          data-accent-gradient={accentGradient || undefined}
          style={style}
          orientation="vertical"
          value={[value]}
          onValueChange={values => onValueChange(values[0])}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={label}
        >
          <SliderPrimitive.Track className="jh-tactile-lever__track">
            <SliderPrimitive.Range className="jh-tactile-lever__range" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="jh-tactile-lever__thumb" aria-label={label} />
        </SliderPrimitive.Root>
      </div>
    </section>
  );
}

import { useId } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

export interface BarSliderProps {
  value: number; onValueChange: (value: number) => void; label: string;
  min?: number; max?: number; step?: number; disabled?: boolean;
}

export function BarSlider({ value, onValueChange, label, min = 0, max = 100, step = 1, disabled = false }: BarSliderProps) {
  const id = useId();
  const fraction = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  return <div className="jh-bar-control"><div className="jh-bar-control__label"><span id={id}>{label}</span><output>{value}</output></div>
    <SliderPrimitive.Root className="jh-bar-slider" value={[value]} onValueChange={values => onValueChange(values[0])} min={min} max={max} step={step} disabled={disabled}>
      <SliderPrimitive.Track className="jh-bar-slider__track"><div className="jh-bar-slider__bars" aria-hidden="true">{Array.from({ length: 41 }, (_, index) => <span key={index} data-active={index / 40 <= fraction} data-major={index % 5 === 0} />)}</div></SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="jh-bar-slider__thumb" aria-labelledby={id}><span aria-hidden="true" /></SliderPrimitive.Thumb>
    </SliderPrimitive.Root><div className="jh-bar-control__limits" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
  </div>;
}

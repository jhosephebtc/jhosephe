import * as SliderPrimitive from '@radix-ui/react-slider';

/** A vertical, low-profile glass lever with range semantics and keyboard control. */
export function TactileLever({ value, onValueChange, label, min = 0, max = 100, step = 1, disabled = false, unit = '' }: {
  value: number; onValueChange: (value: number) => void; label: string;
  min?: number; max?: number; step?: number; disabled?: boolean; unit?: string;
}) {
  return <section className="jh-tactile-lever">
    <div className="jh-tactile-lever__heading"><span>{label}</span><output>{value}{unit}</output></div>
    <div className="jh-tactile-lever__body">
      <span className="jh-tactile-lever__limit">{max}{unit}</span>
      <SliderPrimitive.Root className="jh-tactile-lever__slider" orientation="vertical" value={[value]} onValueChange={values => onValueChange(values[0])} min={min} max={max} step={step} disabled={disabled} aria-label={label}>
        <SliderPrimitive.Track className="jh-tactile-lever__track"><SliderPrimitive.Range className="jh-tactile-lever__range" /></SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="jh-tactile-lever__thumb" aria-label={label} />
      </SliderPrimitive.Root>
      <span className="jh-tactile-lever__limit">{min}{unit}</span>
    </div>
  </section>;
}

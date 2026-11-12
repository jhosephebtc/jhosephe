import { useRef, useState, type CSSProperties } from 'react';

/** A real range input for keyboard semantics, with relative pointer scrubbing. */
export function Dial({ value, onChange, label, min = 0, max = 100, step = 1, disabled = false }: {
  value: number; onChange: (value: number) => void; label: string;
  min?: number; max?: number; step?: number; disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; value: number; pointer: number } | null>(null);
  const fraction = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const style = { '--dial-turn': `${-135 + fraction * 270}deg` } as CSSProperties;
  const release = () => { drag.current = null; setDragging(false); };
  return <span className="jh-dial" style={style} data-dragging={dragging} data-disabled={disabled || undefined}>
    <svg className="jh-dial__scale" viewBox="0 0 140 140" aria-hidden="true"><g transform="translate(70 70)">{Array.from({ length: 25 }, (_, index) => <path key={index} d={`M0 -${index % 4 === 0 ? 60 : 58}v-${index % 4 === 0 ? 5 : 3}`} transform={`rotate(${-135 + index * 11.25})`} />)}</g></svg>
    <span className="jh-dial__bed" aria-hidden="true"><span className="jh-dial__knob"><span className="jh-dial__top"><span className="jh-dial__indicator"><span className="jh-dial__mark" /></span></span></span></span>
    <input aria-label={label} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
      onChange={event => onChange(event.currentTarget.valueAsNumber)}
      onPointerDown={event => {
        if (disabled || event.button !== 0) return;
        event.preventDefault(); event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, y: event.clientY, value, pointer: event.pointerId };
        setDragging(true);
      }}
      onPointerMove={event => {
        const initial = drag.current;
        if (!initial || initial.pointer !== event.pointerId || max <= min) return;
        const increment = step > 0 ? step : 1;
        const delta = (event.clientX - initial.x - (event.clientY - initial.y)) / 180 * (max - min);
        const next = min + Math.round((initial.value + delta - min) / increment) * increment;
        onChange(Number(Math.max(min, Math.min(max, next)).toFixed(6)));
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} />
  </span>;
}

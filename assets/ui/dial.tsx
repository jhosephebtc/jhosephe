import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';

/** A range input with absolute pointer-angle mapping and native keyboard semantics. */
export function Dial({ value, onChange, label, min = 0, max = 100, step = 1, disabled = false,
  accentColor = 'oklch(100% 0 0)', accentColorEnd = 'oklch(92% 0.035 250)', accentGradient = false,
  glowIntensity = 68, glowBlur = 5,
}: {
  value: number; onChange: (value: number) => void; label: string;
  min?: number; max?: number; step?: number; disabled?: boolean;
  accentColor?: string; accentColorEnd?: string; accentGradient?: boolean;
  glowIntensity?: number; glowBlur?: number;
}) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<number | null>(null);
  const fraction = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const intensity = Math.max(0, Math.min(100, glowIntensity));
  const tickCount = 25;
  const activeTicks = Math.round(fraction * (tickCount - 1));
  const style = {
    '--dial-turn': `${-135 + fraction * 270}deg`,
    '--jh-slider-accent-color': accentColor,
    '--jh-slider-accent-color-end': accentColorEnd,
    '--jh-slider-glow-color': accentGradient ? `color-mix(in oklch, ${accentColor} 50%, ${accentColorEnd} 50%)` : accentColor,
    '--jh-slider-glow-strength': `${intensity}%`,
    '--jh-slider-glow-strength-mid': `${Math.round(intensity * .62)}%`,
    '--jh-slider-glow-strength-edge': `${Math.round(intensity * .3)}%`,
    '--jh-slider-glow-blur': `${Math.max(0, Math.min(16, glowBlur))}px`,
  } as CSSProperties;
  const release = () => { drag.current = null; setDragging(false); };
  const setFromPointer = (event: PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    if (Math.hypot(dx, dy) < 8) return;
    const pointerAngle = (Math.atan2(dy, dx) * 180 / Math.PI + 90 + 360) % 360;
    // The dial sweeps clockwise from 225° (lower left), through the top,
    // to 135° (lower right). The unused bottom sector clamps to its nearest end.
    const turn = pointerAngle > 135 && pointerAngle < 225
      ? (pointerAngle < 180 ? 135 : -135)
      : pointerAngle >= 225 ? pointerAngle - 360 : pointerAngle;
    const raw = min + ((turn + 135) / 270) * (max - min);
    const increment = step > 0 ? step : 1;
    const next = min + Math.round((raw - min) / increment) * increment;
    onChange(Number(Math.max(min, Math.min(max, next)).toFixed(6)));
  };
  return <span className="jh-dial" style={style} data-dragging={dragging} data-disabled={disabled || undefined} data-accent-gradient={accentGradient || undefined}>
    <svg className="jh-dial__scale" viewBox="0 0 140 140" aria-hidden="true">
      <g transform="translate(70 70)">
        {Array.from({ length: tickCount }, (_, index) => (
          <path
            key={index}
            className={index <= activeTicks ? 'jh-dial__tick is-active' : 'jh-dial__tick'}
            d={`M0 -${index % 4 === 0 ? 60 : 58}v-${index % 4 === 0 ? 5 : 3}`}
            transform={`rotate(${-135 + index * 11.25})`}
          />
        ))}
      </g>
    </svg>
    <span className="jh-dial__bed" aria-hidden="true"><span className="jh-dial__knob"><span className="jh-dial__top"><span className="jh-dial__indicator"><span className="jh-dial__mark" /></span></span></span></span>
    <input aria-label={label} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
      onChange={event => onChange(event.currentTarget.valueAsNumber)}
      onPointerDown={event => {
        if (disabled || event.button !== 0) return;
        event.preventDefault(); event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = event.pointerId;
        setFromPointer(event);
        setDragging(true);
      }}
      onPointerMove={event => {
        if (drag.current !== event.pointerId || max <= min) return;
        setFromPointer(event);
      }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} />
  </span>;
}

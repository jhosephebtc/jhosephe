import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

export type DialVariant = 'classic' | 'arc' | 'vernier' | 'monolith';

/** A range input with absolute pointer-angle mapping and native keyboard semantics. */
export function Dial({ value, onChange, label, min = 0, max = 100, step = 1, disabled = false,
  ticks = 25, detent = false, variant = 'classic',
  accentColor = 'oklch(100% 0 0)', accentColorEnd = 'oklch(88% 0 0)', accentGradient = false,
  glowIntensity = 68, glowBlur = 5,
}: {
  value: number; onChange: (value: number) => void; label: string;
  min?: number; max?: number; step?: number; disabled?: boolean;
  ticks?: number; detent?: boolean; variant?: DialVariant;
  accentColor?: string; accentColorEnd?: string; accentGradient?: boolean;
  glowIntensity?: number; glowBlur?: number;
}) {
  const [dragging, setDragging] = useState(false);
  const drag = useRef<number | null>(null);
  const scaleId = useId().replace(/:/g, '');
  const fraction = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const intensity = Math.max(0, Math.min(100, glowIntensity));
  const tickCount = Math.max(2, Math.round(ticks));
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
    '--jh-bar-cell-accent': accentGradient
      ? `color-mix(in oklch, ${accentColor} ${Math.round((1 - fraction) * 100)}%, ${accentColorEnd} ${Math.round(fraction * 100)}%)`
      : accentColor,
  } as CSSProperties;
  const cellAccent = (index: number) => {
    const position = tickCount > 1 ? index / (tickCount - 1) : 0;
    return accentGradient
      ? `color-mix(in oklch, ${accentColor} ${Math.round((1 - position) * 100)}%, ${accentColorEnd} ${Math.round(position * 100)}%)`
      : accentColor;
  };
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
  const arcGradId = `${scaleId}-arc-grad`;
  const scaleTicks = variant === 'vernier' && !detent ? 37 : tickCount;
  const vernierActive = Math.round(fraction * (scaleTicks - 1));

  return <span className="jh-dial" style={style} data-variant={variant} data-dragging={dragging} data-disabled={disabled || undefined} data-accent-gradient={accentGradient || undefined}>
    <svg className="jh-dial__scale" viewBox="0 0 140 140" aria-hidden="true">
      {accentGradient && (
        <defs>
          <linearGradient id={arcGradId} x1="15%" y1="82%" x2="85%" y2="82%">
            <stop offset="0%" style={{ stopColor: 'var(--jh-slider-accent-color, oklch(100% 0 0))' }} />
            <stop offset="100%" style={{ stopColor: 'var(--jh-slider-accent-color-end, oklch(88% 0 0))' }} />
          </linearGradient>
        </defs>
      )}

      <g transform="translate(70 70)">
        {!detent && (variant === 'arc' || variant === 'monolith') ? (
          <>
            <path
              className={variant === 'monolith' ? 'jh-dial__arc-bed is-monolith' : 'jh-dial__arc-bed'}
              d={variant === 'monolith' ? 'M -41.01 41.01 A 58 58 0 1 1 41.01 41.01' : 'M -43.13 43.13 A 61 61 0 1 1 43.13 43.13'}
              fill="none"
            />
            {variant === 'arc' ? (
              <path
                className="jh-dial__arc-fill"
                d="M -43.13 43.13 A 61 61 0 1 1 43.13 43.13"
                fill="none"
                pathLength={100}
                strokeDasharray={`${Math.max(0.8, fraction * 100).toFixed(3)} 100`}
                style={accentGradient ? { stroke: `url(#${arcGradId})` } : undefined}
              />
            ) : (
              <path
                className="jh-dial__arc-fill is-monolith"
                d="M -41.01 41.01 A 58 58 0 1 1 41.01 41.01"
                fill="none"
                pathLength={100}
                strokeDasharray={`${Math.max(0.8, fraction * 100).toFixed(3)} 100`}
                style={accentGradient ? { stroke: `url(#${arcGradId})` } : undefined}
              />
            )}
          </>
        ) : (
          Array.from({ length: scaleTicks }, (_, index) => {
            const angle = -135 + (scaleTicks > 1 ? (index / (scaleTicks - 1)) * 270 : 0);
            const activeIndex = variant === 'vernier' && !detent ? vernierActive : activeTicks;
            const isActive = detent ? index === activeIndex : index <= activeIndex;
            const isLead = index === activeIndex;
            const d = detent
              ? 'M0 -59v-5.5'
              : variant === 'vernier'
                ? index % 6 === 0
                  ? 'M0 -59v-6.5'
                  : index % 3 === 0
                    ? 'M0 -59v-4.6'
                    : 'M0 -59v-2.8'
                : `M0 -59v-${index % 4 === 0 ? 5.6 : 3.2}`;
            return (
              <path
                key={index}
                className={isActive ? 'jh-dial__tick is-active' : 'jh-dial__tick'}
                data-lead={isLead ? 'true' : undefined}
                d={d}
                strokeLinecap={detent ? 'round' : undefined}
                transform={`rotate(${angle})`}
                style={{ '--jh-bar-cell-accent': cellAccent(variant === 'vernier' && !detent ? Math.round((index / Math.max(1, scaleTicks - 1)) * (tickCount - 1)) : index) } as CSSProperties}
              />
            );
          })
        )}
      </g>

      {!detent && variant === 'arc' && (
        <g transform="translate(70 70)" className="jh-dial__datum-marks">
          <path d="M0 -67.5v-2.2" transform="rotate(-135)" />
          <path d="M0 -67.5v-2.6" transform="rotate(0)" />
          <path d="M0 -67.5v-2.2" transform="rotate(135)" />
        </g>
      )}
      {!detent && variant === 'vernier' && (
        <polygon points="70,4.2 67.6,0.8 72.4,0.8" className="jh-dial__datum-pip" />
      )}
    </svg>
    <span className="jh-dial__bed" aria-hidden="true"><span className="jh-dial__knob"><span className="jh-dial__top"><span className="jh-dial__indicator"><span className="jh-dial__mark" /></span></span></span></span>
    <input aria-label={label} type="range" min={min} max={max} step={step} value={value} disabled={disabled}
      onChange={event => onChange(event.currentTarget.valueAsNumber)}
      onKeyDown={event => {
        if (!disabled && /^(Arrow|Page|Home|End)/.test(event.key)) setDragging(true);
      }}
      onKeyUp={() => {
        if (drag.current === null) setDragging(false);
      }}
      onBlur={() => {
        if (drag.current === null) setDragging(false);
      }}
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

import type { CSSProperties } from 'react';

export type InstrumentBarsOrientation = 'horizontal' | 'vertical';

const accentVars = (
  accentColor: string,
  accentColorEnd: string,
  accentGradient: boolean,
  glowIntensity: number,
  glowBlur: number,
) => {
  const intensity = Math.max(0, Math.min(100, glowIntensity));
  return {
    '--jh-slider-accent-color': accentColor,
    '--jh-slider-accent-color-end': accentColorEnd,
    '--jh-slider-glow-color': accentGradient ? `color-mix(in oklch, ${accentColor} 50%, ${accentColorEnd} 50%)` : accentColor,
    '--jh-slider-glow-strength': `${intensity}%`,
    '--jh-slider-glow-strength-mid': `${Math.round(intensity * .62)}%`,
    '--jh-slider-glow-strength-edge': `${Math.round(intensity * .3)}%`,
    '--jh-slider-glow-blur': `${Math.max(0, Math.min(16, glowBlur))}px`,
  } as CSSProperties;
};

const cellAccent = (index: number, total: number, accentColor: string, accentColorEnd: string, accentGradient: boolean) => {
  const position = total > 1 ? index / (total - 1) : 0;
  return accentGradient
    ? `color-mix(in oklch, ${accentColor} ${Math.round((1 - position) * 100)}%, ${accentColorEnd} ${Math.round(position * 100)}%)`
    : accentColor;
};

/** The visible text outside this SVG carries the value. */
export function InstrumentBars({ value, orientation = 'horizontal', dragging = false,
  accentColor = 'oklch(100% 0 0)', accentColorEnd = 'oklch(88% 0 0)', accentGradient = false,
  glowIntensity = 68, glowBlur = 5,
}: {
  value: number;
  orientation?: InstrumentBarsOrientation;
  dragging?: boolean;
  accentColor?: string;
  accentColorEnd?: string;
  accentGradient?: boolean;
  glowIntensity?: number;
  glowBlur?: number;
}) {
  const normalized = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const bars = Array.from({ length: 33 }, (_, index) => index);
  const vertical = orientation === 'vertical';
  const style = accentVars(accentColor, accentColorEnd, accentGradient, glowIntensity, glowBlur);

  if (vertical) {
    return (
      <svg
        className="jh-instrument jh-instrument--vertical"
        viewBox="0 0 70 330"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        data-orientation="vertical"
        data-dragging={dragging ? 'true' : undefined}
        data-accent-gradient={accentGradient || undefined}
        style={style}
      >
        <path className="jh-instrument__baseline" d="M6 0 V330" />
        {bars.map(index => {
          const active = (index + 1) / bars.length <= normalized / 100;
          const isLead = active && (index + 2) / bars.length > normalized / 100;
          const width = index % 4 === 0 ? 27 : 16;
          return (
            <rect
              key={index}
              x={10}
              y={index * 10}
              width={width}
              height="3"
              rx="1.5"
              className={active ? 'jh-instrument__bar is-active' : 'jh-instrument__bar'}
              data-lead={isLead ? 'true' : undefined}
              style={{ '--jh-bar-cell-accent': cellAccent(index, bars.length, accentColor, accentColorEnd, accentGradient) } as CSSProperties}
            />
          );
        })}
        <path className="jh-instrument__line" pathLength="1" d="M58 0 V70 M58 260 V330" />
      </svg>
    );
  }

  return (
    <svg
      className="jh-instrument jh-instrument--horizontal"
      viewBox="0 0 330 70"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      data-orientation="horizontal"
      data-dragging={dragging ? 'true' : undefined}
      data-accent-gradient={accentGradient || undefined}
      style={style}
    >
      <path className="jh-instrument__baseline" d="M0 64 H330" />
      {bars.map(index => {
        const active = (index + 1) / bars.length <= normalized / 100;
        const isLead = active && (index + 2) / bars.length > normalized / 100;
        const height = index % 4 === 0 ? 27 : 16;
        return (
          <rect
            key={index}
            x={index * 10}
            y={60 - height}
            width="3"
            height={height}
            rx="1.5"
            className={active ? 'jh-instrument__bar is-active' : 'jh-instrument__bar'}
            data-lead={isLead ? 'true' : undefined}
            style={{ '--jh-bar-cell-accent': cellAccent(index, bars.length, accentColor, accentColorEnd, accentGradient) } as CSSProperties}
          />
        );
      })}
      <path className="jh-instrument__line" pathLength="1" d="M0 12 H70 M260 12 H330" />
    </svg>
  );
}

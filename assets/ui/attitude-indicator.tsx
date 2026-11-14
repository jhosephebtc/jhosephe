import { useId } from 'react';
import { instrumentAccentStyle } from './utils';

const BANK_TICKS = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60];
const PITCH_RUNGS = [-30, -20, -10, 10, 20, 30];

/** Monochrome pitch-and-roll display with an optional contained OKLCH light accent. */
export function AttitudeIndicator({
  pitch = 0,
  roll = 0,
  label = 'Attitude indicator',
  accentColor,
}: {
  pitch?: number;
  roll?: number;
  label?: string;
  accentColor?: string;
}) {
  const clipId = `jh-attitude-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const safePitch = Math.max(-45, Math.min(45, pitch));
  const safeRoll = Math.max(-90, Math.min(90, roll));
  const roundedPitch = Math.round(safePitch);
  const roundedRoll = Math.round(safeRoll);
  const slip = Number((safeRoll / 45).toFixed(1));
  const director = Math.abs(safePitch) < 1.5 ? 'LEVEL' : safePitch > 0 ? 'CLIMB' : 'DESC';
  const formatSigned = (value: number) => (value > 0 ? `+${value}` : String(value));

  return (
    <section className="jh-attitude" aria-label={label} style={instrumentAccentStyle(accentColor)}>
      <header className="jh-attitude__header">
        <div>
          <span className="jh-attitude__eyebrow">Flight dynamics · ADI</span>
          <strong className="jh-attitude__title">{label}</strong>
        </div>
        <span className="jh-attitude__pill">
          {formatSigned(roundedPitch)}° / {formatSigned(roundedRoll)}°
        </span>
      </header>
      <div className="jh-attitude__well">
        <svg
          className="jh-attitude__dial"
          viewBox="0 0 200 200"
          role="img"
          aria-label={`Pitch ${roundedPitch} degrees, roll ${roundedRoll} degrees`}
        >
          <defs>
            <clipPath id={clipId}>
              <circle cx="100" cy="100" r="76" />
            </clipPath>
          </defs>
          <circle cx="100" cy="100" r="92" className="jh-attitude__bezel" />
          <circle cx="100" cy="100" r="88" className="jh-attitude__bezel-edge" />
          <circle cx="100" cy="100" r="84" className="jh-attitude__rim" />
          <circle cx="100" cy="100" r="80" className="jh-attitude__seat" />
          <g clipPath={`url(#${clipId})`}>
            <g transform={`rotate(${-safeRoll} 100 100) translate(0 ${safePitch * 1.65})`}>
              <rect x="-40" y="-80" width="280" height="180" className="jh-attitude__sky" />
              <rect x="-40" y="100" width="280" height="180" className="jh-attitude__ground" />
              <path d="M-20 100H220" className="jh-attitude__horizon" />
              {PITCH_RUNGS.map(degree => {
                const major = Math.abs(degree) % 20 === 0;
                const half = major ? 26 : 15;
                return (
                  <g
                    key={degree}
                    transform={`translate(100 ${100 - degree * 1.65})`}
                    className={`jh-attitude__pitch-mark${major ? ' is-major' : ''}`}
                  >
                    <path d={`M${-half} 0H${half}`} />
                    {major && (
                      <>
                        <text x={-half - 5} y="3" textAnchor="end">{Math.abs(degree)}</text>
                        <text x={half + 5} y="3" textAnchor="start">{Math.abs(degree)}</text>
                      </>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
          <g className="jh-attitude__bank-ticks" transform="translate(100 100)">
            {BANK_TICKS.map(deg => (
              <path
                key={deg}
                d={deg === 0 || Math.abs(deg) === 30 || Math.abs(deg) === 60 ? 'M0 -81v7' : 'M0 -81v4.5'}
                className={deg === 0 ? 'is-zero' : undefined}
                transform={`rotate(${deg})`}
              />
            ))}
          </g>
          <g className="jh-attitude__ticks" transform="translate(100 100)">
            {Array.from({ length: 24 }, (_, index) => (
              <path key={index} d={index % 3 === 0 ? 'M0 -81v5' : 'M0 -82v3'} transform={`rotate(${index * 15})`} />
            ))}
          </g>
          <g transform={`rotate(${-safeRoll} 100 100)`}>
            <path d="M100 22l-4.5 7h9Z" className="jh-attitude__bank-indicator" />
          </g>
          <g className="jh-attitude__aircraft">
            <path d="M52 100h26l6 6h8M148 100h-26l-6 6h-8" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="100" cy="100" r="3.6" className="jh-attitude__aircraft-pip" />
          </g>
          <circle cx="100" cy="100" r="76" className="jh-attitude__glass" />
        </svg>
      </div>
      <div className="jh-attitude__readout">
        <div><span>Pitch</span><output>{roundedPitch}°</output></div>
        <div><span>Roll</span><output>{roundedRoll}°</output></div>
        <div><span>Slip</span><output>{slip > 0 ? `+${slip.toFixed(1)}` : slip.toFixed(1)}°</output></div>
        <div><span>Director</span><output>{director}</output></div>
      </div>
    </section>
  );
}

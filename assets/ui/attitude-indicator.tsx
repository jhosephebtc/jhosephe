import { useId } from 'react';

/** Monochrome pitch-and-roll display. Values come from the caller's sensor or model. */
export function AttitudeIndicator({ pitch = 0, roll = 0, label = 'Attitude indicator' }: {
  pitch?: number; roll?: number; label?: string;
}) {
  const clipId = `jh-attitude-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const safePitch = Math.max(-45, Math.min(45, pitch));
  const safeRoll = Math.max(-90, Math.min(90, roll));
  return <section className="jh-attitude" aria-label={label}>
    <svg className="jh-attitude__dial" viewBox="0 0 200 200" role="img" aria-label={`Pitch ${Math.round(safePitch)} degrees, roll ${Math.round(safeRoll)} degrees`}>
      <defs><clipPath id={clipId}><circle cx="100" cy="100" r="76" /></clipPath></defs>
      <circle cx="100" cy="100" r="92" className="jh-attitude__bezel" />
      <circle cx="100" cy="100" r="88" className="jh-attitude__bezel-edge" />
      <circle cx="100" cy="100" r="84" className="jh-attitude__rim" />
      <circle cx="100" cy="100" r="80" className="jh-attitude__seat" />
      <g clipPath={`url(#${clipId})`}>
        <g transform={`rotate(${-safeRoll} 100 100) translate(0 ${safePitch * 1.65})`}>
          <rect x="0" y="0" width="200" height="100" fill="#fafafa" />
          <rect x="0" y="100" width="200" height="100" fill="#dedede" />
          <path d="M12 100H188" className="jh-attitude__horizon" />
          {[-40, -30, -20, -10, 10, 20, 30, 40].map(degree => <g key={degree} transform={`translate(100 ${100 - degree * 1.65})`} className="jh-attitude__pitch-mark">
            <path d={degree % 20 === 0 ? 'M-25 0H25' : 'M-13 0H13'} />
          </g>)}
        </g>
      </g>
      <g className="jh-attitude__aircraft"><path d="M48 99h34l8-5h20l8 5h34v4h-35l-6 8h-22l-6-8H48z" /></g>
      <g className="jh-attitude__ticks" transform="translate(100 100)">{Array.from({ length: 24 }, (_, index) => <path key={index} d={index % 3 === 0 ? 'M0 -81v8' : 'M0 -82v4'} transform={`rotate(${index * 15})`} />)}</g>
      <circle cx="100" cy="100" r="76" className="jh-attitude__glass" />
      <circle cx="100" cy="100" r="3.5" className="jh-attitude__hub" />
    </svg>
    <div className="jh-attitude__readout"><span>Pitch <output>{Math.round(safePitch)}°</output></span><span>Roll <output>{Math.round(safeRoll)}°</output></span></div>
  </section>;
}

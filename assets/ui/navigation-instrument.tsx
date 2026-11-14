import { instrumentAccentStyle } from './utils';

export type NavigationMode = 'marine' | 'aviation';

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

/** A caller-fed heading and telemetry display for marine or aviation layouts. */
export function NavigationInstrument({
  heading = 128,
  speed = 18,
  auxiliary = 420,
  mode = 'marine',
  label,
  accentColor,
}: {
  heading?: number;
  speed?: number;
  auxiliary?: number;
  mode?: NavigationMode;
  label?: string;
  accentColor?: string;
}) {
  const angle = ((heading % 360) + 360) % 360;
  const headingText = String(Math.round(angle)).padStart(3, '0');
  const cardinal = CARDINALS[Math.round(angle / 45) % 8];
  const secondaryLabel = mode === 'marine' ? 'Depth' : 'Altitude';
  const secondaryUnit = mode === 'marine' ? 'm' : 'ft';
  const speedUnit = mode === 'marine' ? 'kn' : 'kt';

  return (
    <section
      className="jh-navigation-instrument"
      aria-label={label ?? `${mode === 'marine' ? 'Marine' : 'Aviation'} navigation`}
      style={instrumentAccentStyle(accentColor)}
    >
      <header className="jh-navigation-instrument__header">
        <div>
          <span className="jh-navigation-instrument__eyebrow">Navigation telemetry · HSI</span>
          <strong className="jh-navigation-instrument__title">{label ?? 'Course & heading'}</strong>
        </div>
        <span className="jh-navigation-instrument__mode">
          <i className="jh-navigation-instrument__mode-dot" aria-hidden="true" />
          {mode === 'marine' ? 'Marine' : 'Aviation'}
        </span>
      </header>
      <div className="jh-navigation-instrument__stage">
        <div className="jh-navigation-instrument__well">
          <div className="jh-navigation-instrument__dial">
            <svg viewBox="0 0 160 160" role="img" aria-label={`Heading ${headingText} degrees`}>
              <circle cx="80" cy="80" r="76" className="jh-navigation-instrument__bezel" />
              <circle cx="80" cy="80" r="73" className="jh-navigation-instrument__bezel-edge" />
              <circle cx="80" cy="80" r="71" className="jh-navigation-instrument__rim" />
              <circle cx="80" cy="80" r="66" className="jh-navigation-instrument__face" />
              <g transform="translate(80 80)" className="jh-navigation-instrument__ticks">
                {Array.from({ length: 72 }, (_, index) => {
                  const major = index % 6 === 0;
                  const medium = !major && index % 2 === 0;
                  return (
                    <path
                      key={index}
                      d={major ? 'M0 -63v8' : medium ? 'M0 -63v5' : 'M0 -63v2.5'}
                      className={major ? 'is-major' : undefined}
                      transform={`rotate(${index * 5})`}
                    />
                  );
                })}
              </g>
              <g className="jh-navigation-instrument__cdi" aria-hidden="true">
                <line x1="56" y1="80" x2="104" y2="80" />
                {[-18, -9, 9, 18].map(dx => (
                  <circle key={dx} cx={80 + dx} cy="80" r="1.4" />
                ))}
              </g>
              <path d="M80 12l-4 7h8Z" className="jh-navigation-instrument__lubber" />
              <text x="80" y="31" textAnchor="middle">N</text>
              <text x="131" y="84" textAnchor="middle">E</text>
              <text x="80" y="137" textAnchor="middle">S</text>
              <text x="29" y="84" textAnchor="middle">W</text>
              <g transform={`rotate(${angle} 80 80)`} className="jh-navigation-instrument__needle">
                <path d="M80 39 86.5 82 80 76 73.5 82Z" className="jh-navigation-instrument__needle-north" />
                <path d="m80 121-5-34 5 5 5-5Z" />
              </g>
              <circle cx="80" cy="80" r="4" className="jh-navigation-instrument__hub" />
            </svg>
            <output>{headingText}<small>°</small></output>
          </div>
        </div>
        <div className="jh-navigation-instrument__readings">
          <div><span>Heading</span><strong>{headingText}<small>°</small></strong></div>
          <div><span>Speed</span><strong>{speed.toFixed(1)} <small>{speedUnit}</small></strong></div>
          <div><span>{secondaryLabel}</span><strong>{Math.round(auxiliary).toLocaleString('en-US')} <small>{secondaryUnit}</small></strong></div>
          <div><span>Track</span><strong>{cardinal} <small>{headingText}°</small></strong></div>
        </div>
      </div>
    </section>
  );
}

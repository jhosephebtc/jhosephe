export type NavigationMode = 'marine' | 'aviation';

/** A caller-fed heading and telemetry display for marine or aviation layouts. */
export function NavigationInstrument({ heading = 128, speed = 18, auxiliary = 420, mode = 'marine', label }: {
  heading?: number; speed?: number; auxiliary?: number; mode?: NavigationMode; label?: string;
}) {
  const angle = ((heading % 360) + 360) % 360;
  const headingText = String(Math.round(angle)).padStart(3, '0');
  const secondaryLabel = mode === 'marine' ? 'Depth' : 'Altitude';
  const secondaryUnit = mode === 'marine' ? 'm' : 'ft';
  const speedUnit = mode === 'marine' ? 'kn' : 'kt';
  return <section className="jh-navigation-instrument" aria-label={label ?? `${mode === 'marine' ? 'Marine' : 'Aviation'} navigation`}>
    <div className="jh-navigation-instrument__dial">
      <svg viewBox="0 0 160 160" role="img" aria-label={`Heading ${headingText} degrees`}>
        <circle cx="80" cy="80" r="76" className="jh-navigation-instrument__bezel" />
        <circle cx="80" cy="80" r="73" className="jh-navigation-instrument__bezel-edge" />
        <circle cx="80" cy="80" r="71" className="jh-navigation-instrument__rim" />
        <circle cx="80" cy="80" r="66" className="jh-navigation-instrument__face" />
        <g transform="translate(80 80)" className="jh-navigation-instrument__ticks">{Array.from({ length: 36 }, (_, index) => <path key={index} d={index % 3 === 0 ? 'M0 -62v9' : 'M0 -63v5'} transform={`rotate(${index * 10})`} />)}</g>
        <text x="80" y="29" textAnchor="middle">N</text><text x="132" y="84" textAnchor="middle">E</text><text x="80" y="138" textAnchor="middle">S</text><text x="28" y="84" textAnchor="middle">W</text>
        <g transform={`rotate(${angle} 80 80)`} className="jh-navigation-instrument__needle"><path d="M80 42 87 82 80 76 73 82Z" /><path d="m80 118-5-32 5 5 5-5Z" /></g>
        <circle cx="80" cy="80" r="4" className="jh-navigation-instrument__hub" />
      </svg>
      <output>{headingText}<small>°</small></output>
    </div>
    <div className="jh-navigation-instrument__readings">
      <div><span>Speed</span><strong>{speed.toFixed(1)} <small>{speedUnit}</small></strong></div>
      <div><span>{secondaryLabel}</span><strong>{Math.round(auxiliary).toLocaleString('en-US')} <small>{secondaryUnit}</small></strong></div>
      <span className="jh-navigation-instrument__mode">{mode === 'marine' ? 'Marine' : 'Aviation'}</span>
    </div>
  </section>;
}

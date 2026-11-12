import { useMemo, useState, type ReactNode } from 'react';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;
const BODIES = [
  { name: 'Sun', base: 280, speed: 0.9856 }, { name: 'Moon', base: 102, speed: 13.176 },
  { name: 'Mercury', base: 318, speed: 4.09 }, { name: 'Venus', base: 24, speed: 1.6 },
  { name: 'Mars', base: 189, speed: 0.524 }, { name: 'Jupiter', base: 32, speed: 0.083 },
  { name: 'Saturn', base: 224, speed: 0.033 }, { name: 'Uranus', base: 276, speed: 0.0116 },
  { name: 'Neptune', base: 285, speed: 0.0059 },
] as const;
const mod = (value: number, length: number) => ((value % length) + length) % length;

function SignIcon({ index }: { index: number }) {
  const icons: ReactNode[] = [
    <path key="a" d="M8 18 14 4l6 14M10.5 12h7" />,
    <path key="t" d="M7 6c2.4 2.2 4 2.2 7 0M10.5 7.2V18M13.5 7.2V18" />,
    <g key="g"><circle cx="9" cy="9" r="3.2" /><circle cx="15" cy="9" r="3.2" /><circle cx="9" cy="15" r="3.2" /><circle cx="15" cy="15" r="3.2" /></g>,
    <path key="c" d="M16.5 8.2A4.8 4.8 0 1 0 16.5 15.8M8 7.5c1.4-1.2 3-.5 3.6.8M8 16.5c1.4 1.2 3 .5 3.6-.8" />,
    <path key="l" d="M8 16.5c0-3.6 2.2-5.4 4-6.8 1.8 1.4 4 3.2 4 6.8M9.2 9.4c1.2-2.4 2.8-3.8 2.8-3.8s1.6 1.4 2.8 3.8" />,
    <path key="v" d="M8 5.5h8M12 5.5v8.2c0 2.4-1.5 3.8-3.4 3.8" />,
    <path key="li" d="M6.5 11.2h11M8.4 14.8a6.2 6.2 0 0 1 7.2 0M12 6.4v4.8" />,
    <path key="s" d="M8.2 8.4c1.8-2.2 5.4-2.4 6.8 0 1.2 2-.2 3.6-2.4 4.4L16 18M8 18l3.2-5" />,
    <path key="sg" d="M8 16.8c2.8-1.4 4.4-4.2 4.4-7.2V5.2M12.4 8.8h4.2M14.8 5.8l2.4 3-2.4 3" />,
    <path key="cp" d="M8.2 7.2c1.8-2 5.8-2 7.6 0M9.4 8.8V18M14.6 8.8V18M9.4 13.2h5.2" />,
    <path key="aq" d="M7 9.2c1.6 1.4 2.8 1.4 5 0s3.4-1.4 5 0M7 13.2c1.6 1.4 2.8 1.4 5 0s3.4-1.4 5 0M7 17.2c1.6 1.4 2.8 1.4 5 0s3.4-1.4 5 0" />,
    <path key="p" d="M12 5.5v13M8.4 9.2a3.6 3.6 0 1 1 7.2 0" />,
  ];
  return <g className="jh-astrology-wheel__sign-icon" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">{icons[index]}</g>;
}

function PlanetIcon({ name }: { name: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'Sun':
      return <g {...common}><circle cx="12" cy="12" r="3.2" /><path d="M12 4.2v2.2M12 17.6v2.2M4.2 12h2.2M17.6 12h2.2M6.4 6.4l1.6 1.6M16 16l1.6 1.6M17.6 6.4 16 8M8 16l-1.6 1.6" /></g>;
    case 'Moon':
      return <g {...common}><path d="M15.2 6.2A6.4 6.4 0 1 0 17 14.8 5 5 0 0 1 15.2 6.2Z" /></g>;
    case 'Mercury':
      return <g {...common}><circle cx="12" cy="11" r="3.2" /><path d="M12 14.2V19M9.4 17h5.2M9.2 6.2c1.4-1.4 4.2-1.4 5.6 0" /></g>;
    case 'Venus':
      return <g {...common}><circle cx="12" cy="9.4" r="3.4" /><path d="M12 12.8V19M9.2 16.2h5.6" /></g>;
    case 'Mars':
      return <g {...common}><circle cx="10.6" cy="13.4" r="3.4" /><path d="M13.2 10.8 18 6M14.4 6H18v3.6" /></g>;
    case 'Jupiter':
      return <g {...common}><path d="M8.2 8.2h7.2M11.8 5.8v12.4M8.4 15.8c1.6 1.8 5.6 1.8 7.2 0" /></g>;
    case 'Saturn':
      return <g {...common}><path d="M12 6.2v11.6M9 9.2h6M8.4 14.8c1.6 1.8 5.6 1.8 7.2 0M12 6.2c-1.4 0-2.4-.8-2.4-1.8" /></g>;
    case 'Uranus':
      return <g {...common}><circle cx="12" cy="14.8" r="2.4" /><path d="M12 5.6v6.8M8.2 8.4c1.2 1.4 2.4 2 3.8 2s2.6-.6 3.8-2M7.4 12.2h9.2" /></g>;
    default:
      return <g {...common}><path d="M8.4 8.2c1.4-1.8 5.8-1.8 7.2 0M8.4 15.8c1.4 1.8 5.8 1.8 7.2 0M12 6.4v11.2" /></g>;
  }
}

/** Interactive natal-wheel study with illustrative, low-precision planetary longitudes. */
export function AstrologyWheel({ birthDate = '1992-08-14', birthTime = '12:00', location = 'Fortaleza', latitude = -3.7319, longitude = -38.5267, onBodySelect }: {
  birthDate?: string; birthTime?: string; location?: string; latitude?: number; longitude?: number; onBodySelect?: (body: string) => void;
}) {
  const [selectedBody, setSelectedBody] = useState('Sun');
  const birth = useMemo(() => new Date(birthDate + 'T' + birthTime + ':00'), [birthDate, birthTime]);
  const days = Number.isFinite(birth.getTime()) ? (birth.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / 86400000 : 0;
  const ascendant = mod(100 + birth.getHours() * 15 + longitude, 360);
  const planets = BODIES.map(body => ({ ...body, longitude: mod(body.base + days * body.speed, 360) }));
  const selected = planets.find(body => body.name === selectedBody) ?? planets[0];
  const polar = (radius: number, angle: number) => ({
    x: 180 + radius * Math.cos((angle - 90) * Math.PI / 180),
    y: 180 + radius * Math.sin((angle - 90) * Math.PI / 180),
  });
  const point = (longitudeValue: number, radius: number) => polar(radius, longitudeValue - ascendant);
  const select = (name: string) => { setSelectedBody(name); onBodySelect?.(name); };

  return <section className="jh-astrology-wheel" aria-label={'Illustrative natal chart for ' + location}>
    <header>
      <div>
        <span className="jh-astrology-wheel__eyebrow">Birth chart · Demo</span>
        <strong>{location}</strong>
      </div>
      <span>{birthDate} · {birthTime}</span>
    </header>

    <div className="jh-astrology-wheel__stage">
      <div className="jh-astrology-wheel__bed" aria-hidden="true" />
      <div className="jh-astrology-wheel__chart">
        <svg viewBox="0 0 360 360" role="group" aria-label="Astrological chart wheel">
          <defs>
            <radialGradient id="jh-astro-face" cx="32%" cy="22%" r="78%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#f5f5f5" />
              <stop offset="100%" stopColor="#e4e4e4" />
            </radialGradient>
            <radialGradient id="jh-astro-well" cx="50%" cy="42%" r="70%">
              <stop offset="0%" stopColor="#fafafa" />
              <stop offset="70%" stopColor="#efefef" />
              <stop offset="100%" stopColor="#dedede" />
            </radialGradient>
            <filter id="jh-astro-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <circle cx="180" cy="180" r="168" className="jh-astrology-wheel__bezel" />
          <circle cx="180" cy="180" r="160" className="jh-astrology-wheel__bezel-edge" />
          <circle cx="180" cy="180" r="152" className="jh-astrology-wheel__rim" fill="url(#jh-astro-well)" />
          <circle cx="180" cy="180" r="144" className="jh-astrology-wheel__face" fill="url(#jh-astro-face)" filter="url(#jh-astro-glow)" />
          <circle cx="180" cy="180" r="118" className="jh-astrology-wheel__sign-ring" />
          <circle cx="180" cy="180" r="86" className="jh-astrology-wheel__house-ring" />
          <circle cx="180" cy="180" r="54" className="jh-astrology-wheel__inner-well" />

          {Array.from({ length: 12 }, (_, index) => {
            const start = polar(54, index * 30);
            const end = polar(144, index * 30);
            const label = polar(131, index * 30 + 15);
            const house = polar(100, index * 30 + 15);
            return <g key={SIGNS[index]}>
              <path d={`M${start.x} ${start.y}L${end.x} ${end.y}`} className="jh-astrology-wheel__radial" />
              <g transform={`translate(${label.x - 12} ${label.y - 12})`} className="jh-astrology-wheel__sign" aria-hidden="true">
                <SignIcon index={index} />
              </g>
              <text x={house.x} y={house.y + 3} className="jh-astrology-wheel__house">{String(index + 1).padStart(2, '0')}</text>
            </g>;
          })}

          <circle cx="180" cy="180" r="4.5" className="jh-astrology-wheel__center" />
          <circle cx="180" cy="180" r="2" className="jh-astrology-wheel__hub" />

          {planets.map((body, index) => {
            const p = point(body.longitude, index % 2 ? 72 : 63);
            const active = body.name === selectedBody;
            return <g
              key={body.name}
              className="jh-astrology-wheel__planet"
              data-selected={active}
              role="button"
              tabIndex={0}
              aria-label={`${body.name} at ${body.longitude.toFixed(1)} degrees`}
              onClick={() => select(body.name)}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(body.name); } }}
            >
              <circle className="jh-astrology-wheel__planet-halo" cx={p.x} cy={p.y} r="15" />
              <circle className="jh-astrology-wheel__planet-face" cx={p.x} cy={p.y} r="12" />
              <g transform={`translate(${p.x - 12} ${p.y - 12})`} aria-hidden="true"><PlanetIcon name={body.name} /></g>
            </g>;
          })}
        </svg>
      </div>
    </div>

    <div className="jh-astrology-wheel__details">
      <div><span>Selected body</span><strong>{selected.name}</strong></div>
      <div><span>Ecliptic longitude</span><strong>{selected.longitude.toFixed(1)}° · {SIGNS[Math.floor(selected.longitude / 30)]}</strong></div>
      <div><span>Ascendant</span><strong>{ascendant.toFixed(1)}° · {SIGNS[Math.floor(ascendant / 30)]}</strong></div>
    </div>
    <footer>Illustrative positions for interface prototyping. Use a verified ephemeris for readings. Lat {latitude.toFixed(2)} · Lon {longitude.toFixed(2)}</footer>
  </section>;
}

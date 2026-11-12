import { useMemo, useState } from 'react';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const BODIES = [
  { name: 'Sun', glyph: '☉', base: 280, speed: 0.9856 }, { name: 'Moon', glyph: '☽', base: 102, speed: 13.176 },
  { name: 'Mercury', glyph: '☿', base: 318, speed: 4.09 }, { name: 'Venus', glyph: '♀', base: 24, speed: 1.6 },
  { name: 'Mars', glyph: '♂', base: 189, speed: 0.524 }, { name: 'Jupiter', glyph: '♃', base: 32, speed: 0.083 },
  { name: 'Saturn', glyph: '♄', base: 224, speed: 0.033 }, { name: 'Uranus', glyph: '♅', base: 276, speed: 0.0116 },
  { name: 'Neptune', glyph: '♆', base: 285, speed: 0.0059 },
];
const mod = (value: number, length: number) => ((value % length) + length) % length;

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
  const polar = (radius: number, angle: number) => ({ x: 160 + radius * Math.cos((angle - 90) * Math.PI / 180), y: 160 + radius * Math.sin((angle - 90) * Math.PI / 180) });
  const point = (longitudeValue: number, radius: number) => polar(radius, longitudeValue - ascendant);
  return <section className="jh-astrology-wheel" aria-label={'Illustrative natal chart for ' + location}>
    <header><div><span className="jh-astrology-wheel__eyebrow">Birth chart · Demo</span><strong>{location}</strong></div><span>{birthDate} · {birthTime}</span></header>
    <div className="jh-astrology-wheel__chart"><svg viewBox="0 0 320 320" role="group" aria-label="Astrological chart wheel">
      <circle cx="160" cy="160" r="146" className="jh-astrology-wheel__outer" /><circle cx="160" cy="160" r="120" className="jh-astrology-wheel__sign-ring" /><circle cx="160" cy="160" r="86" className="jh-astrology-wheel__house-ring" />
      {Array.from({ length: 12 }, (_, index) => { const start = polar(86, index * 30); const end = polar(146, index * 30); const label = polar(132, index * 30 + 15); const house = polar(102, index * 30 + 15); return <g key={index}><path d={'M' + start.x + ' ' + start.y + 'L' + end.x + ' ' + end.y} className="jh-astrology-wheel__radial" /><text x={label.x} y={label.y} className="jh-astrology-wheel__sign">{SIGN_GLYPHS[index]}</text><text x={house.x} y={house.y} className="jh-astrology-wheel__house">{String(index + 1).padStart(2,'0')}</text></g>; })}
      <circle cx="160" cy="160" r="3" className="jh-astrology-wheel__center" />
      {planets.map((body, index) => { const p = point(body.longitude, index % 2 ? 71 : 62); return <g key={body.name} className="jh-astrology-wheel__planet" data-selected={body.name === selectedBody} role="button" tabIndex={0} aria-label={body.name + ' at ' + body.longitude.toFixed(1) + ' degrees'} onClick={() => { setSelectedBody(body.name); onBodySelect?.(body.name); }} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedBody(body.name); onBodySelect?.(body.name); } }}><circle cx={p.x} cy={p.y} r="11" /><text x={p.x} y={p.y + 4}>{body.glyph}</text></g>; })}
    </svg></div>
    <div className="jh-astrology-wheel__details"><div><span>Selected body</span><strong>{selected.glyph} {selected.name}</strong></div><div><span>Ecliptic longitude</span><strong>{selected.longitude.toFixed(1)}° · {SIGNS[Math.floor(selected.longitude / 30)]}</strong></div><div><span>Ascendant</span><strong>{ascendant.toFixed(1)}° · {SIGNS[Math.floor(ascendant / 30)]}</strong></div></div>
    <footer>Illustrative positions for interface prototyping. Use a verified ephemeris for readings.</footer>
  </section>;
}

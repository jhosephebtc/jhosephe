import { useId, useState } from 'react';

const OBSERVATORIES = [
  { name: 'Fortaleza', zone: 'America/Fortaleza', lat: -3.7319, lon: -38.5267 },
  { name: 'Reykjavik', zone: 'Atlantic/Reykjavik', lat: 64.1466, lon: -21.9426 },
  { name: 'Mauna Kea', zone: 'Pacific/Honolulu', lat: 19.8207, lon: -155.4681 },
  { name: 'Atacama', zone: 'America/Santiago', lat: -23.8634, lon: -69.1328 },
];
const TARGETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
const localDateValue = (date = new Date()) => [String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

/** Observation picker for a place, date, local time, and solar-system target. */
export function EphemerisPicker({ onChange }: { onChange?: (selection: { location: string; date: string; time: string; target: string }) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(OBSERVATORIES[0].name);
  const [date, setDate] = useState(() => localDateValue());
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [target, setTarget] = useState('Sun');
  const [status, setStatus] = useState('Current observation');
  const selected = OBSERVATORIES.find(item => item.name === location) ?? OBSERVATORIES[0];
  const save = () => { onChange?.({ location, date, time, target }); setStatus(target + ' · ' + location); setOpen(false); };
  return <section className="jh-ephemeris-picker">
    <span className="jh-ephemeris-picker__eyebrow">Observation</span>
    <button type="button" className="jh-ephemeris-picker__trigger" aria-expanded={open} aria-controls={id + '-panel'} onClick={() => setOpen(value => !value)}><span className="jh-ephemeris-picker__glyph" aria-hidden="true">☉</span><span><strong>{target} · {location}</strong><small>{date} at {time} · {selected.zone}</small></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></button>
    {open && <div id={id + '-panel'} className="jh-ephemeris-picker__panel" role="group" aria-label="Choose an observation">
      <div className="jh-ephemeris-picker__panel-head"><div><strong>Set the sky</strong><span>Choose when and where to look.</span></div><button type="button" aria-label="Close observation picker" onClick={() => setOpen(false)}>×</button></div>
      <div className="jh-ephemeris-picker__fields"><label>Observatory<select value={location} onChange={event => setLocation(event.target.value)}>{OBSERVATORIES.map(item => <option key={item.name} value={item.name}>{item.name} · {item.zone}</option>)}</select></label><label>Date<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label>Local time<input type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div>
      <span className="jh-ephemeris-picker__label">Celestial body</span><div className="jh-ephemeris-picker__targets" role="group" aria-label="Celestial body">{TARGETS.map((item, index) => <button type="button" key={item} aria-pressed={target === item} onClick={() => setTarget(item)}><span aria-hidden="true">{['☉','☽','☿','♀','♂','♃','♄'][index]}</span>{item}</button>)}</div>
      <div className="jh-ephemeris-picker__coordinates"><span>Observer coordinates</span><strong>{selected.lat.toFixed(4)}°, {selected.lon.toFixed(4)}°</strong></div>
      <footer><button type="button" onClick={() => { setDate(localDateValue()); setTime(new Date().toTimeString().slice(0,5)); }}>Now</button><button type="button" className="jh-ephemeris-picker__apply" onClick={save}>Apply observation</button></footer>
    </div>}
    <span className="jh-visually-hidden" role="status">{status}</span>
  </section>;
}

import { useMemo, useState } from 'react';
import { Button } from './button';

/** Interactive monochrome motorsport telemetry mock-up with a living lap trace. */
export function RaceTelemetry({ driver = 'Car 16', circuit = 'Monaco', initialSpeed = 286 }: { driver?: string; circuit?: string; initialSpeed?: number }) {
  const [speed, setSpeed] = useState(initialSpeed);
  const [gear, setGear] = useState(6);
  const [lap, setLap] = useState(72);
  const samples = useMemo(() => Array.from({ length: 42 }, (_, index) => {
    const phase = (index / 41) * Math.PI * 4;
    return 54 + Math.sin(phase) * 24 + Math.sin(phase * 0.47 + 1.2) * 10 + Math.sin(phase * 2.1) * 4;
  }), []);
  const points = samples.map((value, index) => ({ x: index / 41 * 640, y: 118 - value }));
  const trace = points.map((point, index) => (index ? 'L' : 'M') + point.x + ' ' + point.y).join(' ');
  const adjust = (delta: number) => { setSpeed(value => Math.max(0, Math.min(360, value + delta))); setLap(value => Math.max(0, Math.min(100, value + delta / 4))); };
  return <section className="jh-race-telemetry" aria-label={circuit + ' race telemetry'}>
    <header><div><span className="jh-race-telemetry__eyebrow">Race telemetry · Demo</span><strong>{driver}</strong></div><span>{circuit} · Lap 24</span></header>
    <div className="jh-race-telemetry__readout"><div><output>{speed}</output><span>km/h</span></div><div className="jh-race-telemetry__gear"><span>Gear</span><strong>{gear}</strong></div><div><span>RPM</span><strong>{Math.round(speed * 39 + 3100).toLocaleString('en-US')}</strong></div></div>
    <div className="jh-race-telemetry__trace"><div><span>Throttle trace</span><span>Last 12 seconds</span></div><svg viewBox="0 0 640 140" preserveAspectRatio="none" role="img" aria-label="Animated throttle trace"><path d="M0 120H640" className="jh-race-telemetry__baseline" /><path d={trace} className="jh-race-telemetry__line" pathLength="1" /></svg></div>
    <div className="jh-race-telemetry__lap"><div><span>Lap progress</span><strong>{lap}%</strong></div><div className="jh-race-telemetry__track"><span style={{ width: lap + '%' }} /></div><div className="jh-race-telemetry__sectors"><span>Sector 1 <b>24.806</b></span><span>Sector 2 <b>31.442</b></span><span>Sector 3 <b>28.105</b></span></div></div>
    <footer><Button type="button" size="icon" variant="secondary" aria-label="Shift down" onClick={() => { setGear(value => Math.max(1, value - 1)); adjust(-12); }}>−</Button><span>Use the controls to scrub the telemetry</span><Button type="button" size="icon" variant="secondary" aria-label="Shift up" onClick={() => { setGear(value => Math.min(8, value + 1)); adjust(12); }}>+</Button></footer>
  </section>;
}

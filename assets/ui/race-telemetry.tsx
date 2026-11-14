import { useId, useMemo, useState } from 'react';
import { Button } from './button';
import { instrumentAccentStyle } from './utils';

/** Interactive monochrome motorsport telemetry mock-up with a living lap trace. */
export function RaceTelemetry({
  driver = 'Car 16',
  circuit = 'Monaco',
  initialSpeed = 286,
  accentColor,
}: {
  driver?: string;
  circuit?: string;
  initialSpeed?: number;
  accentColor?: string;
}) {
  const areaGradId = `jh-race-area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [speed, setSpeed] = useState(initialSpeed);
  const [gear, setGear] = useState(6);
  const [lap, setLap] = useState(72);

  const samples = useMemo(() => Array.from({ length: 42 }, (_, index) => {
    const phase = (index / 41) * Math.PI * 4;
    return 54 + Math.sin(phase) * 24 + Math.sin(phase * 0.47 + 1.2) * 10 + Math.sin(phase * 2.1) * 4;
  }), []);

  const points = samples.map((value, index) => ({ x: (index / 41) * 640, y: 118 - value }));
  const trace = points.map((point, index) => (index ? 'L' : 'M') + point.x.toFixed(1) + ' ' + point.y.toFixed(1)).join(' ');
  const areaPath = `${trace} L640 122 L0 122 Z`;
  const lastPoint = points[points.length - 1];

  const adjust = (delta: number) => {
    setSpeed(value => Math.max(0, Math.min(360, value + delta)));
    setLap(value => Math.max(0, Math.min(100, value + delta / 4)));
  };

  return (
    <section
      className="jh-race-telemetry"
      aria-label={`${circuit} race telemetry`}
      style={instrumentAccentStyle(accentColor)}
    >
      <header>
        <div>
          <span className="jh-race-telemetry__eyebrow">Race telemetry · Demo</span>
          <strong>{driver}</strong>
        </div>
        <span>{circuit} · Lap 24</span>
      </header>
      <div className="jh-race-telemetry__readout">
        <div className="jh-race-telemetry__cell jh-race-telemetry__cell--speed">
          <output>{speed}</output>
          <span>km/h</span>
        </div>
        <div className="jh-race-telemetry__cell jh-race-telemetry__gear">
          <span>Gear</span>
          <strong>{gear}</strong>
        </div>
        <div className="jh-race-telemetry__cell jh-race-telemetry__cell--rpm">
          <span>RPM</span>
          <strong>{Math.round(speed * 39 + 3100).toLocaleString('en-US')}</strong>
        </div>
      </div>
      <div className="jh-race-telemetry__trace">
        <div><span>Throttle trace</span><span>Last 12 seconds</span></div>
        <svg viewBox="0 0 640 140" preserveAspectRatio="none" role="img" aria-label="Animated throttle trace">
          <defs>
            <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--jh-instrument-accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--jh-instrument-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="jh-race-telemetry__grid">
            {[28, 58, 88].map(y => <line key={y} x1="0" y1={y} x2="640" y2={y} />)}
            {[160, 320, 480].map(x => <line key={x} x1={x} y1="14" x2={x} y2="122" />)}
          </g>
          <path d="M0 122H640" className="jh-race-telemetry__baseline" />
          <path d={areaPath} fill={`url(#${areaGradId})`} className="jh-race-telemetry__area" />
          <path d={trace} className="jh-race-telemetry__line" pathLength="1" />
          <circle cx={lastPoint.x} cy={lastPoint.y} r="4.5" className="jh-race-telemetry__dot" />
        </svg>
      </div>
      <div className="jh-race-telemetry__lap">
        <div><span>Lap progress</span><strong>{lap}%</strong></div>
        <div className="jh-race-telemetry__track"><span style={{ width: `${lap}%` }} /></div>
        <div className="jh-race-telemetry__sectors">
          <span>Sector 1 <b>24.806</b></span>
          <span>Sector 2 <b>31.442</b></span>
          <span>Sector 3 <b>28.105</b></span>
        </div>
      </div>
      <footer>
        <Button type="button" size="icon" variant="secondary" aria-label="Shift down" onClick={() => { setGear(value => Math.max(1, value - 1)); adjust(-12); }}>−</Button>
        <span>Use the controls to scrub the telemetry</span>
        <Button type="button" size="icon" variant="secondary" aria-label="Shift up" onClick={() => { setGear(value => Math.min(8, value + 1)); adjust(12); }}>+</Button>
      </footer>
    </section>
  );
}

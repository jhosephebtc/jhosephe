import { useId, useMemo, useState } from 'react';
import { Button } from './button';
import { Slider } from './controls';
import { SegmentedControl } from './segmented-control';
import {
  clamp,
  generateTideSeries,
  surfaceMaterialAttr,
  type SurfaceMaterial,
  type TideEvent,
  type TideSample,
  type TideTrend,
} from './weather-ephemeris';

const TREND_LABEL: Record<TideTrend, string> = {
  rising: 'Rising tide',
  falling: 'Falling tide',
  'high-slack': 'High slack',
  'low-slack': 'Low slack',
};

/** Coastal tide height, harmonic curve, and phase degree instrument for tide & ephemeris APIs. */
export function TideInstrument({
  station = 'Mucuripe Harbor',
  datum = 'MSL',
  date,
  samples: suppliedSamples,
  events: suppliedEvents,
  currentHeight: suppliedHeight,
  phaseDegrees: suppliedPhase,
  trend: suppliedTrend,
  tidalRange = 2.46,
  moonCoupling = 'Waxing · 78% · Spring tide',
  material = 'solid',
}: {
  station?: string;
  datum?: string;
  date?: Date;
  samples?: TideSample[];
  events?: TideEvent[];
  currentHeight?: number;
  phaseDegrees?: number;
  trend?: TideTrend;
  tidalRange?: number;
  moonCoupling?: string;
  material?: SurfaceMaterial;
}) {
  const id = useId();
  const [unit, setUnit] = useState<'m' | 'ft'>('m');
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);
  const moment = useMemo(() => date ?? new Date(), [date]);

  const model = useMemo(() => generateTideSeries(moment, tidalRange), [moment, tidalRange]);
  const samples = suppliedSamples?.length ? suppliedSamples : model.samples;
  const events = suppliedEvents?.length ? suppliedEvents : model.events;
  const trend = suppliedTrend ?? model.trend;

  const activeIndex = useMemo(() => {
    if (inspectIndex !== null) return clamp(inspectIndex, 0, samples.length - 1);
    const targetHour = model.currentHour;
    let best = 0;
    let bestDist = Infinity;
    samples.forEach((s, idx) => {
      const dist = Math.abs(s.hour - targetHour);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });
    return best;
  }, [inspectIndex, samples, model.currentHour]);

  const activeSample = samples[activeIndex];
  const displayHeightM =
    inspectIndex !== null ? activeSample.height : (suppliedHeight ?? model.currentHeight);
  const displayPhase =
    inspectIndex !== null ? activeSample.phaseDeg : (suppliedPhase ?? model.phaseDegrees);

  const fmtHeight = (meters: number) =>
    unit === 'ft' ? `${(meters * 3.28084).toFixed(2)} ft` : `${meters.toFixed(2)} m`;

  const fmtHour = (hour: number) => {
    const h = Math.floor(hour) % 24;
    const m = Math.round((hour - Math.floor(hour)) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const chart = useMemo(() => {
    const w = 360;
    const h = 112;
    const padX = 14;
    const padY = 16;
    const heights = samples.map(s => s.height);
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    const span = Math.max(0.2, max - min);
    const points = samples.map(s => ({
      x: padX + (s.hour / 24) * (w - padX * 2),
      y: padY + (1 - (s.height - min) / span) * (h - padY * 2),
    }));
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${points[points.length - 1].x.toFixed(1)} ${h - 6} L${points[0].x.toFixed(1)} ${h - 6} Z`;
    const activePt = points[activeIndex] ?? points[0];
    return { line, area, activePt, w, h, padX };
  }, [samples, activeIndex]);

  const matAttr = surfaceMaterialAttr(material);

  return (
    <section
      className="jh-tide-instrument"
      data-jh-material={matAttr}
      aria-labelledby={`${id}-title`}
    >
      <header className="jh-tide-instrument__header">
        <div>
          <span className="jh-tide-instrument__eyebrow">Tidal station · Datum {datum}</span>
          <h2 id={`${id}-title`}>{station}</h2>
          <p>{TREND_LABEL[trend]} · Phase {Math.round(displayPhase)}°</p>
        </div>
        <div className="jh-tide-instrument__unit">
          <SegmentedControl
            label="Tide height unit"
            value={unit}
            onValueChange={val => setUnit(val as 'm' | 'ft')}
            options={[
              { value: 'm', label: 'm' },
              { value: 'ft', label: 'ft' },
            ]}
          />
        </div>
      </header>

      <div className="jh-tide-instrument__wave">
        <div className="jh-tide-instrument__wave-readout">
          <div>
            <span>{inspectIndex !== null ? `At ${fmtHour(activeSample.hour)}` : 'Current level'}</span>
            <strong>{fmtHeight(displayHeightM)}</strong>
          </div>
          <div>
            <span>Harmonic angle</span>
            <strong>{Math.round(displayPhase)}°</strong>
          </div>
        </div>
        <svg
          viewBox={`0 0 ${chart.w} ${chart.h}`}
          role="img"
          aria-label={`24-hour tidal curve at ${station}, ${fmtHeight(displayHeightM)} at ${Math.round(displayPhase)} degrees`}
        >
          <line x1={chart.padX} y1={chart.h / 2} x2={chart.w - chart.padX} y2={chart.h / 2} className="jh-tide-instrument__datum" />
          <path d={chart.area} className="jh-tide-instrument__area" />
          <path d={chart.line} className="jh-tide-instrument__curve" />
          <line
            x1={chart.activePt.x}
            y1={10}
            x2={chart.activePt.x}
            y2={chart.h - 10}
            className="jh-tide-instrument__cursor"
          />
          <circle cx={chart.activePt.x} cy={chart.activePt.y} r="7" className="jh-tide-instrument__marker-halo" />
          <circle cx={chart.activePt.x} cy={chart.activePt.y} r="3.5" className="jh-tide-instrument__marker" />
          <text x={chart.padX} y={chart.h - 1}>00:00</text>
          <text x={chart.w / 2} y={chart.h - 1} textAnchor="middle">12:00</text>
          <text x={chart.w - chart.padX} y={chart.h - 1} textAnchor="end">24:00</text>
        </svg>
        <div className="jh-tide-instrument__scrubber">
          <span id={`${id}-tide-hour-label`}>Inspect hour</span>
          <Slider
            labelId={`${id}-tide-hour-label`}
            className="jh-scrubber-slider"
            min={0}
            max={samples.length - 1}
            step={1}
            value={[activeIndex]}
            thumbThickness={14}
            thumbHeight={24}
            thumbRadius={7}
            onValueChange={([idx]) => setInspectIndex(idx)}
          />
          <Button
            size="small"
            variant="secondary"
            disabled={inspectIndex === null}
            onClick={() => setInspectIndex(null)}
          >
            Live
          </Button>
        </div>
      </div>

      <div className="jh-tide-instrument__events">
        {events.slice(0, 2).map((evt, idx) => (
          <div key={`${evt.type}-${idx}`}>
            <span>Next {evt.type.toLowerCase()} tide</span>
            <strong>{evt.time} · {fmtHeight(evt.height)}</strong>
          </div>
        ))}
        <div>
          <span>Tidal range</span>
          <strong>{fmtHeight(tidalRange)}</strong>
        </div>
        <div>
          <span>Lunar coupling</span>
          <strong>{moonCoupling}</strong>
        </div>
      </div>
    </section>
  );
}

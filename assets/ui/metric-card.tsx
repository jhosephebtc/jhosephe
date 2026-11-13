import { useId, useMemo, useState } from 'react';
import { ShaderSurface } from './shader-surface';
import { cn } from './utils';
import { clamp, normalizeSurfaceMaterial, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface MetricPoint {
  label: string;
  value: number;
}

const DEFAULT_SERIES: MetricPoint[] = [
  { label: '00:00', value: 1012.4 },
  { label: '02:00', value: 1012.9 },
  { label: '04:00', value: 1013.6 },
  { label: '06:00', value: 1014.1 },
  { label: '08:00', value: 1013.8 },
  { label: '10:00', value: 1012.9 },
  { label: '12:00', value: 1011.7 },
  { label: '14:00', value: 1010.8 },
  { label: '16:00', value: 1011.5 },
  { label: '18:00', value: 1012.8 },
  { label: '20:00', value: 1014.2 },
  { label: '21:00', value: 1014.7 },
  { label: '22:00', value: 1015.0 },
  { label: '23:00', value: 1015.4 },
];

/** Monochrome KPI and telemetry metric card with hairline vector sparkline, mean baseline, and hover telemetry. */
export function MetricCard({
  label = 'Barometric pressure',
  value = 1015.4,
  unit = 'hPa',
  delta = '+2.4 hPa',
  deltaDirection = 'up',
  caption = '24h coastal station · Sensor 02B',
  series = DEFAULT_SERIES,
  material = 'solid',
  className,
}: {
  label?: string;
  value?: string | number;
  unit?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'neutral';
  caption?: string;
  series?: MetricPoint[];
  material?: SurfaceMaterial;
  className?: string;
}) {
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);
  const clipId = `jh-metric-area-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const finish = normalizeSurfaceMaterial(material);
  const matAttr = surfaceMaterialAttr(material);

  const chart = useMemo(() => {
    const W = 280;
    const H = 68;
    const padX = 6;
    const padY = 8;
    if (!series.length) {
      return {
        W,
        H,
        line: '',
        area: '',
        meanY: H / 2,
        minVal: 0,
        maxVal: 0,
        avgVal: 0,
        rangeVal: 0,
        points: [] as Array<{ x: number; y: number; point: MetricPoint }>,
      };
    }
    const vals = series.map(p => p.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const avgVal = vals.reduce((acc, item) => acc + item, 0) / vals.length;
    const rangeVal = maxVal - minVal;
    const span = Math.max(0.001, rangeVal);
    const toY = (v: number) => H - padY - ((v - minVal) / span) * (H - padY * 2);
    const points = series.map((point, index) => {
      const ratioX = series.length === 1 ? 0.5 : index / (series.length - 1);
      const x = padX + ratioX * (W - padX * 2);
      const y = toY(point.value);
      return { x, y, point };
    });
    const line = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${points[points.length - 1].x.toFixed(1)},${H - 2} L${points[0].x.toFixed(1)},${H - 2} Z`;
    return { W, H, line, area, meanY: toY(avgVal), minVal, maxVal, avgVal, rangeVal, points };
  }, [series]);

  const activePoint = inspectIndex !== null ? chart.points[clamp(inspectIndex, 0, chart.points.length - 1)] : null;
  const focusedIndex = inspectIndex !== null ? clamp(inspectIndex, 0, chart.points.length - 1) : chart.points.length - 1;
  const focusedPoint = chart.points[focusedIndex] ?? null;
  const displayValue = activePoint ? activePoint.point.value : value;
  const displayCaption = activePoint ? `${activePoint.point.label} UTC sample` : caption;
  const deltaPrefix = deltaDirection === 'up' ? '↗' : deltaDirection === 'down' ? '↘' : '·';
  const formatStat = (num: number) => Number.isInteger(num) ? String(num) : num.toFixed(1);
  const hitWidth = chart.points.length > 1 ? chart.W / chart.points.length : chart.W;

  return (
    <section
      className={cn('jh-metric-card', finish === 'liquid' && 'jh-metric-card--liquid', className)}
      data-jh-material={matAttr}
      aria-label={label}
    >
      {finish === 'liquid' ? <ShaderSurface /> : null}
      <div className="jh-metric-card__header">
        <span className="jh-metric-card__eyebrow">{label}</span>
        {delta ? (
          <span className="jh-metric-card__delta">
            <span aria-hidden="true">{deltaPrefix}</span>
            <span>{delta}</span>
          </span>
        ) : null}
      </div>

      <div className="jh-metric-card__reading">
        <strong className="jh-metric-card__value">{displayValue}</strong>
        {unit ? <span className="jh-metric-card__unit">{unit}</span> : null}
      </div>

      {chart.points.length > 0 ? (
        <div
          className="jh-metric-card__well"
          onMouseLeave={() => setInspectIndex(null)}
        >
          <svg
            viewBox={`0 0 ${chart.W} ${chart.H}`}
            className="jh-metric-card__sparkline"
            role="img"
            aria-label={`${label} trend`}
          >
            <defs>
              <linearGradient id={clipId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.10" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.2, 0.5, 0.8].map(ratio => (
              <line
                key={ratio}
                x1={0}
                y1={(chart.H * ratio).toFixed(1)}
                x2={chart.W}
                y2={(chart.H * ratio).toFixed(1)}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="0.75"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1={0}
              y1={chart.meanY.toFixed(1)}
              x2={chart.W}
              y2={chart.meanY.toFixed(1)}
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="0.75"
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />
            {focusedPoint ? (
              <line
                x1={focusedPoint.x.toFixed(1)}
                y1={2}
                x2={focusedPoint.x.toFixed(1)}
                y2={chart.H - 2}
                stroke="currentColor"
                strokeOpacity="0.20"
                strokeWidth="0.75"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            <path d={chart.area} fill={`url(#${clipId})`} />
            <path
              d={chart.line}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.68"
              strokeWidth="0.95"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {chart.points.map((pt, index) => {
              const isFocused = index === focusedIndex;
              return (
                <g key={`${pt.point.label}-${index}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isFocused ? 2.4 : 1.15}
                    fill="currentColor"
                    fillOpacity={isFocused ? 1 : 0.3}
                  />
                  <rect
                    x={pt.x - hitWidth / 2}
                    y={0}
                    width={hitWidth}
                    height={chart.H}
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    onMouseEnter={() => setInspectIndex(index)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      ) : null}

      {chart.points.length > 1 ? (
        <dl className="jh-metric-card__stats">
          <div className="jh-metric-card__stat">
            <dt>Min</dt>
            <dd>{formatStat(chart.minVal)}</dd>
          </div>
          <div className="jh-metric-card__stat">
            <dt>Mean</dt>
            <dd>{formatStat(chart.avgVal)}</dd>
          </div>
          <div className="jh-metric-card__stat">
            <dt>Max</dt>
            <dd>{formatStat(chart.maxVal)}</dd>
          </div>
          <div className="jh-metric-card__stat">
            <dt>Spread</dt>
            <dd>{formatStat(chart.rangeVal)}</dd>
          </div>
        </dl>
      ) : null}

      <div className="jh-metric-card__footer">
        <span>{displayCaption}</span>
        {series.length > 1 ? <span>{series.length} samples</span> : null}
      </div>
    </section>
  );
}

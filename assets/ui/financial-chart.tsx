import { useId, useMemo, useState, type PointerEvent } from 'react';
import { SegmentedControl } from './segmented-control';

type Period = '1D' | '1W' | '1M' | '1Y';
type ChartMode = 'line' | 'bars';
const PERIODS: Period[] = ['1D', '1W', '1M', '1Y'];
const BASE = [148.2,148.7,148.4,149.1,148.9,149.5,149.2,148.8,149.4,150.1,149.8,150.4,150.2,149.6,149.9,150.8,150.5,150.9,151.3,150.7,151.1,151.8,151.5,152.2,151.9,152.6,152.1,152.8,153.3,152.9,153.6,153.1,153.9,154.3,153.8,154.6,154.2,154.9,155.4,154.8,155.2,155.8,155.4,156.1,155.7,156.4,156.8,156.3];
const PERIOD_DELTA: Record<Period, number> = { '1D': 0, '1W': -2.2, '1M': -7.4, '1Y': -18.6 };
const LABELS: Record<Period, string[]> = {
  '1D': ['9:30','10:30','11:30','12:30','1:30','2:30','3:30','4:00'],
  '1W': ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  '1M': ['Oct 14','Oct 19','Oct 24','Oct 29','Nov 03','Nov 08','Nov 12'],
  '1Y': ['Dec','Feb','Apr','Jun','Aug','Oct','Nov'],
};
function valuesFor(period: Period) {
  const scale = period === '1D' ? 0.34 : period === '1W' ? 0.72 : period === '1M' ? 1.2 : 2.1;
  return BASE.map((value, index) => 150 + (value - 150) * scale + PERIOD_DELTA[period] + Math.sin(index * 1.7) * scale * 0.7);
}

/** Interactive, caller-fed market chart. Default values are static demo data. */
export function FinancialChart({ symbol = 'NOVA', company = 'Nova Systems', currency = 'USD', initialPeriod = '1D' }: {
  symbol?: string; company?: string; currency?: string; initialPeriod?: Period;
}) {
  const gradientId = useId();
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [mode, setMode] = useState<ChartMode>('line');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const values = useMemo(() => valuesFor(period), [period]);
  const low = Math.min(...values) - 1.5;
  const high = Math.max(...values) + 1.5;
  const points = values.map((value, index) => ({
    x: 20 + (index / (values.length - 1)) * 960,
    y: 18 + (1 - (value - low) / (high - low)) * 212,
  }));
  const path = points.map((point, index) => (index ? 'L' : 'M') + point.x.toFixed(1) + ' ' + point.y.toFixed(1)).join(' ');
  const area = path + ' L980 252 L20 252 Z';
  const last = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const changePercent = first ? ((last - first) / first) * 100 : 0;
  const selectedIndex = activeIndex ?? values.length - 1;
  const selected = values[selectedIndex] ?? last;
  const selectedPoint = points[selectedIndex];
  const format = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
  const choosePoint = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    setActiveIndex(Math.round(ratio * (values.length - 1)));
  };

  return (
    <section className="jh-financial-chart" aria-label={company + ' ' + symbol + ' market chart'}>
      <header className="jh-financial-chart__header">
        <div className="jh-financial-chart__identity">
          <span className="jh-financial-chart__mark" aria-hidden="true">{symbol.slice(0, 1)}</span>
          <div><strong>{symbol}</strong><span>{company}</span></div>
        </div>
        <div className="jh-financial-chart__quote">
          <output>{format(selected)}</output>
          <span data-positive={changePercent >= 0}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}% <small>today</small>
          </span>
        </div>
      </header>
      <div className="jh-financial-chart__toolbar">
        <SegmentedControl
          label="Chart period"
          value={period}
          onValueChange={value => { setPeriod(value as Period); setActiveIndex(null); }}
          options={PERIODS.map(item => ({ value: item, label: item }))}
        />
        <SegmentedControl
          label="Chart style"
          value={mode}
          onValueChange={value => setMode(value as ChartMode)}
          options={[
            { value: 'line', label: 'Line' },
            { value: 'bars', label: 'Bars' },
          ]}
        />
      </div>
      <div className="jh-financial-chart__plot-wrap">
        <div className="jh-financial-chart__axis" aria-hidden="true">
          <span>{format(high)}</span>
          <span>{format((high + low) / 2)}</span>
          <span>{format(low)}</span>
        </div>
        <svg
          className="jh-financial-chart__plot"
          viewBox="0 0 1000 270"
          preserveAspectRatio="none"
          role="img"
          aria-label={period + ' price chart. ' + symbol + ' is at ' + format(selected)}
          onPointerMove={choosePoint}
          onPointerDown={choosePoint}
          onPointerLeave={() => setActiveIndex(null)}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') setActiveIndex(Math.max(0, selectedIndex - 1));
            if (event.key === 'ArrowRight') setActiveIndex(Math.min(values.length - 1, selectedIndex + 1));
            if (event.key === 'Home') setActiveIndex(0);
            if (event.key === 'End') setActiveIndex(values.length - 1);
          }}
          tabIndex={0}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity=".14" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[62, 126, 190, 252].map(y => <path key={y} d={'M0 ' + y + 'H1000'} className="jh-financial-chart__gridline" />)}
          {mode === 'line' ? (
            <>
              <path d={area} className="jh-financial-chart__area" style={{ fill: 'url(#' + gradientId + ')' }} />
              <path d={path} className="jh-financial-chart__line" pathLength="1" />
            </>
          ) : values.map((value, index) => {
            const point = points[index];
            return <rect key={index} x={point.x - 5} y={point.y} width="10" height={232 - point.y} rx="3" className="jh-financial-chart__bar" data-selected={selectedIndex === index} />;
          })}
          {activeIndex !== null && selectedPoint && (
            <>
              <path d={'M' + selectedPoint.x + ' 0V252'} className="jh-financial-chart__crosshair" />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="6" className="jh-financial-chart__point-halo" />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="3" className="jh-financial-chart__point" />
            </>
          )}
        </svg>
      </div>
      <div className="jh-financial-chart__timeline" aria-hidden="true">
        {LABELS[period].map(label => <span key={label}>{label}</span>)}
      </div>
      <div className="jh-financial-chart__footer">
        <span>Market data · Demo</span>
        <span>Volume <strong>2.48M</strong></span>
      </div>
    </section>
  );
}

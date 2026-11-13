import { useId, useMemo, useState } from 'react';
import { SegmentedControl } from './segmented-control';
import {
  dewPointCelsius,
  surfaceMaterialAttr,
  toFahrenheit,
  uvCategory,
  type SurfaceMaterial,
  type WeatherConditionKind,
} from './weather-ephemeris';

export interface HourlyConditionPoint {
  time: string;
  tempC: number;
  precipitationChance: number;
  condition?: WeatherConditionKind;
}

export interface DailyConditionPoint {
  day: string;
  highC: number;
  lowC: number;
  precipitationChance: number;
  condition?: WeatherConditionKind;
}

const DEFAULT_HOURLY: HourlyConditionPoint[] = [
  { time: '09:00', tempC: 24.8, precipitationChance: 10, condition: 'partly-cloudy' },
  { time: '12:00', tempC: 27.6, precipitationChance: 15, condition: 'clear' },
  { time: '15:00', tempC: 28.9, precipitationChance: 20, condition: 'partly-cloudy' },
  { time: '18:00', tempC: 26.2, precipitationChance: 25, condition: 'cloudy' },
  { time: '21:00', tempC: 24.1, precipitationChance: 15, condition: 'partly-cloudy' },
  { time: '00:00', tempC: 22.9, precipitationChance: 10, condition: 'clear' },
];

const DEFAULT_DAILY: DailyConditionPoint[] = [
  { day: 'Thu', highC: 29.2, lowC: 22.8, precipitationChance: 15, condition: 'partly-cloudy' },
  { day: 'Fri', highC: 28.6, lowC: 22.4, precipitationChance: 30, condition: 'cloudy' },
  { day: 'Sat', highC: 27.4, lowC: 21.9, precipitationChance: 55, condition: 'rain' },
  { day: 'Sun', highC: 28.1, lowC: 22.1, precipitationChance: 20, condition: 'partly-cloudy' },
  { day: 'Mon', highC: 29.8, lowC: 23.0, precipitationChance: 5, condition: 'clear' },
];

function ConditionGlyph({ kind = 'partly-cloudy' }: { kind?: WeatherConditionKind }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (kind) {
    case 'clear':
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <g {...common}>
            <circle cx="14" cy="14" r="5" />
            <path d="M14 4v2.5M14 21.5V24M4 14h2.5M21.5 14H24M7 7l1.8 1.8M19.2 19.2 21 21M21 7l-1.8 1.8M8.8 19.2 7 21" />
          </g>
        </svg>
      );
    case 'cloudy':
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <path {...common} d="M9.5 20h10a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6-1.3A3.8 3.8 0 0 0 9.5 20Z" />
        </svg>
      );
    case 'rain':
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <g {...common}>
            <path d="M9.5 17.5h10a3.8 3.8 0 0 0 .4-7.6 5.2 5.2 0 0 0-10.1-1.2A3.6 3.6 0 0 0 9.5 17.5Z" />
            <path d="M10.5 20.5 9.2 23.5M14.5 20.5l-1.3 3M18.5 20.5l-1.3 3" />
          </g>
        </svg>
      );
    case 'storm':
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <g {...common}>
            <path d="M9.5 16.5h10a3.8 3.8 0 0 0 .4-7.6 5.2 5.2 0 0 0-10.1-1.2A3.6 3.6 0 0 0 9.5 16.5Z" />
            <path d="M14.5 17.5 12 21.5h3l-1.5 3.5" />
          </g>
        </svg>
      );
    case 'wind':
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <path {...common} d="M5 11.5h13a2.5 2.5 0 1 0-2.5-2.5M5 15.5h16a2.5 2.5 0 1 1-2.5 2.5M5 19.5h8" />
        </svg>
      );
    case 'fog':
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <path {...common} d="M6 10.5h16M4.5 14.5h19M7 18.5h14" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 28 28" aria-hidden="true">
          <g {...common}>
            <circle cx="10.5" cy="10.5" r="3.5" />
            <path d="M10.5 4.5v1.4M4.5 10.5h1.4M6.3 6.3l1 1M14.7 6.3l-1 1" />
            <path d="M10.5 21h9a3.5 3.5 0 0 0 .4-7 4.8 4.8 0 0 0-9.2-1.1A3.3 3.3 0 0 0 10.5 21Z" />
          </g>
        </svg>
      );
  }
}

/** Atmospheric conditions card structured for Google Weather API current, hourly, and daily payloads. */
export function WeatherConditions({
  location = 'Fortaleza, BR',
  condition = 'partly-cloudy',
  conditionText = 'Partly cloudy',
  temperature = 26.4,
  feelsLike = 28.1,
  high = 29.2,
  low = 22.8,
  humidity = 64,
  uvIndex = 7,
  pressure = 1014,
  visibility = 16,
  cloudCover = 32,
  precipitationChance = 15,
  dewPoint,
  observedAt = 'Observed locally',
  hourly = DEFAULT_HOURLY,
  daily = DEFAULT_DAILY,
  unit: controlledUnit,
  onUnitChange,
  material = 'solid',
}: {
  location?: string;
  condition?: WeatherConditionKind;
  conditionText?: string;
  temperature?: number;
  feelsLike?: number;
  high?: number;
  low?: number;
  humidity?: number;
  uvIndex?: number;
  pressure?: number;
  visibility?: number;
  cloudCover?: number;
  precipitationChance?: number;
  dewPoint?: number;
  observedAt?: string;
  hourly?: HourlyConditionPoint[];
  daily?: DailyConditionPoint[];
  unit?: 'C' | 'F';
  onUnitChange?: (unit: 'C' | 'F') => void;
  material?: SurfaceMaterial;
}) {
  const id = useId();
  const [internalUnit, setInternalUnit] = useState<'C' | 'F'>('C');
  const [horizon, setHorizon] = useState<'hourly' | 'daily'>('hourly');
  const unit = controlledUnit ?? internalUnit;

  const setUnit = (next: 'C' | 'F') => {
    setInternalUnit(next);
    onUnitChange?.(next);
  };

  const formatTemp = (celsius: number, decimals = 1) => {
    const val = unit === 'F' ? toFahrenheit(celsius) : celsius;
    return `${val.toFixed(decimals)}°`;
  };

  const computedDew = dewPoint ?? dewPointCelsius(temperature, humidity);
  const matAttr = surfaceMaterialAttr(material);

  const curvePath = useMemo(() => {
    const values = horizon === 'hourly' ? hourly.map(h => h.tempC) : daily.map(d => d.highC);
    if (values.length < 2) return { line: '', area: '', min: 0, max: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(1, max - min);
    const width = 320;
    const height = 44;
    const pts = values.map((v, i) => ({
      x: (i / (values.length - 1)) * width,
      y: 8 + (1 - (v - min) / span) * (height - 16),
    }));
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const area = `${line} L${width} ${height} L0 ${height} Z`;
    return { line, area, min, max };
  }, [horizon, hourly, daily]);

  return (
    <section
      className="jh-weather-conditions"
      data-jh-material={matAttr}
      aria-labelledby={`${id}-title`}
    >
      <header className="jh-weather-conditions__header">
        <div>
          <span className="jh-weather-conditions__eyebrow">Meteorology · {observedAt}</span>
          <h2 id={`${id}-title`}>{location}</h2>
          <p>{conditionText} · Precip {Math.round(precipitationChance)}%</p>
        </div>
        <div className="jh-weather-conditions__unit-toggle">
          <SegmentedControl
            label="Temperature unit"
            value={unit}
            onValueChange={val => setUnit(val as 'C' | 'F')}
            options={[
              { value: 'C', label: '°C' },
              { value: 'F', label: '°F' },
            ]}
          />
        </div>
      </header>

      <div className="jh-weather-conditions__hero">
        <div className="jh-weather-conditions__glyph" aria-hidden="true">
          <ConditionGlyph kind={condition} />
        </div>
        <div className="jh-weather-conditions__temp">
          <output aria-label="Current temperature">
            {formatTemp(temperature, 1)}
            <span>{unit}</span>
          </output>
          <small>
            Feels like {formatTemp(feelsLike, 1)} · H {formatTemp(high, 0)} · L {formatTemp(low, 0)}
          </small>
        </div>
      </div>

      <div className="jh-weather-conditions__metrics">
        <div><span>Humidity</span><strong>{Math.round(humidity)}%</strong></div>
        <div><span>UV index</span><strong>{uvIndex.toFixed(0)} · {uvCategory(uvIndex)}</strong></div>
        <div><span>Dew point</span><strong>{formatTemp(computedDew, 1)}</strong></div>
        <div><span>Pressure</span><strong>{Math.round(pressure)} hPa</strong></div>
        <div><span>Visibility</span><strong>{visibility.toFixed(0)} km</strong></div>
        <div><span>Cloud cover</span><strong>{Math.round(cloudCover)}%</strong></div>
      </div>

      <div className="jh-weather-conditions__forecast">
        <div className="jh-weather-conditions__forecast-head">
          <span>Forecast trend</span>
          <SegmentedControl
            label="Forecast horizon"
            value={horizon}
            onValueChange={val => setHorizon(val as 'hourly' | 'daily')}
            options={[
              { value: 'hourly', label: 'Hourly' },
              { value: 'daily', label: 'Daily' },
            ]}
          />
        </div>

        {curvePath.line && (
          <svg className="jh-weather-conditions__spark" viewBox="0 0 320 44" aria-hidden="true">
            <path d={curvePath.area} className="jh-weather-conditions__spark-area" />
            <path d={curvePath.line} className="jh-weather-conditions__spark-line" />
          </svg>
        )}

        <div className="jh-weather-conditions__strip" role="list" aria-label={`${horizon} forecast`}>
          {horizon === 'hourly'
            ? hourly.map(slot => (
                <div className="jh-weather-conditions__slot" role="listitem" key={slot.time}>
                  <span>{slot.time}</span>
                  <span className="jh-weather-conditions__slot-icon" aria-hidden="true">
                    <ConditionGlyph kind={slot.condition} />
                  </span>
                  <strong>{formatTemp(slot.tempC, 0)}</strong>
                  <small>{Math.round(slot.precipitationChance)}%</small>
                </div>
              ))
            : daily.map(day => (
                <div className="jh-weather-conditions__slot" role="listitem" key={day.day}>
                  <span>{day.day}</span>
                  <span className="jh-weather-conditions__slot-icon" aria-hidden="true">
                    <ConditionGlyph kind={day.condition} />
                  </span>
                  <strong>{formatTemp(day.highC, 0)}</strong>
                  <small>{formatTemp(day.lowC, 0)}</small>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

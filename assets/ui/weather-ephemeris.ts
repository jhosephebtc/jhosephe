export type SurfaceMaterial = 'solid' | 'glass' | 'liquid' | 'liquid-glass';

export const normalizeSurfaceMaterial = (material: SurfaceMaterial = 'solid') =>
  material === 'liquid-glass' ? 'glass' : material;

export const surfaceMaterialAttr = (material: SurfaceMaterial = 'solid') =>
  normalizeSurfaceMaterial(material) === 'glass' ? 'liquid-glass' : normalizeSurfaceMaterial(material);

export type WindUnit = 'km/h' | 'kt' | 'm/s';

export type WeatherConditionKind =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'wind'
  | 'fog';

export type TideTrend = 'rising' | 'falling' | 'high-slack' | 'low-slack';

export interface TideSample {
  hour: number;
  height: number;
  phaseDeg: number;
}

export interface TideEvent {
  type: 'High' | 'Low';
  time: string;
  height: number;
}

const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] as const;

const BEAUFORT_SCALE = [
  { maxKmh: 1, force: 0, label: 'Calm' },
  { maxKmh: 5, force: 1, label: 'Light air' },
  { maxKmh: 11, force: 2, label: 'Light breeze' },
  { maxKmh: 19, force: 3, label: 'Gentle breeze' },
  { maxKmh: 28, force: 4, label: 'Moderate breeze' },
  { maxKmh: 38, force: 5, label: 'Fresh breeze' },
  { maxKmh: 49, force: 6, label: 'Strong breeze' },
  { maxKmh: 61, force: 7, label: 'High wind' },
  { maxKmh: 74, force: 8, label: 'Gale' },
  { maxKmh: 88, force: 9, label: 'Strong gale' },
  { maxKmh: 102, force: 10, label: 'Storm' },
  { maxKmh: 117, force: 11, label: 'Violent storm' },
  { maxKmh: Infinity, force: 12, label: 'Hurricane force' },
] as const;

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const normalizeDegrees = (deg: number) => ((deg % 360) + 360) % 360;

export function cardinalDirection(degrees: number): string {
  const norm = normalizeDegrees(degrees);
  return CARDINALS[Math.round(norm / 22.5) % 16];
}

export function beaufortFromKmh(kmh: number): { force: number; label: string } {
  const safe = Math.max(0, kmh);
  const entry = BEAUFORT_SCALE.find(item => safe <= item.maxKmh) ?? BEAUFORT_SCALE[BEAUFORT_SCALE.length - 1];
  return { force: entry.force, label: entry.label };
}

export function convertWindSpeed(kmh: number, unit: WindUnit): number {
  const safe = Math.max(0, kmh);
  if (unit === 'kt') return safe * 0.539957;
  if (unit === 'm/s') return safe / 3.6;
  return safe;
}

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/** Magnus-Tetens dew point approximation in Celsius. */
export function dewPointCelsius(tempC: number, humidityPct: number): number {
  const rh = clamp(humidityPct, 1, 100);
  const a = 17.625;
  const b = 243.04;
  const alpha = Math.log(rh / 100) + (a * tempC) / (b + tempC);
  return (b * alpha) / (a - alpha);
}

export function uvCategory(uv: number): string {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very high';
  return 'Extreme';
}

const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

/** Approximate lunar ephemeris values suitable for UI defaults before connecting an ephemeris API. */
export function computeLunarEphemeris(date: Date, latitude = -3.7319, longitude = -38.5267) {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON_MS) / 86400000;
  const cycles = daysSince / SYNODIC_MONTH;
  const frac = ((cycles % 1) + 1) % 1;
  const ageDays = frac * SYNODIC_MONTH;
  const phaseAngle = frac * 360;
  const illumination = ((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2) * 100;

  let phaseName = 'New moon';
  if (phaseAngle >= 11 && phaseAngle < 79) phaseName = 'Waxing crescent';
  else if (phaseAngle >= 79 && phaseAngle < 101) phaseName = 'First quarter';
  else if (phaseAngle >= 101 && phaseAngle < 169) phaseName = 'Waxing gibbous';
  else if (phaseAngle >= 169 && phaseAngle < 191) phaseName = 'Full moon';
  else if (phaseAngle >= 191 && phaseAngle < 259) phaseName = 'Waning gibbous';
  else if (phaseAngle >= 259 && phaseAngle < 281) phaseName = 'Last quarter';
  else if (phaseAngle >= 281 && phaseAngle < 349) phaseName = 'Waning crescent';

  const anomalyRad = ((daysSince / 27.55455) % 1) * Math.PI * 2;
  const distanceKm = Math.round(384400 - 21000 * Math.cos(anomalyRad));

  // Approximate rise/set offset by ~50 minutes per lunar day relative to sunrise/sunset.
  const riseMinutes = Math.round((360 + ageDays * 50.47 - longitude * 0.25) % 1440);
  const setMinutes = Math.round((riseMinutes + 732) % 1440);
  const formatMinutes = (total: number) => {
    const safe = ((total % 1440) + 1440) % 1440;
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
  };

  const hour = date.getHours() + date.getMinutes() / 60;
  const hourAngle = ((hour - 12) * 15 - phaseAngle + 360) % 360;
  const altitude = clamp(
    Math.cos(((hourAngle - 180) * Math.PI) / 180) * (65 - Math.abs(latitude) * 0.45),
    -65,
    85,
  );
  const azimuth = normalizeDegrees(hourAngle);

  return {
    phaseAngle,
    illumination,
    ageDays,
    phaseName,
    distanceKm,
    moonrise: formatMinutes(riseMinutes),
    moonset: formatMinutes(setMinutes),
    altitude,
    azimuth,
  };
}

/** Generate a 24-hour semidiurnal harmonic tide curve for UI preview/fallback. */
export function generateTideSeries(date: Date, rangeM = 2.4, datumOffsetM = 1.45) {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const currentHour = clamp((date.getTime() - dayStart.getTime()) / 3600000, 0, 24);
  const periodHours = 12.42;
  const phaseShift = ((date.getDate() * 0.82) % periodHours);

  const evalAt = (h: number) => {
    const theta = ((h + phaseShift) / periodHours) * Math.PI * 2;
    const height = datumOffsetM + (rangeM / 2) * Math.sin(theta) + (rangeM * 0.06) * Math.sin(theta * 2 + 0.4);
    const phaseDeg = normalizeDegrees((theta * 180) / Math.PI);
    return { height, phaseDeg };
  };

  const samples: TideSample[] = [];
  for (let i = 0; i <= 48; i++) {
    const hour = i * 0.5;
    const { height, phaseDeg } = evalAt(hour);
    samples.push({ hour, height: Number(height.toFixed(2)), phaseDeg: Math.round(phaseDeg) });
  }

  const now = evalAt(currentHour);
  const next = evalAt(currentHour + 0.15);
  const delta = next.height - now.height;
  let trend: TideTrend = delta >= 0 ? 'rising' : 'falling';
  if (Math.abs(delta) < 0.015) trend = now.height >= datumOffsetM ? 'high-slack' : 'low-slack';

  const events: TideEvent[] = [];
  for (let i = 1; i < samples.length - 1; i++) {
    const prev = samples[i - 1];
    const curr = samples[i];
    const nxt = samples[i + 1];
    if (curr.hour < currentHour) continue;
    if (curr.height >= prev.height && curr.height > nxt.height) {
      const hh = Math.floor(curr.hour) % 24;
      const mm = Math.round((curr.hour - Math.floor(curr.hour)) * 60);
      events.push({ type: 'High', time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, height: curr.height });
    } else if (curr.height <= prev.height && curr.height < nxt.height) {
      const hh = Math.floor(curr.hour) % 24;
      const mm = Math.round((curr.hour - Math.floor(curr.hour)) * 60);
      events.push({ type: 'Low', time: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, height: curr.height });
    }
    if (events.length >= 2) break;
  }

  return {
    samples,
    currentHour,
    currentHeight: Number(now.height.toFixed(2)),
    phaseDegrees: Math.round(now.phaseDeg),
    trend,
    events,
  };
}

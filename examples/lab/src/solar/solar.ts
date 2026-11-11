import { getPosition, getTimes } from 'suncalc';
import tzLookup from 'tz-lookup';

export interface Location { name: string; latitude: number; longitude: number; timeZone: string }
// A reference city, never a claim about the viewer's actual position.
export const DEFAULT_LOCATION: Location = {
  name: 'Fortaleza', latitude: -3.7319, longitude: -38.5267, timeZone: 'America/Fortaleza',
};
export interface SolarEvent { kind: 'sunrise' | 'sunset'; time: Date }
export interface SolarSnapshot {
  now: Date; location: Location; altitude: number; azimuth: number;
  sunrise: Date | null; sunset: Date | null; solarNoon: Date | null;
  dayLengthSeconds: number; nextEvent: SolarEvent | null;
  status: 'day' | 'night' | 'twilight' | 'polar-day' | 'polar-night';
  daylightProgress: number | null; dayStart: Date; dayEnd: Date;
}
export interface SolarPathPoint { time: Date; altitude: number; azimuth: number }

const DAY = 86_400_000;
const formatters = new Map<string, Intl.DateTimeFormat>();
function zoneFormatter(timeZone: string) {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    });
    if (formatters.size > 32) formatters.delete(formatters.keys().next().value!);
    formatters.set(timeZone, formatter);
  }
  return formatter;
}
function partsAt(date: Date, timeZone: string) {
  const parts = Object.fromEntries(zoneFormatter(timeZone).formatToParts(date).map(p => [p.type, p.value]));
  return { year: +parts.year, month: +parts.month, day: +parts.day, hour: +parts.hour, minute: +parts.minute, second: +parts.second };
}
function offsetMinutes(date: Date, timeZone: string) {
  const p = partsAt(date, timeZone);
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(+date / 1000) * 1000) / 60_000;
}
function civilKey(date: Date, timeZone: string) {
  const p = partsAt(date, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day);
}
// Search for the first instant of a civil date, including short/long DST days
// and midnight offset changes; never assume every local day has 24 hours.
function civilBoundary(civilStamp: number, timeZone: string) {
  let low = civilStamp - 16 * 3_600_000;
  let high = civilStamp + 16 * 3_600_000;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (civilKey(new Date(mid), timeZone) < civilStamp) low = mid;
    else high = mid;
  }
  return new Date(high);
}
function validateCoordinates(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
    throw new RangeError('Latitude deve estar entre −90 e 90; longitude entre −180 e 180.');
  }
}
export function timezoneForCoordinates(latitude: number, longitude: number): string {
  validateCoordinates(latitude, longitude);
  return tzLookup(latitude, longitude);
}
export function validateLocation(location: Location): void {
  validateCoordinates(location.latitude, location.longitude);
  if (!location.timeZone) throw new RangeError('Informe um fuso horário válido.');
  zoneFormatter(location.timeZone);
}
function validateDate(date: Date) {
  if (!Number.isFinite(+date)) throw new RangeError('Data inválida.');
}
function timeCandidates(date: Date, location: Location) {
  return getTimes(date, location.latitude, location.longitude, 0, offsetMinutes(date, location.timeZone));
}
function eventsFrom(times: ReturnType<typeof getTimes>): SolarEvent[] {
  return (['sunrise', 'sunset'] as const).flatMap(kind => {
    const time = times[kind];
    return time && Number.isFinite(+time) ? [{ kind, time }] : [];
  });
}
interface SolarDay {
  start: Date; end: Date; events: SolarEvent[]; solarNoon: Date | null;
  initialDaylight: boolean; dayLengthSeconds: number; followingEvent: SolarEvent | null;
}
const days = new Map<string, SolarDay>();
function solarDay(date: Date, location: Location): SolarDay {
  const civilStamp = civilKey(date, location.timeZone);
  const cacheKey = `${location.latitude}/${location.longitude}/${location.timeZone}/${civilStamp}`;
  const existing = days.get(cacheKey);
  if (existing) return existing;
  const start = civilBoundary(civilStamp, location.timeZone);
  const end = civilBoundary(civilStamp + DAY, location.timeZone);
  const midpoint = new Date((+start + +end) / 2);
  const times = timeCandidates(midpoint, location);
  // Adjacent dates catch a rise/set which straddles an offset change.
  const nearbyTimes = [timeCandidates(new Date(+midpoint - DAY), location), times, timeCandidates(new Date(+midpoint + DAY), location)];
  const events = nearbyTimes.flatMap(eventsFrom)
    .filter(event => +event.time >= +start && +event.time < +end)
    .sort((a, b) => +a.time - +b.time)
    .filter((event, index, all) => index === 0 || event.kind !== all[index - 1].kind || Math.abs(+event.time - +all[index - 1].time) > 1000);
  const initialDaylight = events.length ? events[0].kind === 'sunset' : Boolean(times.alwaysUp || getPosition(midpoint, location.latitude, location.longitude).altitude > 0);
  let lit = initialDaylight;
  let cursor = +start;
  let duration = 0;
  for (const event of events) {
    if (lit) duration += +event.time - cursor;
    lit = event.kind === 'sunrise';
    cursor = +event.time;
  }
  if (lit) duration += +end - cursor;
  let followingEvent: SolarEvent | null = null;
  // Polar locations may wait months for the next horizon crossing. Bounded and cached.
  for (let day = 1; day <= 370 && !followingEvent; day++) {
    const candidate = new Date(+midpoint + day * DAY);
    followingEvent = eventsFrom(timeCandidates(candidate, location))
      .filter(event => +event.time >= +end).sort((a, b) => +a.time - +b.time)[0] ?? null;
  }
  const result: SolarDay = {
    start, end, events, solarNoon: times.solarNoon ?? null,
    initialDaylight, dayLengthSeconds: duration / 1000, followingEvent,
  };
  if (days.size >= 32) days.delete(days.keys().next().value!);
  days.set(cacheKey, result);
  return result;
}
export function buildSolarSnapshot(date: Date, location: Location = DEFAULT_LOCATION): SolarSnapshot {
  validateDate(date);
  validateLocation(location);
  const day = solarDay(date, location);
  const position = getPosition(date, location.latitude, location.longitude);
  const sunrise = day.events.find(event => event.kind === 'sunrise')?.time ?? null;
  const sunset = day.events.find(event => event.kind === 'sunset')?.time ?? null;
  const latest = day.events.filter(event => +event.time <= +date).at(-1);
  const isDay = latest ? latest.kind === 'sunrise' : day.initialDaylight;
  const status = day.events.length === 0
    ? isDay ? 'polar-day' : 'polar-night'
    : isDay ? 'day' : position.altitude >= -6 ? 'twilight' : 'night';
  return {
    now: date, location, ...position, sunrise, sunset, solarNoon: day.solarNoon,
    dayLengthSeconds: day.dayLengthSeconds,
    nextEvent: day.events.find(event => +event.time > +date) ?? day.followingEvent,
    status,
    daylightProgress: sunrise && sunset && +sunset > +sunrise
      ? Math.max(0, Math.min(1, (+date - +sunrise) / (+sunset - +sunrise))) : null,
    dayStart: day.start, dayEnd: day.end,
  };
}
export function formatTime(date: Date | null, timeZone: string, seconds = false): string {
  if (!date || !Number.isFinite(+date)) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone, hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' as const } : {}), hourCycle: 'h23',
  }).format(date);
}
export function compassDirection(azimuth: number): string {
  if (!Number.isFinite(azimuth)) return '—';
  const normalized = ((azimuth % 360) + 360) % 360;
  return ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'][Math.round(normalized / 45) % 8];
}
export function buildDayPath(date: Date, location: Location = DEFAULT_LOCATION): SolarPathPoint[] {
  validateDate(date);
  validateLocation(location);
  const { start, end } = solarDay(date, location);
  return Array.from({ length: 97 }, (_, index) => {
    const time = new Date(+start + (+end - +start) * index / 96);
    return { time, ...getPosition(time, location.latitude, location.longitude) };
  });
}

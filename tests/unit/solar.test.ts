import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCATION, buildDayPath, buildSolarSnapshot, compassDirection,
  formatTime, timezoneForCoordinates, validateLocation, type Location,
} from '../../examples/lab/src/solar/solar';

const tromso: Location = { name: 'Tromsø', latitude: 69.6492, longitude: 18.9553, timeZone: 'Europe/Oslo' };
const newYork: Location = { name: 'Nova York', latitude: 40.7128, longitude: -74.006, timeZone: 'America/New_York' };

function nearMinute(actual: Date | null, expected: string) {
  expect(actual).not.toBeNull();
  expect(Math.abs(+actual! - +new Date(expected))).toBeLessThan(60_000);
}

describe('observação solar', () => {
  it('corresponde a horários de referência independentes USNO para Fortaleza', () => {
    // USNO API 4.0.1, reference retrieved 2026-11-10; rounded to minutes.
    // https://aa.usno.navy.mil/api/rstt/oneday?date=2026-11-10&coords=-3.7319,-38.5267&tz=-3
    const solar = buildSolarSnapshot(new Date('2026-11-10T15:00:00Z'));
    nearMinute(solar.sunrise, '2026-11-10T08:10:00Z');
    nearMinute(solar.solarNoon, '2026-11-10T14:18:00Z');
    nearMinute(solar.sunset, '2026-11-10T20:26:00Z');
    expect(solar.status).toBe('day');
    expect(solar.altitude).toBeGreaterThan(60);
    expect(solar.altitude).toBeLessThan(90);
    expect(solar.dayLengthSeconds).toBeGreaterThan(12 * 3600);
    expect(solar.dayLengthSeconds).toBeLessThan(12.5 * 3600);
    expect(solar.nextEvent?.kind).toBe('sunset');
  });

  it('usa o dia da localização mesmo quando UTC já mudou de data', () => {
    const late = buildSolarSnapshot(new Date('2026-11-11T02:50:00Z'));
    expect(late.dayStart.toISOString()).toBe('2026-11-10T03:00:00.000Z');
    nearMinute(late.sunrise, '2026-11-10T08:10:00Z');
    expect(late.status).toBe('night');
    expect(late.nextEvent?.kind).toBe('sunrise');
    expect(+late.nextEvent!.time).toBeGreaterThan(+late.now);
    expect(late.nextEvent!.time.toISOString().slice(0, 10)).toBe('2026-11-11');
    const tomorrow = buildSolarSnapshot(new Date('2026-11-11T03:00:00Z'));
    expect(tomorrow.dayStart.toISOString()).toBe('2026-11-11T03:00:00.000Z');
    expect(tomorrow.sunrise).not.toEqual(late.sunrise);
  });

  it('atualiza posição e próximo evento ao atravessar o nascer do sol', () => {
    const sample = buildSolarSnapshot(new Date('2026-11-10T06:00:00Z'));
    const before = buildSolarSnapshot(new Date(+sample.sunrise! - 1000));
    const after = buildSolarSnapshot(new Date(+sample.sunrise! + 1000));
    expect(before.nextEvent?.kind).toBe('sunrise');
    expect(after.nextEvent?.kind).toBe('sunset');
    expect(after.status).toBe('day');
    expect(after.altitude).toBeGreaterThan(before.altitude);
    expect(after.azimuth).toBeGreaterThan(90);
    expect(after.azimuth).toBeLessThan(120);
  });

  it('representa dia/noite polar sem horários inválidos e busca o próximo evento', () => {
    const summer = buildSolarSnapshot(new Date('2026-06-21T10:00:00Z'), tromso);
    expect(summer.status).toBe('polar-day');
    expect(summer.sunrise).toBeNull();
    expect(summer.sunset).toBeNull();
    expect(summer.dayLengthSeconds).toBe(86_400);
    expect(summer.nextEvent?.kind).toBe('sunset');
    expect(+summer.nextEvent!.time).toBeGreaterThan(+summer.dayEnd);
    const winter = buildSolarSnapshot(new Date('2026-12-21T10:00:00Z'), tromso);
    expect(winter.status).toBe('polar-night');
    expect(winter.sunrise).toBeNull();
    expect(winter.sunset).toBeNull();
    expect(winter.dayLengthSeconds).toBe(0);
    expect(winter.nextEvent?.kind).toBe('sunrise');
    expect(formatTime(winter.sunrise, tromso.timeZone)).toBe('—');
  });

  it('respeita os dias civis de 23h e 25h das transições de fuso', () => {
    const spring = buildSolarSnapshot(new Date('2026-03-08T16:00:00Z'), newYork);
    expect(+spring.dayEnd - +spring.dayStart).toBe(23 * 3600_000);
    const autumn = buildSolarSnapshot(new Date('2026-11-01T16:00:00Z'), newYork);
    expect(+autumn.dayEnd - +autumn.dayStart).toBe(25 * 3600_000);
    expect(spring.sunrise! > spring.dayStart && spring.sunset! < spring.dayEnd).toBe(true);
    expect(autumn.sunrise! > autumn.dayStart && autumn.sunset! < autumn.dayEnd).toBe(true);
  });

  it('gera trajetória real incluindo noite e extremos temporais do dia local', () => {
    const date = new Date('2026-11-10T15:00:00Z');
    const path = buildDayPath(date);
    const solar = buildSolarSnapshot(date);
    expect(path).toHaveLength(97);
    expect(path[0].time).toEqual(solar.dayStart);
    expect(path.at(-1)!.time).toEqual(solar.dayEnd);
    expect(path.some(p => p.altitude < 0)).toBe(true);
    expect(path.some(p => p.altitude > 60)).toBe(true);
    expect(path.every(p => Number.isFinite(p.altitude) && p.azimuth >= 0 && p.azimuth < 360)).toBe(true);
  });

  it('obtém fuso das coordenadas em vez do fuso da máquina', () => {
    expect(timezoneForCoordinates(-3.7319, -38.5267)).toBe('America/Fortaleza');
    expect(timezoneForCoordinates(40.7128, -74.006)).toBe('America/New_York');
    expect(timezoneForCoordinates(35.6762, 139.6503)).toBe('Asia/Tokyo');
    const instant = new Date('2026-11-10T15:00:00Z');
    expect(formatTime(instant, 'America/Fortaleza')).toBe('12:00');
    expect(formatTime(instant, 'America/New_York')).toBe('10:00');
    expect(formatTime(instant, 'Asia/Tokyo', true)).toBe('00:00:00');
  });

  it('rejeita coordenadas, data e fuso inválidos', () => {
    expect(() => buildSolarSnapshot(new Date('invalid'))).toThrow(RangeError);
    expect(() => validateLocation({ ...DEFAULT_LOCATION, latitude: NaN })).toThrow(RangeError);
    expect(() => validateLocation({ ...DEFAULT_LOCATION, longitude: 181 })).toThrow(RangeError);
    expect(() => validateLocation({ ...DEFAULT_LOCATION, timeZone: 'Mars/Olympus' })).toThrow(RangeError);
    expect(() => timezoneForCoordinates(91, 0)).toThrow(RangeError);
  });

  it('usa azimute horário a partir do norte com pontos cardeais portugueses', () => {
    expect([0, 90, 180, 270, 360, -90].map(compassDirection)).toEqual(['N', 'L', 'S', 'O', 'N', 'O']);
  });
});

import { describe, expect, it } from 'vitest';
import {
  beaufortFromKmh,
  cardinalDirection,
  computeLunarEphemeris,
  convertWindSpeed,
  dewPointCelsius,
  generateTideSeries,
  normalizeSurfaceMaterial,
  surfaceMaterialAttr,
  toFahrenheit,
  uvCategory,
} from '../../assets/ui/weather-ephemeris';

describe('weather and ephemeris helpers', () => {
  it('normalizes surface materials cleanly', () => {
    expect(normalizeSurfaceMaterial('solid')).toBe('solid');
    expect(normalizeSurfaceMaterial('liquid-glass')).toBe('glass');
    expect(normalizeSurfaceMaterial('liquid')).toBe('liquid');
    expect(surfaceMaterialAttr('glass')).toBe('liquid-glass');
    expect(surfaceMaterialAttr('liquid')).toBe('liquid');
  });

  it('maps compass degrees to 16-point cardinal directions', () => {
    expect(cardinalDirection(0)).toBe('N');
    expect(cardinalDirection(90)).toBe('E');
    expect(cardinalDirection(135)).toBe('SE');
    expect(cardinalDirection(360)).toBe('N');
    expect(cardinalDirection(-90)).toBe('W');
  });

  it('computes Beaufort wind scale categories and unit conversions', () => {
    expect(beaufortFromKmh(0.4)).toEqual({ force: 0, label: 'Calm' });
    expect(beaufortFromKmh(22.4)).toEqual({ force: 4, label: 'Moderate breeze' });
    expect(beaufortFromKmh(125)).toEqual({ force: 12, label: 'Hurricane force' });

    expect(convertWindSpeed(36, 'km/h')).toBe(36);
    expect(convertWindSpeed(36, 'm/s')).toBeCloseTo(10, 5);
    expect(convertWindSpeed(10, 'kt')).toBeCloseTo(5.39957, 4);
  });

  it('calculates Fahrenheit, dew point, and UV categories', () => {
    expect(toFahrenheit(0)).toBe(32);
    expect(toFahrenheit(25)).toBe(77);
    expect(dewPointCelsius(20, 100)).toBeCloseTo(20, 1);
    expect(dewPointCelsius(28, 65)).toBeLessThan(28);
    expect(uvCategory(1)).toBe('Low');
    expect(uvCategory(4)).toBe('Moderate');
    expect(uvCategory(7)).toBe('High');
    expect(uvCategory(9)).toBe('Very high');
    expect(uvCategory(12)).toBe('Extreme');
  });

  it('computes bounded lunar ephemeris outputs for known new moon and later phases', () => {
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const newMoon = computeLunarEphemeris(knownNewMoon);
    expect(newMoon.phaseName).toBe('New moon');
    expect(newMoon.illumination).toBeCloseTo(0, 1);
    expect(newMoon.ageDays).toBeCloseTo(0, 1);

    const midCycle = new Date(knownNewMoon.getTime() + 14.765 * 86400000);
    const fullMoon = computeLunarEphemeris(midCycle);
    expect(fullMoon.phaseName).toBe('Full moon');
    expect(fullMoon.illumination).toBeGreaterThan(98);
    expect(fullMoon.moonrise).toMatch(/^\d{2}:\d{2}$/);
    expect(fullMoon.moonset).toMatch(/^\d{2}:\d{2}$/);
    expect(fullMoon.distanceKm).toBeGreaterThan(350000);
    expect(fullMoon.distanceKm).toBeLessThan(410000);
  });

  it('generates 49 half-hour tidal samples and bounded phase angles', () => {
    const sampleDate = new Date(2026, 10, 12, 9, 15, 0);
    const tide = generateTideSeries(sampleDate, 2.4, 1.45);
    expect(tide.samples).toHaveLength(49);
    expect(tide.samples[0].hour).toBe(0);
    expect(tide.samples[48].hour).toBe(24);
    expect(tide.phaseDegrees).toBeGreaterThanOrEqual(0);
    expect(tide.phaseDegrees).toBeLessThan(360);
    expect(['rising', 'falling', 'high-slack', 'low-slack']).toContain(tide.trend);
  });
});

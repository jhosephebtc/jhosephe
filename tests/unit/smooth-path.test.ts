import { describe, expect, it } from 'vitest';
import { smoothPath } from '../../assets/ui/smooth-shape';

describe('smoothPath', () => {
  it('não desenha caixas inválidas ou vazias', () => {
    expect(smoothPath({ width: 0, height: 30, radius: 4 })).toBe('');
    expect(smoothPath({ width: Number.NaN, height: 30, radius: 4 })).toBe('');
    expect(smoothPath({ width: 30, height: Infinity, radius: 4 })).toBe('');
  });
  it('limita o raio à metade da menor dimensão', () => {
    const shape = { width: 60, height: 24, smoothing: 0.6 };
    expect(smoothPath({ ...shape, radius: 99 })).toBe(smoothPath({ ...shape, radius: 12 }));
    expect(smoothPath({ ...shape, radius: -5 })).toBe(smoothPath({ ...shape, radius: 0 }));
  });
  it('limita a suavização e não produz coordenadas inválidas', () => {
    const shape = { width: 130, height: 40, radius: 14 };
    expect(smoothPath({ ...shape, smoothing: 5 })).toBe(smoothPath({ ...shape, smoothing: 1 }));
    expect(smoothPath({ ...shape, smoothing: -1 })).toBe(smoothPath({ ...shape, smoothing: 0 }));
    expect(smoothPath({ ...shape, smoothing: Number.NaN })).not.toMatch(/NaN|Infinity/);
  });
  it('gera curvas distintas para suavização diferente', () => {
    const shape = { width: 120, height: 80, radius: 20 };
    expect(smoothPath({ ...shape, smoothing: 0.6 })).not.toBe(smoothPath({ ...shape, smoothing: 0 }));
  });
});

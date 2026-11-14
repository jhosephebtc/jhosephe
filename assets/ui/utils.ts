import type { CSSProperties } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}

export function instrumentAccentStyle(accentColor?: string, style?: CSSProperties): CSSProperties | undefined {
  const custom = accentColor && accentColor !== 'oklch(100% 0 0)' ? accentColor : undefined;
  if (!custom && !style) return undefined;
  return {
    ...style,
    ...(custom ? { '--jh-instrument-accent': custom } as CSSProperties : null),
  };
}

export function clockwiseArcPath(cx: number, cy: number, r: number, degrees: number): string {
  const clamped = Math.min(359.5, Math.max(0, degrees));
  const rad = ((clamped - 90) * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  const large = clamped > 180 ? 1 : 0;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

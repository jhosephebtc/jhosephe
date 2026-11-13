import { getSvgPath } from 'figma-squircle';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

export interface SmoothGeometry {
  width: number;
  height: number;
  radius: number;
  smoothing?: number;
}

export function smoothPath({ width, height, radius, smoothing = 0.6 }: SmoothGeometry): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return '';
  const safeRadius = Number.isFinite(radius) ? Math.min(Math.max(0, radius), width / 2, height / 2) : 0;
  const safeSmoothing = Number.isFinite(smoothing) ? Math.max(0, Math.min(1, smoothing)) : 0.6;
  return getSvgPath({ width, height, cornerRadius: safeRadius, cornerSmoothing: safeSmoothing });
}

/** Decoration only. Keep focus, hit area, and shadows on the parent. */
export function SmoothShape({ radius = 18, smoothing = 0.6, className = '', style: styleProp }: {
  radius?: number;
  smoothing?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      setSize(old => old.width === width && old.height === height ? old : { width, height });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const path = useMemo(() => smoothPath({ ...size, radius, smoothing }), [size, radius, smoothing]);
  const fallbackRadius = Number.isFinite(radius) ? Math.max(0, radius) : 0;
  const style: CSSProperties = { ...styleProp, borderRadius: fallbackRadius, ...(path ? { clipPath: `path("${path}")` } : {}) };
  return <span ref={ref} className={className} style={style} aria-hidden="true" />;
}

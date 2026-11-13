import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export type CameraWheelMode = 'aperture' | 'ev' | 'iso' | 'shutter';

export interface CameraWheelProps {
  label?: string;
  mode?: CameraWheelMode;
  value?: string;
  defaultValue?: string;
  stops?: string[];
  orientation?: 'horizontal' | 'vertical';
  onValueChange?: (value: string, index: number) => void;
  accentColor?: string;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}

const MODE_PRESETS: Record<CameraWheelMode, { title: string; subtitle: string; unit: string; stops: string[]; defaultIndex: number }> = {
  aperture: {
    title: 'Aperture',
    subtitle: '45mm f/2.8 DG',
    unit: 'f/',
    stops: ['A', '22', '16', '11', '8', '5.6', '4', '2.8', '2', '1.4'],
    defaultIndex: 4,
  },
  ev: {
    title: 'Density · EV',
    subtitle: 'Third-stop scale',
    unit: 'EV',
    stops: ['-2⅔', '-2⅓', '-2', '-1⅔', '-1⅓', '-1', '-⅔', '-⅓', '0', '+⅓', '+⅔', '+1', '+1⅓', '+1⅔', '+2', '+2⅓', '+2⅔'],
    defaultIndex: 8,
  },
  iso: {
    title: 'ISO sensitivity',
    subtitle: 'Film index',
    unit: 'ISO',
    stops: ['Auto', '50', '100', '160', '200', '400', '800', '1600', '3200', '6400', '12800'],
    defaultIndex: 5,
  },
  shutter: {
    title: 'Shutter',
    subtitle: 'Leaf · Focal',
    unit: 'Sec',
    stops: ['A', 'B', '4s', '1s', '1/4', '1/15', '1/60', '1/125', '1/250', '1/500', '1/1000', '1/4000'],
    defaultIndex: 7,
  },
};

function formatStopToken(stop: string, mode: CameraWheelMode): { text: string; isFraction: boolean } {
  if (mode === 'ev') {
    if (stop.endsWith('⅔')) return { text: '⅔', isFraction: true };
    if (stop.endsWith('⅓')) return { text: '⅓', isFraction: true };
    if (stop.startsWith('+')) return { text: stop.slice(1), isFraction: false };
    return { text: stop, isFraction: false };
  }
  if (mode === 'aperture' && stop.includes('.')) {
    return { text: stop, isFraction: false };
  }
  return { text: stop, isFraction: false };
}

const STOP_PITCH = 42;

export function CameraWheel({
  label,
  mode = 'aperture',
  value,
  defaultValue,
  stops,
  orientation = 'horizontal',
  onValueChange,
  accentColor,
  material,
  className,
  style,
}: CameraWheelProps) {
  const preset = MODE_PRESETS[mode];
  const items = stops?.length ? stops : preset.stops;
  const heading = label ?? preset.title;
  const headingId = useId();

  const initialIdx = (() => {
    const candidate = value ?? defaultValue;
    if (candidate) {
      const found = items.indexOf(candidate);
      if (found >= 0) return found;
    }
    return Math.min(preset.defaultIndex, items.length - 1);
  })();

  const [internalIndex, setInternalIndex] = useState(initialIdx);
  const [dragging, setDragging] = useState(false);
  const wheelTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{ startAxis: number; startIndex: number; accum: number } | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      const found = items.indexOf(value);
      if (found >= 0) setInternalIndex(found);
    }
  }, [value, items]);

  useEffect(() => {
    if (value === undefined && defaultValue === undefined) {
      setInternalIndex(Math.min(preset.defaultIndex, items.length - 1));
    }
  }, [mode, preset.defaultIndex, items.length, value, defaultValue]);

  const controlledIndex = value !== undefined ? items.indexOf(value) : -1;
  const activeIndex = controlledIndex >= 0 ? controlledIndex : Math.max(0, Math.min(items.length - 1, internalIndex));
  const activeLabel = items[activeIndex] ?? items[0];

  const commitIndex = useCallback(
    (nextRaw: number) => {
      const next = Math.max(0, Math.min(items.length - 1, nextRaw));
      if (controlledIndex < 0) setInternalIndex(next);
      onValueChange?.(items[next], next);
    },
    [controlledIndex, items, onValueChange],
  );

  const pulseScrollActive = useCallback(() => {
    setDragging(true);
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => {
      if (!dragRef.current) setDragging(false);
    }, 260);
  }, []);

  useEffect(() => {
    return () => {
      if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current);
    };
  }, []);

  const vertical = orientation === 'vertical';
  const knurlOffset = activeIndex * -11;
  const mergedStyle = {
    ...style,
    ...(accentColor ? { ['--jh-camera-accent' as string]: accentColor } : {}),
    ['--jh-knurl-offset' as string]: `${knurlOffset}px`,
  } as CSSProperties;

  return (
    <section
      className={cn('jh-camera-wheel', vertical && 'jh-camera-wheel--vertical', className)}
      data-orientation={orientation}
      data-mode={mode}
      data-dragging={dragging ? 'true' : undefined}
      data-jh-material={material ? surfaceMaterialAttr(material) : undefined}
      style={mergedStyle}
      aria-labelledby={headingId}
    >
      <div className="jh-camera-wheel__meta">
        <div className="jh-camera-wheel__meta-left">
          <span id={headingId} className="jh-camera-wheel__title">{heading}</span>
          <span className="jh-camera-wheel__subtitle">{preset.subtitle}</span>
        </div>
        <span className="jh-camera-wheel__readout">
          <small>{preset.unit}</small>
          <strong>{activeLabel}</strong>
        </span>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={headingId}
        aria-orientation={orientation}
        aria-valuemin={0}
        aria-valuemax={items.length - 1}
        aria-valuenow={activeIndex}
        aria-valuetext={`${preset.unit} ${activeLabel}`}
        className="jh-camera-wheel__body"
        onPointerDown={event => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            startAxis: vertical ? event.clientY : event.clientX,
            startIndex: activeIndex,
            accum: 0,
          };
          setDragging(true);
        }}
        onPointerMove={event => {
          const drag = dragRef.current;
          if (!drag) return;
          const axisNow = vertical ? event.clientY : event.clientX;
          const delta = drag.startAxis - axisNow;
          const stepDelta = Math.round(delta / 26);
          commitIndex(drag.startIndex + (vertical ? -stepDelta : stepDelta));
        }}
        onPointerUp={event => {
          if (dragRef.current) {
            dragRef.current = null;
            setDragging(false);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }
        }}
        onPointerCancel={() => {
          dragRef.current = null;
          setDragging(false);
        }}
        onWheel={event => {
          event.preventDefault();
          const dir = (vertical ? event.deltaY : event.deltaY || event.deltaX) > 0 ? 1 : -1;
          commitIndex(activeIndex + dir);
          pulseScrollActive();
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            commitIndex(activeIndex + 1);
            pulseScrollActive();
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            commitIndex(activeIndex - 1);
            pulseScrollActive();
          } else if (event.key === 'Home') {
            event.preventDefault();
            commitIndex(0);
            pulseScrollActive();
          } else if (event.key === 'End') {
            event.preventDefault();
            commitIndex(items.length - 1);
            pulseScrollActive();
          }
        }}
      >
        <div className="jh-camera-wheel__window" aria-hidden="true">
          <div className="jh-camera-wheel__needle" />
          <div
            className="jh-camera-wheel__strip"
            style={{
              transform: vertical
                ? `translateY(${-(activeIndex * STOP_PITCH)}px)`
                : `translateX(${-(activeIndex * STOP_PITCH)}px)`,
            }}
          >
            {items.map((item, idx) => {
              const dist = Math.abs(idx - activeIndex);
              const token = formatStopToken(item, mode);
              const isZero = mode === 'ev' && item === '0';
              return (
                <div
                  key={`${item}-${idx}`}
                  className={cn(
                    'jh-camera-wheel__stop',
                    idx === activeIndex && 'is-active',
                    token.isFraction ? 'is-fraction' : 'is-integer',
                    isZero && 'is-zero',
                    item === 'A' && 'is-auto',
                  )}
                  data-near={dist <= 1 ? 'true' : undefined}
                >
                  <span className="jh-camera-wheel__tick" />
                  <span className="jh-camera-wheel__val">{token.text}</span>
                </div>
              );
            })}
          </div>
          <div className="jh-camera-wheel__window-glass" />
        </div>

        <div className="jh-camera-wheel__knurl" aria-hidden="true">
          <span className="jh-camera-wheel__knurl-seam" />
        </div>
      </div>

      <div className="jh-camera-wheel__detents" aria-hidden="true">
        {items.map((item, idx) => (
          <button
            key={`jump-${item}-${idx}`}
            type="button"
            tabIndex={-1}
            className={cn('jh-camera-wheel__pip', idx === activeIndex && 'is-active')}
            onClick={() => {
              commitIndex(idx);
              pulseScrollActive();
            }}
            title={item}
          />
        ))}
      </div>
    </section>
  );
}

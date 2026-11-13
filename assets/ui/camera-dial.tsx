import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export type CameraDialVariant = 'exposure' | 'film';

export interface CameraDialProps {
  label?: string;
  variant?: CameraDialVariant;
  isoStops?: string[];
  shutterStops?: string[];
  filmStops?: string[];
  onChange?: (state: { mainStop: string; iso: string; ev: number }) => void;
  accentColor?: string;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_SHUTTER = ['A', '500', '250', '125', '60', '30', '15', '8', '4', '2', '1', '2s', '4s', 'B'];
const DEFAULT_ISO = ['50', '100', '200', '400', '800', '1600', '3200'];
const DEFAULT_FILM = ['Auto', 'STD', 'VLV', 'AST', 'CC', 'NC', 'Acros', 'FS1', 'FS2', 'FS3'];
const EV_STEPS = [-2, -1, 0, 1, 2] as const;

export function CameraDial({
  label,
  variant = 'exposure',
  isoStops = DEFAULT_ISO,
  shutterStops = DEFAULT_SHUTTER,
  filmStops = DEFAULT_FILM,
  onChange,
  accentColor,
  material,
  className,
  style,
}: CameraDialProps) {
  const titleId = useId();
  const mainStops = variant === 'film' ? filmStops : shutterStops;
  const [mainIndex, setMainIndex] = useState(variant === 'film' ? 1 : 3);
  const [isoIndex, setIsoIndex] = useState(3);
  const [evIndex, setEvIndex] = useState(2);
  const [draggingMain, setDraggingMain] = useState(false);
  const [scrollingIso, setScrollingIso] = useState(false);

  const dialRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startAngle: number; startIndex: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const isoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMainIndex(variant === 'film' ? 1 : 3);
  }, [variant]);

  const emitChange = useCallback(
    (m: number, iso: number, evIdx: number) => {
      onChange?.({
        mainStop: mainStops[m] ?? mainStops[0],
        iso: isoStops[iso] ?? isoStops[0],
        ev: EV_STEPS[evIdx] ?? 0,
      });
    },
    [isoStops, mainStops, onChange],
  );

  const updateMain = useCallback(
    (nextRaw: number) => {
      const len = mainStops.length;
      const wrapped = ((nextRaw % len) + len) % len;
      setMainIndex(wrapped);
      emitChange(wrapped, isoIndex, evIndex);
    },
    [emitChange, evIndex, isoIndex, mainStops.length],
  );

  const stepIso = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(isoStops.length - 1, isoIndex + delta));
      setIsoIndex(next);
      setScrollingIso(true);
      if (isoTimerRef.current !== null) window.clearTimeout(isoTimerRef.current);
      isoTimerRef.current = window.setTimeout(() => setScrollingIso(false), 320);
      emitChange(mainIndex, next, evIndex);
    },
    [emitChange, evIndex, isoIndex, isoStops.length, mainIndex],
  );

  const pulseMain = useCallback(() => {
    setDraggingMain(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (!dragRef.current) setDraggingMain(false);
    }, 260);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      if (isoTimerRef.current !== null) window.clearTimeout(isoTimerRef.current);
    };
  }, []);

  const angleFromPointer = (clientX: number, clientY: number) => {
    const el = dialRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return (Math.atan2(clientY - (r.top + r.height / 2), clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const stepDeg = 360 / mainStops.length;
  const turretRotation = -(mainIndex * stepDeg);
  const currentMain = mainStops[mainIndex] ?? mainStops[0];
  const currentIso = isoStops[isoIndex] ?? isoStops[0];
  const currentEv = EV_STEPS[evIndex] ?? 0;

  const mergedStyle = accentColor
    ? { ...style, ['--jh-camera-accent' as string]: accentColor }
    : style;

  return (
    <section
      className={cn('jh-camera-dial', className)}
      data-variant={variant}
      data-dragging={draggingMain || scrollingIso ? 'true' : undefined}
      data-jh-material={material ? surfaceMaterialAttr(material) : undefined}
      style={mergedStyle}
      aria-labelledby={titleId}
    >
      <div className="jh-camera-dial__plate">
        <div className="jh-camera-dial__head">
          <div className="jh-camera-dial__title-block">
            <span id={titleId} className="jh-camera-dial__label">
              {label ?? (variant === 'film' ? 'Film · Mode turret' : 'Shutter · ISO · EV')}
            </span>
            <span className="jh-camera-dial__sublabel">
              {variant === 'film' ? 'Simulation dial' : 'Rangefinder top plate'}
            </span>
          </div>
          <div className="jh-camera-dial__status" aria-live="polite">
            {variant === 'exposure' ? (
              <>
                <span>{currentMain === 'A' ? 'Auto' : `1/${currentMain}`}</span>
                <span className="jh-camera-dial__sep">·</span>
                <span>ISO {currentIso}</span>
                <span className="jh-camera-dial__sep">·</span>
                <span>{currentEv > 0 ? `+${currentEv}` : currentEv} EV</span>
              </>
            ) : (
              <>
                <span>{currentMain}</span>
                <span className="jh-camera-dial__sep">·</span>
                <span>24×36</span>
              </>
            )}
          </div>
        </div>

        <div className="jh-camera-dial__assembly">
          <div className="jh-camera-dial__collar" aria-label="Exposure compensation stops">
            {variant === 'exposure' && (
              <div className="jh-camera-dial__ev-scale">
                {EV_STEPS.map((evVal, idx) => (
                  <button
                    key={evVal}
                    type="button"
                    className={cn('jh-camera-dial__ev-step', idx === evIndex && 'is-active')}
                    onClick={() => {
                      setEvIndex(idx);
                      emitChange(mainIndex, isoIndex, idx);
                    }}
                    aria-label={`Exposure compensation ${evVal > 0 ? `+${evVal}` : evVal}`}
                    aria-pressed={idx === evIndex}
                  >
                    {evVal > 0 ? `+${evVal}` : evVal}
                  </button>
                ))}
              </div>
            )}

            <svg className="jh-camera-dial__bezel-ticks" viewBox="0 0 220 220" aria-hidden="true">
              {Array.from({ length: 36 }, (_, tickIdx) => (
                <line
                  key={tickIdx}
                  x1="110"
                  y1={tickIdx % 3 === 0 ? '4' : '6'}
                  x2="110"
                  y2="10"
                  transform={`rotate(${tickIdx * 10} 110 110)`}
                  className={tickIdx % 3 === 0 ? 'is-major' : undefined}
                />
              ))}
            </svg>
            <div className="jh-camera-dial__datum-pip" aria-hidden="true" />

            <div
              ref={dialRef}
              role="slider"
              tabIndex={0}
              aria-labelledby={titleId}
              aria-valuemin={0}
              aria-valuemax={mainStops.length - 1}
              aria-valuenow={mainIndex}
              aria-valuetext={currentMain}
              className="jh-camera-dial__turret-wrap"
              onPointerDown={event => {
                if ((event.target as HTMLElement).closest('.jh-camera-dial__cutout')) return;
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.focus();
                event.currentTarget.setPointerCapture(event.pointerId);
                dragRef.current = {
                  startAngle: angleFromPointer(event.clientX, event.clientY),
                  startIndex: mainIndex,
                };
                setDraggingMain(true);
              }}
              onPointerMove={event => {
                const drag = dragRef.current;
                if (!drag) return;
                let delta = angleFromPointer(event.clientX, event.clientY) - drag.startAngle;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;
                const stepsMoved = Math.round(delta / stepDeg);
                updateMain(drag.startIndex - stepsMoved);
              }}
              onPointerUp={event => {
                if (dragRef.current) {
                  dragRef.current = null;
                  setDraggingMain(false);
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }
              }}
              onPointerCancel={() => {
                dragRef.current = null;
                setDraggingMain(false);
              }}
              onWheel={event => {
                if ((event.target as HTMLElement).closest('.jh-camera-dial__cutout')) return;
                event.preventDefault();
                updateMain(mainIndex + (event.deltaY > 0 ? 1 : -1));
                pulseMain();
              }}
              onKeyDown={event => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                  event.preventDefault();
                  updateMain(mainIndex + 1);
                  pulseMain();
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  updateMain(mainIndex - 1);
                  pulseMain();
                }
              }}
            >
              <div className="jh-camera-dial__knurled-rim" style={{ transform: `rotate(${turretRotation}deg)` }}>
                {mainStops.map((stop, idx) => {
                  const deg = idx * stepDeg;
                  const isActive = idx === mainIndex;
                  return (
                    <span
                      key={`${stop}-${idx}`}
                      className={cn('jh-camera-dial__stop-mark', isActive && 'is-active', stop === 'A' && 'is-auto')}
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <b>{stop}</b>
                    </span>
                  );
                })}
              </div>

              <div className="jh-camera-dial__hub">
                {variant === 'exposure' ? (
                  <button
                    type="button"
                    className="jh-camera-dial__cutout"
                    data-scrolling={scrollingIso ? 'true' : undefined}
                    aria-label={`ISO ${currentIso}. Click or scroll to change sensitivity`}
                    onClick={() => stepIso(isoIndex >= isoStops.length - 1 ? -isoIndex : 1)}
                    onWheel={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      stepIso(event.deltaY > 0 ? 1 : -1);
                    }}
                  >
                    <span className="jh-camera-dial__cutout-label">ISO</span>
                    <span className="jh-camera-dial__cutout-value">{currentIso}</span>
                  </button>
                ) : (
                  <div className="jh-camera-dial__film-core">
                    <span className="jh-camera-dial__film-tag">Film</span>
                    <strong className="jh-camera-dial__film-active">{currentMain}</strong>
                  </div>
                )}
                <span className="jh-camera-dial__spindle" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

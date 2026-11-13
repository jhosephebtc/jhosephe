import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface TactileConsoleProps {
  label?: string;
  defaultParams?: [number, number, number, number];
  defaultSteps?: boolean[];
  onParamsChange?: (params: [number, number, number, number]) => void;
  onStepsChange?: (steps: boolean[]) => void;
  accentColor?: string;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}

const PARAM_NAMES = ['CUT', 'RES', 'LEN', 'DRV'] as const;
const ENCODER_TONES = ['0', '1', '2', '3'] as const;

export function TactileConsole({
  label = 'Tactile console',
  defaultParams = [68, 42, 76, 34],
  defaultSteps = [true, false, true, false, false, true, true, false],
  onParamsChange,
  onStepsChange,
  accentColor,
  material,
  className,
  style,
}: TactileConsoleProps) {
  const [params, setParams] = useState<[number, number, number, number]>(defaultParams);
  const [steps, setSteps] = useState<boolean[]>(defaultSteps);
  const [playing, setPlaying] = useState(false);
  const [recArmed, setRecArmed] = useState(true);
  const [modeShift, setModeShift] = useState(false);
  const [playhead, setPlayhead] = useState<number>(0);
  const [activeEncoder, setActiveEncoder] = useState<number | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const dragRef = useRef<{ index: number; startY: number; startVal: number } | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPlayhead(prev => (prev + 1) % 8);
    }, 220);
    return () => window.clearInterval(id);
  }, [playing]);

  const updateParam = (index: number, nextRaw: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(nextRaw)));
    setParams(prev => {
      const copy: [number, number, number, number] = [...prev] as [number, number, number, number];
      copy[index] = clamped;
      onParamsChange?.(copy);
      return copy;
    });
  };

  useEffect(() => {
    if (activeEncoder === null) return;
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = (drag.startY - event.clientY) * 0.72;
      updateParam(drag.index, drag.startVal + delta);
    };
    const onEnd = () => {
      dragRef.current = null;
      setActiveEncoder(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, [activeEncoder]);

  const toggleStep = (index: number) => {
    setSteps(prev => {
      const next = prev.map((v, i) => (i === index ? !v : v));
      onStepsChange?.(next);
      return next;
    });
  };

  const mergedStyle = accentColor ? { ...style, ['--jh-tactile-led-color' as string]: accentColor } : style;

  return (
    <section
      className={cn('jh-tactile-console', className)}
      data-jh-material={material ? surfaceMaterialAttr(material) : undefined}
      style={mergedStyle}
      aria-label={label}
    >
      <div className="jh-tactile-console__top">
        <div className="jh-tactile-console__bay">
          <div className="jh-tactile-console__speaker" aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="jh-tactile-console__util-col">
            <button
              type="button"
              className="jh-tactile-pad"
              data-shape="circle"
              data-tone="surface"
              data-led="crimson"
              data-pressed={pressedKey === 'rec' ? 'true' : undefined}
              aria-label="Record arm"
              aria-pressed={recArmed}
              onPointerDown={() => setPressedKey('rec')}
              onPointerUp={() => setPressedKey(null)}
              onPointerLeave={() => setPressedKey(null)}
              onClick={() => setRecArmed(v => !v)}
            >
              <span className="jh-tactile-pad__cap">
                <span className="jh-tactile-pad__pin" aria-hidden="true" />
                <span className="jh-tactile-pad__glyph">●</span>
              </span>
            </button>
            <button
              type="button"
              className="jh-tactile-pad"
              data-shape="circle"
              data-tone="surface"
              data-led="corner"
              data-pressed={pressedKey === 'shift' ? 'true' : undefined}
              aria-label="Layer shift"
              aria-pressed={modeShift}
              onPointerDown={() => setPressedKey('shift')}
              onPointerUp={() => setPressedKey(null)}
              onPointerLeave={() => setPressedKey(null)}
              onClick={() => setModeShift(v => !v)}
            >
              <span className="jh-tactile-pad__cap">
                <span className="jh-tactile-pad__pin" aria-hidden="true" />
                <span className="jh-tactile-pad__glyph">SHF</span>
              </span>
            </button>
          </div>
        </div>

        <div className="jh-tactile-console__oled" aria-label="Console telemetry display">
          <div className="jh-tactile-console__oled-head">
            <span>{modeShift ? 'Alt · Mod' : 'Seq · 120'}</span>
            <span>
              {activeEncoder !== null
                ? `${PARAM_NAMES[activeEncoder]} ${String(params[activeEncoder]).padStart(2, '0')}`
                : playing
                  ? `Step 0${playhead + 1}`
                  : 'Ready'}
            </span>
          </div>
          <svg className="jh-tactile-console__oled-svg" viewBox="0 0 112 40" aria-hidden="true">
            <polyline
              className="jh-tactile-oled__curve"
              fill="none"
              points={Array.from({ length: 8 }, (_, col) => {
                const x = 10 + col * 13;
                const val = params[col % 4];
                const y = steps[col] ? 30 - Math.round((val / 100) * 18) : 32;
                return `${x},${y}`;
              }).join(' ')}
            />
            {Array.from({ length: 8 }, (_, col) => {
              const x = 6 + col * 13;
              const val = params[col % 4];
              const y = 30 - Math.round((val / 100) * 18);
              const active = steps[col];
              const hit = playing && playhead === col;
              return (
                <g key={col}>
                  <line className="jh-tactile-oled__rail" x1={x + 4} y1="6" x2={x + 4} y2="34" />
                  <rect
                    className={cn('jh-tactile-oled__bar', active && 'is-active', hit && 'is-hit')}
                    x={x}
                    y={active ? y : 31}
                    width="8"
                    height={active ? 4 : 2}
                    rx="1"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="jh-tactile-console__encoders" role="group" aria-label="Graduated encoders">
          {params.map((val, index) => {
            const angle = -132 + (val / 100) * 264;
            const isDragging = activeEncoder === index;
            const activeTickCount = Math.round((val / 100) * 8);
            return (
              <div key={PARAM_NAMES[index]} className="jh-tactile-encoder-slot">
                <button
                  type="button"
                  role="slider"
                  className="jh-tactile-encoder"
                  data-encoder-tone={ENCODER_TONES[index]}
                  data-dragging={isDragging ? 'true' : undefined}
                  aria-label={PARAM_NAMES[index]}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={val}
                  onPointerDown={event => {
                    event.preventDefault();
                    dragRef.current = { index, startY: event.clientY, startVal: val };
                    setActiveEncoder(index);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
                      event.preventDefault();
                      setActiveEncoder(index);
                      updateParam(index, val + 4);
                    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
                      event.preventDefault();
                      setActiveEncoder(index);
                      updateParam(index, val - 4);
                    }
                  }}
                  onKeyUp={() => setActiveEncoder(null)}
                  onBlur={() => setActiveEncoder(null)}
                  onWheel={event => {
                    event.preventDefault();
                    updateParam(index, val + (event.deltaY < 0 ? 4 : -4));
                  }}
                >
                  <svg className="jh-tactile-encoder__scale" viewBox="0 0 44 44" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, tickIdx) => {
                      const deg = -132 + (tickIdx / 8) * 264;
                      const lit = tickIdx <= activeTickCount;
                      return (
                        <line
                          key={tickIdx}
                          x1="22"
                          y1="2.2"
                          x2="22"
                          y2={lit ? '4.8' : '4.2'}
                          transform={`rotate(${deg} 22 22)`}
                          className={cn('jh-tactile-encoder__tick', lit && 'is-active')}
                        />
                      );
                    })}
                  </svg>
                  <span className="jh-tactile-encoder__ring" aria-hidden="true" />
                  <span className="jh-tactile-encoder__cap" style={{ transform: `rotate(${angle}deg)` }}>
                    <span className="jh-tactile-encoder__notch" />
                  </span>
                </button>
                <span className="jh-tactile-encoder-label">{PARAM_NAMES[index]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="jh-tactile-console__bottom" role="group" aria-label="Step transport strip">
        <button
          type="button"
          className="jh-tactile-pad"
          data-shape="square"
          data-tone="contrast"
          data-led="corner"
          data-pressed={pressedKey === 'play' ? 'true' : undefined}
          aria-label={playing ? 'Pause pattern' : 'Play pattern'}
          aria-pressed={playing}
          onPointerDown={() => setPressedKey('play')}
          onPointerUp={() => setPressedKey(null)}
          onPointerLeave={() => setPressedKey(null)}
          onClick={() => setPlaying(v => !v)}
        >
          <span className="jh-tactile-pad__cap">
            <span className="jh-tactile-pad__pin" aria-hidden="true" />
            <span className="jh-tactile-pad__glyph">{playing ? '❚❚' : '▶'}</span>
          </span>
        </button>

        {steps.map((armed, index) => {
          const isPressed = pressedKey === `step-${index}`;
          const isPlayhead = playing && playhead === index;
          return (
            <button
              key={index}
              type="button"
              className="jh-tactile-pad"
              data-shape="dish"
              data-tone={index >= 4 ? 'contrast' : 'surface'}
              data-led="center"
              data-pressed={isPressed ? 'true' : undefined}
              data-playhead={isPlayhead ? 'true' : undefined}
              aria-label={`Console step ${index + 1}`}
              aria-pressed={armed}
              onPointerDown={() => setPressedKey(`step-${index}`)}
              onPointerUp={() => setPressedKey(null)}
              onPointerLeave={() => setPressedKey(null)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') setPressedKey(`step-${index}`);
              }}
              onKeyUp={() => setPressedKey(null)}
              onClick={() => toggleStep(index)}
            >
              <span className="jh-tactile-pad__cap">
                <span className="jh-tactile-pad__pin" aria-hidden="true" />
                <span className="jh-tactile-pad__glyph">{index + 1}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

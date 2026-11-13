import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface FilmstripFrame {
  id?: string;
  src?: string;
  alt?: string;
  title: string;
  shutter?: string;
  aperture?: string;
  iso?: string;
  scene?: 'trees' | 'horizon' | 'monolith' | 'motion' | 'nocturne';
}

export interface FilmstripGalleryProps {
  label?: string;
  frames?: FilmstripFrame[];
  value?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  accentColor?: string;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_FRAMES: FilmstripFrame[] = [
  { id: 'f1', title: 'KTX · 400 Sakai birch', shutter: '1/250', aperture: 'f/4', iso: '400', scene: 'trees' },
  { id: 'f2', title: 'AC5 · Trackside blur', shutter: '1/15', aperture: 'f/11', iso: '400', scene: 'motion' },
  { id: 'f3', title: 'AX4 · Courtyard study', shutter: '1/500', aperture: 'f/5.6', iso: '100', scene: 'monolith' },
  { id: 'f4', title: 'PAN · Coastal squall', shutter: '1/125', aperture: 'f/8', iso: '400', scene: 'horizon' },
  { id: 'f5', title: 'LS · Exposed tail', shutter: '2s', aperture: 'f/2.8', iso: '1600', scene: 'nocturne' },
];

function SpecimenPlate({ frame }: { frame: FilmstripFrame }) {
  if (frame.src) {
    return <img src={frame.src} alt={frame.alt ?? frame.title} className="jh-filmstrip__img" draggable={false} />;
  }
  switch (frame.scene) {
    case 'motion':
      return (
        <svg viewBox="0 0 240 200" className="jh-filmstrip__img" aria-label={frame.title}>
          <defs>
            <linearGradient id="jh-fs-mot" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dedede" />
              <stop offset="48%" stopColor="#808080" />
              <stop offset="100%" stopColor="#1e1e1e" />
            </linearGradient>
          </defs>
          <rect width="240" height="200" fill="url(#jh-fs-mot)" />
          <g opacity="0.55">
            <rect x="-20" y="28" width="280" height="10" fill="#f2f2f2" />
            <rect x="-20" y="52" width="280" height="5" fill="#e0e0e0" />
            <rect x="-20" y="88" width="280" height="16" fill="#444444" />
            <rect x="-20" y="138" width="280" height="22" fill="#262626" />
          </g>
          <path d="M92 170 L102 22 L109 22 L118 170 Z" fill="#1b1b1b" opacity="0.88" />
          <ellipse cx="144" cy="148" rx="68" ry="28" fill="none" stroke="rgb(245 245 245 / 0.25)" strokeWidth="2" />
          <path d="M0 172 L240 156 L240 200 L0 200 Z" fill="#121212" />
        </svg>
      );
    case 'monolith':
      return (
        <svg viewBox="0 0 240 200" className="jh-filmstrip__img" aria-label={frame.title}>
          <rect width="240" height="200" fill="#d8d8d8" />
          <rect x="0" y="0" width="136" height="200" fill="#484848" />
          <rect x="136" y="42" width="104" height="158" fill="#c2c2c2" />
          <polygon points="136,42 240,14 240,42" fill="#e6e6e6" />
          <rect x="34" y="64" width="66" height="136" fill="#242424" />
          <rect x="44" y="76" width="46" height="62" fill="#686868" />
          <line x1="0" y1="158" x2="240" y2="158" stroke="#181818" strokeWidth="1.5" opacity="0.4" />
        </svg>
      );
    case 'horizon':
      return (
        <svg viewBox="0 0 240 200" className="jh-filmstrip__img" aria-label={frame.title}>
          <defs>
            <linearGradient id="jh-fs-hor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4d4d4" />
              <stop offset="56%" stopColor="#929292" />
              <stop offset="57%" stopColor="#383838" />
              <stop offset="100%" stopColor="#161616" />
            </linearGradient>
          </defs>
          <rect width="240" height="200" fill="url(#jh-fs-hor)" />
          <circle cx="174" cy="64" r="18" fill="#f4f4f4" opacity="0.72" />
          <line x1="0" y1="114" x2="240" y2="114" stroke="#efefef" strokeWidth="1" opacity="0.55" />
          <path d="M18 148 Q120 132 224 152" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="2" />
        </svg>
      );
    case 'nocturne':
      return (
        <svg viewBox="0 0 240 200" className="jh-filmstrip__img" aria-label={frame.title}>
          <rect width="240" height="200" fill="#111111" />
          <rect x="28" y="34" width="184" height="132" fill="#181818" stroke="#2c2c2c" strokeWidth="1" />
          <circle cx="152" cy="74" r="24" fill="#dcdcdc" opacity="0.9" />
          <circle cx="152" cy="74" r="36" fill="#dcdcdc" opacity="0.12" />
          <path d="M28 146 Q96 122 146 138 T212 128 L212 166 L28 166 Z" fill="#0a0a0a" />
        </svg>
      );
    case 'trees':
    default:
      return (
        <svg viewBox="0 0 240 200" className="jh-filmstrip__img" aria-label={frame.title}>
          <rect width="240" height="200" fill="#d8d8d8" />
          <rect x="118" y="18" width="96" height="182" fill="#e6e6e6" />
          <rect x="132" y="36" width="26" height="44" fill="#2e2e2e" />
          <rect x="170" y="36" width="26" height="44" fill="#2e2e2e" />
          <rect x="132" y="96" width="26" height="44" fill="#3c3c3c" />
          <path d="M10 198 L24 148 L48 148 L64 198 Z" fill="#2c2c2c" />
          <g stroke="#222222" strokeWidth="2.2" fill="none" strokeLinecap="round">
            <path d="M52 200 L52 44 M52 104 L18 68 M52 88 L88 54 M52 132 L82 110 M102 200 L96 74 M96 118 L128 84" />
          </g>
          <g fill="#f4f4f4" opacity="0.78">
            <circle cx="38" cy="54" r="14" /><circle cx="62" cy="46" r="16" /><circle cx="88" cy="60" r="13" />
            <circle cx="26" cy="74" r="11" /><circle cx="108" cy="76" r="14" />
          </g>
        </svg>
      );
  }
}

export function FilmstripGallery({
  label = '120 Filmstrip Gallery',
  frames = DEFAULT_FRAMES,
  value,
  defaultIndex = 0,
  onIndexChange,
  accentColor,
  material,
  className,
  style,
}: FilmstripGalleryProps) {
  const titleId = useId();
  const safeFrames = frames.length ? frames : DEFAULT_FRAMES;
  const [internalIndex, setInternalIndex] = useState(() =>
    Math.max(0, Math.min(safeFrames.length - 1, defaultIndex)),
  );
  const [pullOffsetPx, setPullOffsetPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const dragRef = useRef<{ startX: number; startIndex: number } | null>(null);
  const wheelTimerRef = useRef<number | null>(null);

  const controlled = value !== undefined;
  const activeIndex = controlled
    ? Math.max(0, Math.min(safeFrames.length - 1, value))
    : internalIndex;
  const current = safeFrames[activeIndex] ?? safeFrames[0];

  const selectFrame = useCallback(
    (nextRaw: number) => {
      const next = Math.max(0, Math.min(safeFrames.length - 1, nextRaw));
      if (!controlled) setInternalIndex(next);
      onIndexChange?.(next);
    },
    [controlled, onIndexChange, safeFrames.length],
  );

  const pulseScroll = useCallback(() => {
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

  const mergedStyle = accentColor
    ? { ...style, ['--jh-camera-accent' as string]: accentColor }
    : style;

  const ribbonExtensionPx = activeIndex * 10 + pullOffsetPx;
  const isExposedEnd = activeIndex === safeFrames.length - 1;

  return (
    <section
      className={cn('jh-filmstrip', className)}
      data-dragging={dragging ? 'true' : undefined}
      data-exposed={isExposedEnd ? 'true' : undefined}
      data-jh-material={material ? surfaceMaterialAttr(material) : undefined}
      style={mergedStyle}
      aria-labelledby={titleId}
    >
      <div className="jh-filmstrip__chassis">
        <div className="jh-filmstrip__header">
          <div className="jh-filmstrip__brand-col">
            <span id={titleId} className="jh-filmstrip__brand">120 Pan Roll</span>
            <span className="jh-filmstrip__emulsion">Noize · {current.iso ?? '400'} ASA</span>
          </div>
          <span className="jh-filmstrip__counter">
            Exp {String(activeIndex + 1).padStart(2, '0')} / {String(safeFrames.length).padStart(2, '0')}
          </span>
        </div>

        <div
          className="jh-filmstrip__well"
          onWheel={event => {
            event.preventDefault();
            const dir = (event.deltaY || event.deltaX) > 0 ? 1 : -1;
            selectFrame(activeIndex + dir);
            pulseScroll();
          }}
        >
          <div className="jh-filmstrip__frame-track">
            <div className="jh-filmstrip__frame-badge">
              <span>◀ {String(activeIndex + 1).padStart(2, '0')}</span>
              <span>{current.iso ?? '400'} ASA</span>
            </div>
            <div className="jh-filmstrip__artwork">
              <SpecimenPlate frame={current} />
            </div>
            <div className="jh-filmstrip__frame-meta">
              <strong>{current.title}</strong>
              <span className="jh-filmstrip__exif-pills">
                <span>{current.aperture ?? 'f/4'}</span>
                <span>{current.shutter ?? '1/250'}</span>
                <span>ISO {current.iso ?? '400'}</span>
              </span>
            </div>
          </div>
          <span className="jh-filmstrip__crosshair is-tl" aria-hidden="true">+</span>
          <span className="jh-filmstrip__crosshair is-br" aria-hidden="true">+</span>
        </div>

        <div className="jh-filmstrip__gate" aria-hidden="true">
          <span className="jh-filmstrip__gate-led" />
        </div>
      </div>

      <div className="jh-filmstrip__exit-port">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Pull protruding 120 film ribbon to advance frames"
          aria-valuemin={1}
          aria-valuemax={safeFrames.length}
          aria-valuenow={activeIndex + 1}
          aria-valuetext={`${current.title} (${activeIndex + 1} of ${safeFrames.length})`}
          className="jh-filmstrip__ribbon"
          style={{
            transform: `translateX(${Math.max(0, Math.min(42, ribbonExtensionPx))}px)`,
          }}
          onPointerDown={event => {
            if (event.button !== 0 || (event.target as HTMLElement).closest('button')) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { startX: event.clientX, startIndex: activeIndex };
            setDragging(true);
          }}
          onPointerMove={event => {
            const drag = dragRef.current;
            if (!drag) return;
            const dx = event.clientX - drag.startX;
            const stepShift = Math.round(dx / 30);
            setPullOffsetPx(Math.max(-14, Math.min(18, dx * 0.25)));
            selectFrame(drag.startIndex + stepShift);
          }}
          onPointerUp={event => {
            if (dragRef.current) {
              dragRef.current = null;
              setPullOffsetPx(0);
              setDragging(false);
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }
          }}
          onPointerCancel={() => {
            dragRef.current = null;
            setPullOffsetPx(0);
            setDragging(false);
          }}
          onWheel={event => {
            event.preventDefault();
            const dir = (event.deltaY || event.deltaX) > 0 ? 1 : -1;
            selectFrame(activeIndex + dir);
            pulseScroll();
          }}
          onKeyDown={event => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
              event.preventDefault();
              selectFrame(activeIndex + 1);
              pulseScroll();
            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
              event.preventDefault();
              selectFrame(activeIndex - 1);
              pulseScroll();
            }
          }}
        >
          <div className="jh-filmstrip__ribbon-dots" aria-hidden="true">
            <span className="jh-filmstrip__start-tag">◀ Start ▶</span>
            <div className="jh-filmstrip__dots-row">
              {safeFrames.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  tabIndex={-1}
                  className={cn('jh-filmstrip__num-step', i === activeIndex && 'is-active')}
                  onClick={() => {
                    selectFrame(i);
                    pulseScroll();
                  }}
                >
                  <span className="jh-filmstrip__micro-dots">•••</span>
                  <b>{i + 1}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="jh-filmstrip__ribbon-badge">
            <span className="jh-filmstrip__exposed">{isExposedEnd ? 'Exposed' : 'B&W 400 ASA'}</span>
            <span className="jh-filmstrip__tab-seal">Pan 120</span>
          </div>
        </div>
      </div>
    </section>
  );
}

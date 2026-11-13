import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface VerticalGalleryItem {
  id: string;
  src?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  frame?: string;
  seed?: number;
}

const DEFAULT_TITLES = [
  'Brutalist Span', 'Tidal Shelf', 'Solar Meridian', 'Nocturne Gate',
  'Silica Dune', 'Atrium Light', 'Zenith Ring', 'Basalt Wall',
  'North Pier', 'Glass Louver', 'Cloud Stratum', 'Quarry Cut',
  'Harbor Fog', 'Timber Vault', 'Salt Flat', 'Column Study',
] as const;

const DEFAULT_ITEMS: VerticalGalleryItem[] = Array.from({ length: 64 }, (_, index) => ({
  id: `vg-${index + 1}`,
  frame: String(index + 1).padStart(2, '0'),
  title: `${DEFAULT_TITLES[index % DEFAULT_TITLES.length]} ${String(Math.floor(index / DEFAULT_TITLES.length) + 1).padStart(2, '0')}`,
  subtitle: index % 3 === 0 ? '50mm · f/4' : index % 3 === 1 ? '35mm · f/5.6' : '80mm · f/2.8',
  seed: index,
}));

/** Updates item opacities inside any scroll viewport so cropped items never jut out sharply. */
export function syncScrollItemVisibility(viewport: HTMLElement | null, selector?: string) {
  if (!viewport) return;
  const vRect = viewport.getBoundingClientRect();
  if (vRect.height <= 0) return;

  const vTop = vRect.top + viewport.clientTop;
  const vBottom = vTop + viewport.clientHeight;
  const style = getComputedStyle(viewport);
  const padTop = parseFloat(style.paddingTop || '0') || 0;
  const padBottom = parseFloat(style.paddingBottom || '0') || 0;
  const innerTop = vTop + Math.min(padTop, 6);
  const innerBottom = vBottom - Math.min(padBottom, 6);

  const hasMoreAbove = viewport.scrollTop > 2;
  const hasMoreBelow = viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 2;
  if (hasMoreAbove) viewport.setAttribute('data-scroll-overflow-top', 'true');
  else viewport.removeAttribute('data-scroll-overflow-top');
  if (hasMoreBelow) viewport.setAttribute('data-scroll-overflow-bottom', 'true');
  else viewport.removeAttribute('data-scroll-overflow-bottom');

  let nodes: NodeListOf<HTMLElement>;
  if (selector) {
    nodes = viewport.querySelectorAll<HTMLElement>(selector);
  } else if (viewport.querySelector('.jh-simple-scroll__item')) {
    nodes = viewport.querySelectorAll<HTMLElement>('.jh-simple-scroll__item');
  } else if (viewport.querySelector('.jh-accordion__item')) {
    nodes = viewport.querySelectorAll<HTMLElement>('.jh-accordion__item');
  } else if (viewport.querySelector('[role="option"]')) {
    nodes = viewport.querySelectorAll<HTMLElement>('[role="option"]');
  } else if (viewport.querySelector('.jh-scroll-option')) {
    nodes = viewport.querySelectorAll<HTMLElement>('.jh-scroll-option, .jh-scroll-category__title');
  } else if (viewport.querySelector('.jh-command-dialog__item')) {
    nodes = viewport.querySelectorAll<HTMLElement>('.jh-command-dialog__item');
  } else if (viewport.querySelector('.jh-vertical-gallery__item')) {
    nodes = viewport.querySelectorAll<HTMLElement>('.jh-vertical-gallery__item');
  } else {
    nodes = viewport.querySelectorAll<HTMLElement>('li');
  }

  const overflowing = viewport.scrollHeight > viewport.clientHeight + 2;
  nodes.forEach(item => {
    if (!overflowing) {
      item.style.setProperty('--jh-scroll-item-opacity', '1');
      return;
    }
    const r = item.getBoundingClientRect();
    const h = r.height;
    if (h <= 0) return;
    const visTop = Math.max(r.top, innerTop);
    const visBottom = Math.min(r.bottom, innerBottom);
    const visiblePx = Math.max(0, visBottom - visTop);
    const ratio = visiblePx / h;

    let opacity = 1;
    if (visiblePx <= 1 || ratio < 0.45) {
      opacity = 0;
    } else if (ratio < 0.96) {
      const t = Math.min(1, Math.max(0, (ratio - 0.45) / 0.51));
      opacity = Number((0.2 + t * 0.62).toFixed(3));
    }
    item.style.setProperty('--jh-scroll-item-opacity', String(opacity));
  });
}

export function useScrollItemReveal(
  viewportRef: { current: HTMLElement | null },
  deps: readonly unknown[] = [],
  selector?: string,
) {
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let raf = 0;
    let tweenRaf = 0;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => syncScrollItemVisibility(el, selector));
    };
    const trackTransition = () => {
      cancelAnimationFrame(tweenRaf);
      const until = performance.now() + 240;
      const step = () => {
        syncScrollItemVisibility(el, selector);
        if (performance.now() < until) tweenRaf = requestAnimationFrame(step);
      };
      tweenRaf = requestAnimationFrame(step);
    };
    syncScrollItemVisibility(el, selector);
    el.addEventListener('scroll', run, { passive: true });
    el.addEventListener('transitionrun', trackTransition);
    el.addEventListener('transitionend', run);
    const rafInit = requestAnimationFrame(() => syncScrollItemVisibility(el, selector));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(run) : null;
    ro?.observe(el);
    Array.from(el.children).forEach(child => ro?.observe(child));
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(trackTransition) : null;
    mo?.observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-state'] });
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafInit);
      cancelAnimationFrame(tweenRaf);
      el.removeEventListener('scroll', run);
      el.removeEventListener('transitionrun', trackTransition);
      el.removeEventListener('transitionend', run);
      ro?.disconnect();
      mo?.disconnect();
    };
  }, [viewportRef, selector, ...deps]);
}

function SpecimenArtwork({ item, index }: { item: VerticalGalleryItem; index: number }) {
  if (item.src) {
    return <img src={item.src} alt={item.alt ?? item.title ?? `Plate ${index + 1}`} loading="lazy" draggable={false} />;
  }
  const seed = item.seed ?? index;
  const variant = seed % 6;
  const darkTone = ((seed * 37) % 100) > 48;
  const bgTop = darkTone ? '#1a1a1c' : '#e6e6e8';
  const bgBottom = darkTone ? '#0b0b0c' : '#c6c6ca';
  const accent = darkTone ? '#d8d8dc' : '#262629';
  const mid = darkTone ? '#56565c' : '#7b7b82';
  const gradId = `jh-vg-g-${seed}`;
  const shift = ((seed * 19) % 44) - 22;

  return (
    <svg viewBox="0 0 120 76" className="jh-vertical-gallery__svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bgTop} />
          <stop offset="100%" stopColor={bgBottom} />
        </linearGradient>
      </defs>
      <rect width="120" height="76" fill={`url(#${gradId})`} />
      {variant === 0 && (
        <>
          <circle cx={60 + shift * 0.5} cy={34} r={14} fill={accent} opacity="0.82" />
          <path d={`M0 52 Q${42 + shift} 42 120 50 L120 76 L0 76 Z`} fill={mid} opacity="0.55" />
        </>
      )}
      {variant === 1 && (
        <>
          <rect x={16 + (seed % 18)} y="14" width="26" height="62" fill={mid} opacity="0.65" />
          <rect x={54 + (seed % 12)} y="24" width="38" height="52" fill={accent} opacity="0.28" />
          <line x1="0" y1="58" x2="120" y2="58" stroke={accent} strokeWidth="1" opacity="0.32" />
        </>
      )}
      {variant === 2 && (
        <>
          <polygon points={`0,76 ${48 + shift},18 120,76`} fill={mid} opacity="0.5" />
          <circle cx={88 - (seed % 20)} cy="22" r="7" fill={accent} opacity="0.72" />
        </>
      )}
      {variant === 3 && (
        <>
          <circle cx="60" cy="38" r="24" fill="none" stroke={accent} strokeWidth="1.2" opacity="0.45" />
          <circle cx="60" cy="38" r="11" fill={accent} opacity="0.7" />
        </>
      )}
      {variant === 4 && (
        <>
          <path d={`M0 44 C36 ${24 + shift * 0.4}, 76 ${58 - shift * 0.4}, 120 34 L120 76 L0 76 Z`} fill={mid} opacity="0.6" />
          <line x1="16" y1="22" x2="104" y2="22" stroke={accent} strokeWidth="0.9" opacity="0.28" />
        </>
      )}
      {variant === 5 && (
        <>
          <rect x="22" y="14" width="76" height="48" rx="4" fill="none" stroke={accent} strokeWidth="1.1" opacity="0.4" />
          <path d={`M22 ${48 + (seed % 10)} L${66 + shift * 0.3} 24 L98 62 L22 62 Z`} fill={accent} opacity="0.48" />
        </>
      )}
    </svg>
  );
}

export const GALLERY_ASPECT_RATIOS = ['1:1', '3:4', '4:5', '9:16', '16:9'] as const;
export type GalleryAspectRatio = (typeof GALLERY_ASPECT_RATIOS)[number];

/** Vertical scrolling 4-column image gallery with selectable aspect ratio and edge progressive reveal. */
export function VerticalGallery({
  items = DEFAULT_ITEMS,
  columns = 4,
  visibleRows = 12,
  selectedId,
  defaultSelectedId,
  onSelect,
  label = 'Vertical image gallery',
  title = 'Gallery',
  defaultAspectRatio = '1:1',
  material = 'solid',
  className,
  style,
}: {
  items?: VerticalGalleryItem[];
  title?: string;
  columns?: number;
  visibleRows?: number;
  defaultAspectRatio?: GalleryAspectRatio;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelect?: (item: VerticalGalleryItem, index: number) => void;
  label?: string;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}) {
  const safeCols = Math.max(2, Math.min(6, Math.round(columns)));
  const safeRows = Math.max(4, Math.min(16, Math.round(visibleRows)));
  const [internalId, setInternalId] = useState(defaultSelectedId ?? items[0]?.id ?? '');
  const activeId = selectedId ?? internalId;
  const viewportRef = useRef<HTMLDivElement>(null);

  useScrollItemReveal(viewportRef, [items.length, safeCols, safeRows], '.jh-vertical-gallery__item');

  const [ratio, setRatio] = useState<GalleryAspectRatio>(defaultAspectRatio);
  const [ratioOpen, setRatioOpen] = useState(false);
  const ratioMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ratioOpen) return;
    const close = (event: MouseEvent) => {
      if (!ratioMenuRef.current?.contains(event.target as Node)) setRatioOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setRatioOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [ratioOpen]);

  useEffect(() => {
    if (viewportRef.current) syncScrollItemVisibility(viewportRef.current, '.jh-vertical-gallery__item');
  }, [ratio]);

  return (
    <section
      className={cn('jh-vertical-gallery', className)}
      data-jh-material={surfaceMaterialAttr(material)}
      style={{
        '--jh-vg-cols': safeCols,
        '--jh-vg-rows': safeRows,
        '--jh-vg-ratio': ratio.replace(':', ' / '),
        ...style,
      } as CSSProperties}
      aria-label={label}
    >
      <div className="jh-vertical-gallery__toolbar" ref={ratioMenuRef}>
        <strong className="jh-vertical-gallery__title">{title}</strong>
        <Button
          variant="secondary"
          size="small"
          className="jh-vertical-gallery__ratio-trigger"
          aria-haspopup="listbox"
          aria-expanded={ratioOpen}
          aria-label={`Aspect ratio ${ratio}`}
          onClick={() => setRatioOpen(open => !open)}
        >
          {ratio}
          <ChevronDown size={13} aria-hidden="true" />
        </Button>
        {ratioOpen && (
          <div className="jh-vertical-gallery__ratio-menu" role="listbox" aria-label="Aspect ratio">
            {GALLERY_ASPECT_RATIOS.map(option => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === ratio}
                className="jh-vertical-gallery__ratio-option"
                onClick={() => { setRatio(option); setRatioOpen(false); }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={viewportRef}
        className="jh-vertical-gallery__viewport"
        role="region"
        aria-label={`${label} grid (${safeCols} by ${safeRows} visible)`}
        tabIndex={0}
      >
        <div className="jh-vertical-gallery__grid">
          {items.map((item, index) => {
            const active = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                className={cn('jh-vertical-gallery__item', active && 'is-selected')}
                aria-pressed={active}
                aria-label={item.title ?? `Image ${index + 1}`}
                onClick={() => {
                  if (selectedId === undefined) setInternalId(item.id);
                  onSelect?.(item, index);
                }}
              >
                <span className="jh-vertical-gallery__thumb">
                  <SpecimenArtwork item={item} index={index} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useRef, useState } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';
import { useScrollItemReveal } from './vertical-gallery';

export interface SimpleScrollItem {
  id: string;
  label: string;
  subtitle?: string;
  meta?: string;
}

const DEFAULT_ITEMS: SimpleScrollItem[] = [
  { id: 'calibration', label: 'Sensor calibration', subtitle: 'Barometric zero drift check', meta: '08:15' },
  { id: 'surfaces', label: 'Surface diffusion', subtitle: 'Porcelain matte and frosted layers', meta: '22px' },
  { id: 'concentric', label: 'Concentric radii', subtitle: 'Inner inset derived from outer arc', meta: '60%' },
  { id: 'metering', label: 'Peak meter matrix', subtitle: 'Pure OKLCH emission across 12 rows', meta: '-4 dB' },
  { id: 'ephemeris', label: 'Lunar terminator', subtitle: 'Waxing gibbous illumination pass', meta: '74%' },
  { id: 'typetokens', label: 'Tabular figures', subtitle: 'Fixed advance width across readouts', meta: 'Geist' },
  { id: 'filmstrip', label: '120 film gate', subtitle: 'Frame advance and pin illumination', meta: 'f/4' },
  { id: 'motion', label: 'Static disclosure', subtitle: 'Zero weight jump on open triggers', meta: '160ms' },
  { id: 'audio', label: 'Harmonic filter', subtitle: 'Cutoff resonance envelope trace', meta: '68%' },
  { id: 'wind', label: 'Coastal wind vector', subtitle: 'Southeast gusts over Pecem station', meta: '135°' },
  { id: 'horizon', label: 'Pitch and roll balance', subtitle: 'Dual inclinometer and bank arcs', meta: '+8°' },
  { id: 'archive', label: 'Release snapshot', subtitle: 'Registry artifacts compiled locally', meta: 'v2.4' },
];

/** Clean single-column vertical scrolling list with progressive edge reveal. */
export function SimpleScroll({
  items = DEFAULT_ITEMS,
  value,
  defaultValue,
  onValueChange,
  label = 'Simple vertical scroll',
  maxHeight = 236,
  material = 'solid',
  className,
}: {
  items?: SimpleScrollItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  maxHeight?: number;
  material?: SurfaceMaterial;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id ?? '');
  const activeValue = value ?? internalValue;
  const viewportRef = useRef<HTMLDivElement>(null);

  useScrollItemReveal(viewportRef, [items.length, maxHeight, material], '.jh-simple-scroll__item');

  const selectItem = (id: string) => {
    if (value === undefined) setInternalValue(id);
    onValueChange?.(id);
  };

  return (
    <div
      className={cn('jh-scroll-frame jh-simple-scroll', className)}
      data-jh-material={surfaceMaterialAttr(material)}
      style={{ maxHeight }}
    >
      <div
        ref={viewportRef}
        className="jh-scroll-area jh-simple-scroll__viewport"
        role="listbox"
        aria-label={label}
        tabIndex={0}
        style={{ maxHeight }}
      >
        <ul className="jh-simple-scroll__list">
          {items.map(item => {
            const selected = activeValue === item.id;
            return (
              <li key={item.id} className="jh-simple-scroll__row">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn('jh-simple-scroll__item', selected && 'is-selected')}
                  onClick={() => selectItem(item.id)}
                >
                  <span className="jh-simple-scroll__copy">
                    <strong>{item.label}</strong>
                    {item.subtitle && <span>{item.subtitle}</span>}
                  </span>
                  {item.meta && <span className="jh-simple-scroll__meta">{item.meta}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

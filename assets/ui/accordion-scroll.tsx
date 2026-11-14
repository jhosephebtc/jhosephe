import { useRef, type CSSProperties } from 'react';
import { Accordion, type AccordionItem } from './accordion';
import { cn } from './utils';
import { useScrollItemReveal } from './vertical-gallery';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

const DEFAULT_ITEMS: AccordionItem[] = [
  {
    value: 'spacing',
    title: 'Spacing and optical grid',
    content: 'Shared 4px spacing steps keep controls, category titles, and value readouts aligned along a single vertical axis.',
  },
  {
    value: 'corners',
    title: 'Concentric smooth corners',
    content: 'Inner radii subtract container inset directly from the outer corner curve so borders stay equidistant everywhere.',
  },
  {
    value: 'surfaces',
    title: 'Porcelain & Obsidian layers',
    content: 'Solid surfaces maintain neutral #f7f7f7 and #0a0a0a elevations without color cast or unintended backdrop blur.',
  },
  {
    value: 'reveal',
    title: 'Progressive scroll reveal',
    content: 'Items near the scroll edge stay hidden below threshold height and emerge gradually with smooth opacity as space opens.',
  },
  {
    value: 'optics',
    title: 'Pure LED light emission',
    content: 'Active meter segments omit dark inset shadows so accent hues retain full OKLCH clarity across small pixel grids.',
  },
  {
    value: 'motion',
    title: 'Static disclosure triggers',
    content: 'Opening a section expands the nested panel cleanly while locking label font weight and position against jitter.',
  },
  {
    value: 'keyboard',
    title: 'Roving arrow navigation',
    content: 'Use Up/Down, Home, and End keys to step through collapsible disclosures inside the scrollable viewport.',
  },
];

/** Scrollable vertical container wrapping accessible Accordion disclosures with progressive edge reveal. */
export function AccordionScroll({
  items = DEFAULT_ITEMS,
  label = 'Scrollable accordion sections',
  type = 'single',
  defaultValue = 'spacing',
  maxHeight = 264,
  width,
  material = 'solid',
  className,
  style,
}: {
  items?: AccordionItem[];
  label?: string;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  maxHeight?: number | string;
  width?: number | string;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  useScrollItemReveal(viewportRef, [items.length, maxHeight, material], '.jh-accordion__item');

  return (
    <div
      className={cn('jh-scroll-frame jh-accordion-scroll', className)}
      data-jh-material={surfaceMaterialAttr(material)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        ...style,
      }}
    >
      <div
        ref={viewportRef}
        className="jh-scroll-area jh-accordion-scroll__viewport"
        style={{ height: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
        tabIndex={0}
        role="region"
        aria-label={label}
      >
        <Accordion
          items={items}
          label={label}
          type={type}
          defaultValue={defaultValue}
          material={material}
        />
      </div>
    </div>
  );
}

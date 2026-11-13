import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils';
import { normalizeSurfaceMaterial, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface AccordionItem {
  value: string;
  title: string;
  content: ReactNode;
}

/** A keyboard-operable accordion styled after Glass Menu surfaces. */
export function Accordion({
  items,
  label = 'Details',
  type = 'single',
  defaultValue,
  material = 'solid',
  className,
}: {
  items: AccordionItem[];
  label?: string;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  material?: SurfaceMaterial;
  className?: string;
}) {
  const baseId = `jh-accordion-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [openItems, setOpenItems] = useState<string[]>(() =>
    defaultValue === undefined ? [] : Array.isArray(defaultValue) ? defaultValue : [defaultValue],
  );
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const finish = normalizeSurfaceMaterial(material);
  const matAttr = surfaceMaterialAttr(material);

  const toggle = (value: string) =>
    setOpenItems(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : type === 'single'
          ? [value]
          : [...current, value],
    );

  const onTriggerKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const count = items.length;
    if (!count) return;
    let next = -1;
    if (event.key === 'ArrowDown') next = (index + 1) % count;
    else if (event.key === 'ArrowUp') next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    if (next >= 0) {
      event.preventDefault();
      triggerRefs.current[next]?.focus();
    }
  };

  return (
    <div
      className={cn('jh-accordion', finish === 'liquid' && 'jh-menu--liquid', className)}
      data-jh-material={matAttr}
      aria-label={label}
    >
      {items.map((item, index) => {
        const open = openItems.includes(item.value);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <section className="jh-accordion__item" key={item.value} data-state={open ? 'open' : 'closed'}>
            <h3 className="jh-accordion__heading">
              <button
                ref={el => { triggerRefs.current[index] = el; }}
                id={triggerId}
                className="jh-accordion__trigger"
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.value)}
                onKeyDown={event => onTriggerKeyDown(index, event)}
              >
                <span>{item.title}</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={panelId}
              className="jh-accordion__panel"
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!open}
              inert={!open || undefined}
            >
              <div className="jh-accordion__content"><div className="jh-accordion__inner">{item.content}</div></div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

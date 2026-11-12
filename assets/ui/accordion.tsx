import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem { value: string; title: string; content: ReactNode }

/** A keyboard-operable accordion with optional single-open behavior. */
export function Accordion({ items, label = 'Details', type = 'single', defaultValue }: {
  items: AccordionItem[]; label?: string; type?: 'single' | 'multiple'; defaultValue?: string | string[];
}) {
  const baseId = `jh-accordion-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [openItems, setOpenItems] = useState<string[]>(() => defaultValue === undefined ? [] : Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
  const toggle = (value: string) => setOpenItems(current => current.includes(value)
    ? current.filter(item => item !== value)
    : type === 'single' ? [value] : [...current, value]);
  return <div className="jh-accordion" aria-label={label}>
    {items.map((item, index) => {
      const open = openItems.includes(item.value);
      const triggerId = `${baseId}-trigger-${index}`;
      const panelId = `${baseId}-panel-${index}`;
      return <section className="jh-accordion__item" key={item.value} data-state={open ? 'open' : 'closed'}>
        <h3 className="jh-accordion__heading"><button id={triggerId} className="jh-accordion__trigger" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => toggle(item.value)}>
          <span>{item.title}</span><ChevronDown size={16} aria-hidden="true" />
        </button></h3>
        <div id={panelId} className="jh-accordion__panel" role="region" aria-labelledby={triggerId} aria-hidden={!open} inert={!open || undefined}>
          <div className="jh-accordion__content">{item.content}</div>
        </div>
      </section>;
    })}
  </div>;
}

import { useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from './utils';
import { useScrollItemReveal } from './vertical-gallery';

export interface ScrollOption {
  value: string;
  label: string;
  detail?: string;
}

export interface ScrollCategory {
  title: string;
  options: ScrollOption[];
}

export function ScrollArea({
  children,
  categories,
  columns,
  selectedValue,
  onSelect,
  label = 'Scrollable content',
  maxHeight = 240,
  className,
  style,
  ...props
}: {
  children?: ReactNode;
  categories?: ScrollCategory[];
  columns?: 1 | 2 | 3;
  selectedValue?: string;
  onSelect?: (value: string) => void;
  label?: string;
  maxHeight?: number;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'>) {
  const [internalSelected, setInternalSelected] = useState(
    () => categories?.[0]?.options[0]?.value ?? '',
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const activeValue = selectedValue ?? internalSelected;
  const resolvedColumns: 1 | 2 | 3 = categories?.length
    ? (Math.min(3, Math.max(1, columns ?? categories.length)) as 1 | 2 | 3)
    : (Math.min(3, Math.max(1, columns ?? 1)) as 1 | 2 | 3);

  useScrollItemReveal(viewportRef, [resolvedColumns, categories?.length ?? 0, maxHeight]);

  const choose = (value: string) => {
    if (selectedValue === undefined) setInternalSelected(value);
    onSelect?.(value);
  };

  return (
    <div
      className="jh-scroll-frame"
      data-columns={resolvedColumns > 1 || categories ? resolvedColumns : undefined}
      style={{ maxHeight }}
    >
      <div
        ref={viewportRef}
        className={cn('jh-scroll-area', className)}
        role="region"
        aria-label={label}
        tabIndex={0}
        style={{ maxHeight, ...style }}
        {...props}
      >
        {categories?.length ? (
          <div className="jh-scroll-columns" data-columns={resolvedColumns}>
            {categories.map(category => (
              <section key={category.title} className="jh-scroll-category" aria-label={category.title}>
                <h3 className="jh-scroll-category__title">{category.title}</h3>
                <ul className="jh-scroll-category__list">
                  {category.options.map(option => {
                    const selected = activeValue === option.value;
                    return (
                      <li key={option.value} className="jh-scroll-category__item">
                        <button
                          type="button"
                          className="jh-scroll-option"
                          aria-pressed={selected}
                          onClick={() => choose(option.value)}
                        >
                          <span>{option.label}</span>
                          {option.detail && <small>{option.detail}</small>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

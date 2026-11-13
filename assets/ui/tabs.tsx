import { useCallback, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { ShaderSurface } from './shader-surface';
import { cn } from './utils';
import { normalizeSurfaceMaterial, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface TabItem {
  value: string;
  label: string;
  badge?: string | number;
  content: ReactNode;
  disabled?: boolean;
}

/** Accessible single-row tabbed surface with roving keyboard focus and surface material support. */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label = 'Sections',
  material = 'solid',
  className,
}: {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  material?: SurfaceMaterial;
  className?: string;
}) {
  const baseId = `jh-tabs-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const firstEnabled = items.find(item => !item.disabled)?.value ?? items[0]?.value ?? '';
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeValue = value !== undefined ? value : internalValue;
  const currentTab = items.some(item => item.value === activeValue) ? activeValue : firstEnabled;
  const finish = normalizeSurfaceMaterial(material);
  const matAttr = surfaceMaterialAttr(material);
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);
  const itemSignature = items.map(item => `${item.value}:${item.label}:${item.badge ?? ''}`).join('|');

  const measureThumb = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const activeIndex = items.findIndex(item => item.value === currentTab);
    const activeEl = tabRefs.current[activeIndex];
    if (!activeEl) return;
    const left = activeEl.offsetLeft;
    const width = activeEl.offsetWidth;
    if (width > 0) setThumb(prev => (prev && prev.left === left && prev.width === width ? prev : { left, width }));
  }, [currentTab, itemSignature]);

  useLayoutEffect(() => {
    measureThumb();
    const list = listRef.current;
    if (!list) return;
    window.addEventListener('resize', measureThumb);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measureThumb) : null;
    observer?.observe(list);
    return () => {
      window.removeEventListener('resize', measureThumb);
      observer?.disconnect();
    };
  }, [measureThumb]);

  const thumbStyle = thumb
    ? ({ width: `${thumb.width}px`, transform: `translate3d(${thumb.left}px, 0, 0)` } as CSSProperties)
    : undefined;

  const selectTab = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const moveFocus = (fromIndex: number, step: 1 | -1) => {
    const count = items.length;
    for (let offset = 1; offset <= count; offset++) {
      const idx = (fromIndex + offset * step + count) % count;
      if (!items[idx]?.disabled) {
        selectTab(items[idx].value);
        tabRefs.current[idx]?.focus();
        return;
      }
    }
  };

  const onTabKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(index, 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(index, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      const firstIdx = items.findIndex(item => !item.disabled);
      if (firstIdx >= 0) {
        selectTab(items[firstIdx].value);
        tabRefs.current[firstIdx]?.focus();
      }
    } else if (event.key === 'End') {
      event.preventDefault();
      for (let idx = items.length - 1; idx >= 0; idx--) {
        if (!items[idx].disabled) {
          selectTab(items[idx].value);
          tabRefs.current[idx]?.focus();
          return;
        }
      }
    }
  };

  return (
    <div
      className={cn('jh-tabs', finish === 'liquid' && 'jh-tabs--liquid', className)}
      data-jh-material={matAttr}
    >
      {finish === 'liquid' ? <ShaderSurface /> : null}
      <div ref={listRef} className="jh-tabs__list" role="tablist" aria-label={label}>
        <span className="jh-tabs__thumb" aria-hidden="true" style={thumbStyle} data-ready={thumb ? true : undefined} />
        {items.map((item, index) => {
          const isSelected = item.value === currentTab;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;
          return (
            <button
              key={item.value}
              ref={el => { tabRefs.current[index] = el; }}
              id={tabId}
              type="button"
              role="tab"
              disabled={item.disabled}
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className="jh-tabs__tab"
              onClick={() => {
                if (!item.disabled) selectTab(item.value);
              }}
              onKeyDown={event => onTabKeyDown(index, event)}
            >
              <span>{item.label}</span>
              {item.badge !== undefined ? <span className="jh-tabs__badge">{item.badge}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="jh-tabs__panels">
        {items.map((item, index) => {
          const isSelected = item.value === currentTab;
          const tabId = `${baseId}-tab-${index}`;
          const panelId = `${baseId}-panel-${index}`;
          return (
            <div
              key={item.value}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabId}
              tabIndex={0}
              hidden={!isSelected}
              className="jh-tabs__panel"
            >
              {item.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ScrollArea } from './scroll-area';
import { cn } from './utils';

export type PickerBox = { top: number; left: number; width: number; maxHeight: number };

export function placePickerPanel(trigger: HTMLElement | null, preferredHeight = 280): PickerBox | null {
  if (!trigger) return null;
  const rect = trigger.getBoundingClientRect();
  const gap = 8;
  const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
  const spaceAbove = rect.top - gap - 12;
  const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
  const maxHeight = Math.max(160, Math.min(preferredHeight, openUp ? spaceAbove : spaceBelow));
  const top = openUp
    ? Math.max(12, rect.top - gap - maxHeight)
    : Math.min(window.innerHeight - maxHeight - 12, rect.bottom + gap);
  // Match trigger width exactly (viewport-clamped only). Never expand to stage width.
  const width = Math.min(Math.max(rect.width, 160), window.innerWidth - 24);
  const left = Math.min(
    Math.max(12, rect.left),
    Math.max(12, window.innerWidth - width - 12),
  );
  return { top, left, width, maxHeight };
}

/** Portaled Soft-input / Vertical-scroll picker panel, stacks above modals. */
export function PickerPanel({
  open,
  triggerRef,
  onClose,
  search,
  onSearchChange,
  searchPlaceholder = 'Search',
  label,
  footer,
  className,
  children,
  preferredHeight = 280,
}: {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  label: string;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
  preferredHeight?: number;
}) {
  const [box, setBox] = useState<PickerBox | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const place = () => setBox(placePickerPanel(triggerRef.current, preferredHeight));

  useLayoutEffect(() => {
    if (!open) { setBox(null); return; }
    place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panel.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    const onReposition = () => place();
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, onClose, triggerRef]);

  if (!open || !box || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={panel}
      className={cn('jh-picker-overlay', className)}
      role="presentation"
      style={{
        top: box.top,
        left: box.left,
        width: box.width,
        maxWidth: box.width,
        maxHeight: box.maxHeight,
        ['--jh-picker-width' as string]: `${box.width}px`,
      }}
    >
      <label className="jh-picker-overlay__search">
        <span className="jh-visually-hidden">Search {label}</span>
        <input
          className="jh-input"
          autoFocus
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          onKeyDown={event => {
            if (event.key === 'Escape') onClose();
          }}
        />
        <kbd>Esc</kbd>
      </label>
      <ScrollArea label={label} maxHeight={Math.max(120, box.maxHeight - 86)} className="jh-picker-overlay__scroll">
        {children}
      </ScrollArea>
      {footer ? <div className="jh-picker-overlay__footer">{footer}</div> : null}
    </div>,
    document.body,
  );
}

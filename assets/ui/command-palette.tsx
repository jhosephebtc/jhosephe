import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { CornerDownLeft, Search, X } from 'lucide-react';
import { Input } from './input';
import { ShaderSurface } from './shader-surface';
import { cn } from './utils';
import { normalizeSurfaceMaterial, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  hint?: string;
  shortcut?: string;
  onSelect?: () => void;
}

const DEFAULT_COMMANDS: CommandItem[] = [
  { id: 'sync-ephemeris', label: 'Sync local ephemeris', group: 'Telemetry', hint: 'Recalculate solar and lunar angles', shortcut: 'E' },
  { id: 'switch-metric', label: 'Toggle metric and imperial units', group: 'Telemetry', hint: 'Switch °C/°F, km/h/kt, and m/ft', shortcut: 'U' },
  { id: 'new-order', label: 'Open brokerage ticket', group: 'Workspace', hint: 'Stage a limit or market order', shortcut: 'O' },
  { id: 'export-snapshot', label: 'Export JSON snapshot', group: 'Workspace', hint: 'Copy current component state', shortcut: 'S' },
  { id: 'toggle-surface', label: 'Cycle surface material', group: 'Appearance', hint: 'Solid, Liquid Glass, or Liquid', shortcut: 'M' },
];

/** Keyboard-first modal command runner following the layered dialog geometry. */
export function CommandPalette({
  items = DEFAULT_COMMANDS,
  onSelect,
  triggerLabel = 'Commands',
  placeholder = 'Type a command or section…',
  label = 'Command palette',
  material = 'solid',
  hotkey = false,
}: {
  items?: CommandItem[];
  onSelect?: (item: CommandItem) => void;
  triggerLabel?: string;
  placeholder?: string;
  label?: string;
  material?: SurfaceMaterial;
  hotkey?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const titleId = `jh-command-title-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const listboxId = `jh-command-list-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const finish = normalizeSurfaceMaterial(material);
  const matAttr = surfaceMaterialAttr(material);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      item.label.toLowerCase().includes(q)
      || (item.group?.toLowerCase().includes(q) ?? false)
      || (item.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Array<{ item: CommandItem; flatIndex: number }>>();
    filtered.forEach((item, flatIndex) => {
      const groupName = item.group ?? 'Commands';
      const bucket = map.get(groupName) ?? [];
      bucket.push({ item, flatIndex });
      map.set(groupName, bucket);
    });
    return Array.from(map.entries());
  }, [filtered]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!hotkey) return;
    const onGlobalKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(current => !current);
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [hotkey]);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const closePalette = () => {
    setOpen(false);
    setQuery('');
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const runItem = (item: CommandItem) => {
    setLastExecuted(item.label);
    item.onSelect?.();
    onSelect?.(item);
    closePalette();
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(current => (current + 1) % filtered.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(current => (current - 1 + filtered.length) % filtered.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(filtered.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = filtered[activeIndex];
      if (target) runItem(target);
    }
  };

  return (
    <div className="jh-command-palette">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'jh-command-trigger',
          finish === 'liquid' && 'jh-command-trigger--liquid',
        )}
        data-jh-material={matAttr}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Search size={14} strokeWidth={1.75} aria-hidden="true" className="jh-command-trigger__icon" />
        <span className="jh-command-trigger__label">{lastExecuted ?? triggerLabel}</span>
        <kbd className="jh-command-trigger__kbd">⌘K</kbd>
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div className="jh-picker-overlay jh-picker-overlay--modal" onClick={closePalette}>
              <div
                className={cn(
                  'jh-dialog jh-dialog--rich jh-command-dialog',
                  finish === 'liquid' && 'jh-command-dialog--liquid',
                )}
                data-jh-material={matAttr}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onClick={event => event.stopPropagation()}
              >
                {finish === 'liquid' ? <ShaderSurface /> : null}
                <div className="jh-financial-order">
                  <div className="jh-financial-order__header">
                    <div>
                      <span className="jh-financial-order__eyebrow">Quick actions</span>
                      <h2 className="jh-dialog-title" id={titleId}>{label}</h2>
                    </div>
                    <button
                      type="button"
                      className="jh-financial-order__close"
                      aria-label="Close"
                      onClick={closePalette}
                    >
                      <X size={15} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="jh-financial-order__body jh-command-dialog__body">
                    <div className="jh-command-dialog__search">
                      <Search size={14} strokeWidth={1.75} aria-hidden="true" className="jh-command-dialog__search-icon" />
                      <Input
                        ref={searchRef}
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        onKeyDown={onInputKeyDown}
                        placeholder={placeholder}
                        aria-label={placeholder}
                        aria-controls={listboxId}
                        aria-activedescendant={filtered[activeIndex] ? `${listboxId}-${filtered[activeIndex].id}` : undefined}
                      />
                    </div>

                    <div
                      id={listboxId}
                      role="listbox"
                      aria-label={label}
                      className="jh-command-dialog__results"
                    >
                      {grouped.length === 0 ? (
                        <div className="jh-command-dialog__empty">No matching command.</div>
                      ) : (
                        grouped.map(([groupName, entries]) => (
                          <div key={groupName} className="jh-command-dialog__group">
                            <div className="jh-command-dialog__group-label">{groupName}</div>
                            {entries.map(({ item, flatIndex }) => {
                              const isActive = flatIndex === activeIndex;
                              return (
                                <button
                                  key={item.id}
                                  id={`${listboxId}-${item.id}`}
                                  type="button"
                                  role="option"
                                  aria-selected={isActive}
                                  className={cn('jh-command-dialog__item', isActive && 'is-active')}
                                  onMouseEnter={() => setActiveIndex(flatIndex)}
                                  onClick={() => runItem(item)}
                                >
                                  <span className="jh-command-dialog__item-copy">
                                    <span className="jh-command-dialog__item-label">{item.label}</span>
                                    {item.hint ? <span className="jh-command-dialog__item-hint">{item.hint}</span> : null}
                                  </span>
                                  {item.shortcut ? (
                                    <kbd className="jh-command-dialog__shortcut">{item.shortcut}</kbd>
                                  ) : (
                                    <CornerDownLeft size={12} strokeWidth={1.75} aria-hidden="true" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="jh-financial-order__footer jh-command-dialog__footer">
                    <span>{filtered.length} {filtered.length === 1 ? 'command' : 'commands'}</span>
                    <span>↑↓ navigate · ↵ run · Esc close</span>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

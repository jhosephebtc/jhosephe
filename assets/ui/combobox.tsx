import { useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PickerPanel } from './picker-panel';
import { cn } from './utils';
import { normalizeSurfaceMaterial, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface ComboboxOption {
  value: string;
  label: string;
  meta?: string;
  group?: string;
  disabled?: boolean;
}

const DEFAULT_OPTIONS: ComboboxOption[] = [
  { value: 'America/Fortaleza', label: 'Fortaleza', meta: 'UTC−03:00', group: 'Americas' },
  { value: 'America/Sao_Paulo', label: 'Sao Paulo', meta: 'UTC−03:00', group: 'Americas' },
  { value: 'America/New_York', label: 'New York', meta: 'UTC−05:00', group: 'Americas' },
  { value: 'UTC', label: 'Coordinated Universal', meta: 'UTC+00:00', group: 'Reference' },
  { value: 'Europe/London', label: 'London', meta: 'UTC+00:00', group: 'Europe' },
  { value: 'Asia/Tokyo', label: 'Tokyo', meta: 'UTC+09:00', group: 'Asia' },
];

/** Searchable monochrome combobox backed by the shared popover surface. */
export function Combobox({
  options = DEFAULT_OPTIONS,
  value,
  defaultValue = 'America/Fortaleza',
  onValueChange,
  label = 'Timezone',
  placeholder = 'Select an option',
  searchPlaceholder = 'Search options',
  emptyText = 'No matching option.',
  disabled = false,
  material = 'solid',
  className,
}: {
  options?: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  material?: SurfaceMaterial;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [internalValue, setInternalValue] = useState(defaultValue);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxId = `jh-combobox-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const activeValue = value !== undefined ? value : internalValue;
  const finish = normalizeSurfaceMaterial(material);
  const matAttr = surfaceMaterialAttr(material);

  const selected = useMemo(
    () => options.find(option => option.value === activeValue),
    [options, activeValue],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(query)
      || option.value.toLowerCase().includes(query)
      || (option.meta?.toLowerCase().includes(query) ?? false)
      || (option.group?.toLowerCase().includes(query) ?? false),
    );
  }, [options, search]);

  const commit = (nextValue: string) => {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
    setSearch('');
    triggerRef.current?.focus();
  };

  return (
    <div
      className={cn('jh-combobox', finish === 'liquid' && 'jh-combobox--liquid', className)}
      data-jh-material={matAttr}
    >
      <span className="jh-combobox__label">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className="jh-combobox__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={`${label}: ${selected?.label ?? placeholder}`}
        onClick={() => {
          if (disabled) return;
          setSearch('');
          setOpen(current => !current);
        }}
      >
        <span className="jh-combobox__value">
          <span className="jh-combobox__value-main">{selected?.label ?? placeholder}</span>
          {selected?.meta ? <span className="jh-combobox__value-meta">{selected.meta}</span> : null}
        </span>
        <ChevronDown className="jh-combobox__chevron" aria-hidden="true" size={14} strokeWidth={1.75} />
      </button>

      <PickerPanel
        open={open}
        triggerRef={triggerRef}
        material={matAttr}
        onClose={() => {
          setOpen(false);
          setSearch('');
        }}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        label={label}
        className="jh-combobox__panel"
        footer={
          <div className="jh-combobox__footer">
            <span>{filtered.length} {filtered.length === 1 ? 'option' : 'options'}</span>
            {selected?.group ? <span>{selected.group}</span> : null}
          </div>
        }
      >
        <div id={listboxId} role="listbox" aria-label={label} className="jh-combobox__list">
          {filtered.length === 0 ? (
            <div className="jh-combobox__empty">{emptyText}</div>
          ) : (
            filtered.map(option => {
              const isSelected = option.value === activeValue;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  disabled={option.disabled}
                  aria-selected={isSelected}
                  className={cn('jh-combobox__option', isSelected && 'is-selected')}
                  onClick={() => {
                    if (!option.disabled) commit(option.value);
                  }}
                >
                  <span className="jh-combobox__option-copy">
                    <span className="jh-combobox__option-label">{option.label}</span>
                    {option.meta ? <span className="jh-combobox__option-meta">{option.meta}</span> : null}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PickerPanel>
    </div>
  );
}

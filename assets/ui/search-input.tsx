import { useId } from 'react';
import { Search, X } from 'lucide-react';

export function SearchInput({ value, onValueChange, label = 'Search', placeholder = 'Search anything…', disabled = false }: {
  value: string; onValueChange: (value: string) => void; label?: string; placeholder?: string; disabled?: boolean;
}) {
  const id = useId();
  return <div className="jh-search-input" data-disabled={disabled || undefined}><Search size={16} aria-hidden="true" /><label htmlFor={id} className="jh-visually-hidden">{label}</label><input id={id} type="search" value={value} onChange={event => onValueChange(event.target.value)} placeholder={placeholder} disabled={disabled} />{value && <button type="button" aria-label="Clear search" disabled={disabled} onClick={() => { onValueChange(''); document.getElementById(id)?.focus(); }}><X size={14} aria-hidden="true" /></button>}</div>;
}

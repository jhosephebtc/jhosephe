import { useId, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { Calendar } from './calendar';
import { Button } from './button';

export function DatePicker({ value, onChange, label = 'Choose a date', disabled = false, name, material = 'solid' }: {
  value?: Date; onChange: (value: Date | undefined) => void; label?: string; disabled?: boolean; name?: string; material?: 'solid' | 'liquid-glass' | 'liquid';
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const formatted = value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(value) : 'Pick a date';
  const dateValue = value ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}` : '';
  return <div className="jh-date-picker"><span id={id} className="jh-field-label">{label}</span><Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger asChild><Button disabled={disabled} aria-labelledby={`${id} ${id}-value`} className="jh-date-picker__trigger"><CalendarDays size={16} aria-hidden="true" /><span id={`${id}-value`}>{formatted}</span><ChevronDown size={14} aria-hidden="true" /></Button></Popover.Trigger>
    <Popover.Portal><Popover.Content data-jh-material={material} className="jh-date-popover" align="start" sideOffset={8} collisionPadding={16} aria-label="Choose a date"><Calendar mode="single" selected={value} defaultMonth={value} autoFocus onSelect={date => { onChange(date); setOpen(false); }} /><button className="jh-date-picker__clear" onClick={() => { onChange(undefined); setOpen(false); }}>Clear date</button></Popover.Content></Popover.Portal>
  </Popover.Root>{name && <input type="hidden" name={name} value={dateValue} />}</div>;
}

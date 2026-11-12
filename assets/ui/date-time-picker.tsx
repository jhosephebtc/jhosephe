import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CalendarDays, Check, ChevronDown, Clock3 } from 'lucide-react';
import { Calendar } from './calendar';
import { Button } from './button';

const timeSlots = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'];
const sameDay = (a?: Date, b?: Date) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function DateTimePicker({ value, onChange, label = 'Schedule a time', disabled = false }: {
  value?: Date; onChange: (value: Date | undefined) => void; label?: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(value);
  const [draftTime, setDraftTime] = useState(value ? value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : timeSlots[2]);
  const formatted = value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(value) : 'Choose a date and time';
  const commit = () => {
    if (!draftDate) return;
    const match = draftTime.match(/(\d+):(\d+)\s(AM|PM)/i);
    if (!match) return;
    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hour += 12;
    const next = new Date(draftDate);
    next.setHours(hour, Number(match[2]), 0, 0);
    onChange(next); setOpen(false);
  };
  return <div className="jh-date-time-picker"><span className="jh-field-label">{label}</span><Popover.Root open={open} onOpenChange={next => { if (next) { setDraftDate(value); setDraftTime(value ? value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : timeSlots[2]); } setOpen(next); }}>
    <Popover.Trigger asChild><Button variant="secondary" disabled={disabled} className="jh-date-time-picker__trigger"><CalendarDays size={15} aria-hidden="true" /><span>{formatted}</span><ChevronDown size={14} aria-hidden="true" /></Button></Popover.Trigger>
    <Popover.Portal><Popover.Content className="jh-date-time-popover" align="start" sideOffset={8} collisionPadding={12} aria-label={label}>
      <div className="jh-date-time-popover__heading"><div><strong>Choose a moment</strong><span>Pick a date and an available time.</span></div><span className="jh-date-time-zone">Local time</span></div>
      <div className="jh-date-time-popover__body"><Calendar mode="single" selected={draftDate} defaultMonth={draftDate} onSelect={setDraftDate} /><section className="jh-date-time-slots" aria-label="Available times"><h3><Clock3 size={14} aria-hidden="true" />Available times</h3><div>{timeSlots.map(time => <button key={time} type="button" aria-pressed={draftTime === time} onClick={() => setDraftTime(time)}>{time}</button>)}</div></section></div>
      <div className="jh-date-time-popover__footer"><button type="button" onClick={() => { onChange(undefined); setOpen(false); }}>Clear</button><Button size="small" disabled={!draftDate} onClick={commit}>Confirm <Check size={14} aria-hidden="true" /></Button></div>
    </Popover.Content></Popover.Portal>
  </Popover.Root>{value && <span className="jh-date-time-picker__summary" aria-live="polite">{sameDay(value, new Date()) ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(value)}</span>}</div>;
}

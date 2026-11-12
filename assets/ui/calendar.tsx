import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from './utils';

/** Uses US English and Sunday-first weeks by default; all DayPicker props remain available. */
export function Calendar({ className, classNames, labels, ...props }: DayPickerProps) {
  return <DayPicker showOutsideDays fixedWeeks navLayout="after" {...props} className={cn('jh-calendar', className)} classNames={{
    months: 'jh-calendar__months', month: 'jh-calendar__month', month_caption: 'jh-calendar__caption', caption_label: 'jh-calendar__caption-label',
    nav: 'jh-calendar__nav', button_previous: 'jh-calendar__previous', button_next: 'jh-calendar__next', chevron: 'jh-calendar__chevron',
    month_grid: 'jh-calendar__grid', weekdays: 'jh-calendar__weekdays', weekday: 'jh-calendar__weekday', week: 'jh-calendar__week',
    day: 'jh-calendar__day', day_button: 'jh-calendar__day-button', selected: 'jh-calendar__selected', today: 'jh-calendar__today',
    outside: 'jh-calendar__outside', disabled: 'jh-calendar__disabled', hidden: 'jh-calendar__hidden', footer: 'jh-calendar__footer', ...classNames,
  }} labels={{ ...labels, labelDayButton: (date, modifiers) => {
    const visibleDay = date.getDate();
    const fullDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    return `${visibleDay}, ${fullDate}${modifiers.today ? ', today' : ''}${modifiers.selected ? ', selected' : ''}`;
  }}} />;
}

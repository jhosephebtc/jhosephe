import { Dial } from './dial';

export interface DetentOption { value: string; label: string }

/** A rotary selector with discrete stops and a tactile dial face. */
export function DetentDial({ value, options, onValueChange, label = 'Rotary selector', disabled = false }: {
  value: number; options: DetentOption[]; onValueChange: (index: number) => void; label?: string; disabled?: boolean;
}) {
  const safeOptions = options.length ? options : [{ value: 'default', label: 'Default' }];
  const index = Math.max(0, Math.min(safeOptions.length - 1, Math.round(value)));
  return <section className="jh-detent-dial" aria-label={label}>
    <div className="jh-detent-dial__heading"><span>{label}</span><output>{safeOptions[index].label}</output></div>
    <Dial label={label} value={index} onChange={onValueChange} min={0} max={safeOptions.length - 1} step={1} ticks={safeOptions.length} detent disabled={disabled} />
    <div className="jh-detent-dial__stops" aria-hidden="true">{safeOptions.map((option, stop) => <span key={option.value} data-current={stop === index || undefined}>{option.label}</span>)}</div>
  </section>;
}

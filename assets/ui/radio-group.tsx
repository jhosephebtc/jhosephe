import { useId } from 'react';

export interface RadioOption { value: string; label: string; description?: string }

export function RadioGroup({ label, name, value, onValueChange, options, orientation = 'vertical' }: {
  label: string; name?: string; value: string; onValueChange: (value: string) => void; options: RadioOption[]; orientation?: 'vertical' | 'horizontal';
}) {
  const id = useId();
  const groupName = name ?? id;
  return <fieldset className="jh-radio-group" aria-label={label} data-orientation={orientation}>
    <legend className="jh-radio-group__legend">{label}</legend>
    <div className="jh-radio-group__options">{options.map(option => <label className="jh-radio-option" key={option.value}>
      <input type="radio" name={groupName} value={option.value} checked={value === option.value} onChange={() => onValueChange(option.value)} />
      <span className="jh-radio-option__mark" aria-hidden="true" />
      <span className="jh-radio-option__copy"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
    </label>)}</div>
  </fieldset>;
}

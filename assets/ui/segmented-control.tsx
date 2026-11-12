import { useId } from 'react';

export interface SegmentOption { value: string; label: string }

export function SegmentedControl({ label, value, onValueChange, options, name }: {
  label: string; value: string; onValueChange: (value: string) => void; options: SegmentOption[]; name?: string;
}) {
  const id = useId();
  return <div className="jh-segmented-field">
    <span className="jh-segmented__label" id={`${id}-label`}>{label}</span>
    <fieldset className="jh-segmented" aria-labelledby={`${id}-label`}>
      <legend className="jh-visually-hidden">{label}</legend>
      {options.map(option => <label className="jh-segmented__option" key={option.value}>
        <input type="radio" name={name ?? id} value={option.value} checked={value === option.value} onChange={() => onValueChange(option.value)} />
        <span>{option.label}</span>
      </label>)}
    </fieldset>
  </div>;
}

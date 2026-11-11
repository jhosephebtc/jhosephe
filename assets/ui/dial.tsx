import type { CSSProperties } from 'react';

export function Dial({ value, onChange, label, min = 0, max = 100 }: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
}) {
  const fraction = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const style = { '--dial-turn': `${-135 + fraction * 270}deg` } as CSSProperties;
  return (
    <span className="jh-dial" style={style}>
      <span className="jh-dial__bed" aria-hidden="true"><span className="jh-dial__knob"><span className="jh-dial__mark" /></span></span>
      <input aria-label={label} type="range" min={min} max={max} value={value} onChange={event => onChange(event.currentTarget.valueAsNumber)} />
    </span>
  );
}

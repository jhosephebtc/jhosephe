import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';

const hues = [
  ['Red', 20], ['Vermilion', 40], ['Orange', 60], ['Amber', 82],
  ['Yellow', 103], ['Lime', 126], ['Green', 150], ['Teal', 178],
  ['Cyan', 202], ['Blue', 232], ['Indigo', 262], ['Violet', 292],
  ['Magenta', 322], ['Rose', 346],
] as const;
const tones = [
  { label: 'Deep', lightness: 42, chroma: .17 },
  { label: 'Mid', lightness: 52, chroma: .2 },
  { label: 'Clear', lightness: 62, chroma: .18 },
  { label: 'Light', lightness: 74, chroma: .13 },
  { label: 'Pastel', lightness: 88, chroma: .075 },
  { label: 'Pale', lightness: 94, chroma: .045 },
] as const;
const colors = [
  ...tones.flatMap(tone => hues.map(([name, hue]) => ({
    name: `${name}, ${tone.label.toLowerCase()}`,
    value: `oklch(${tone.lightness}% ${tone.chroma} ${hue})`,
  }))),
  ...[100, 96, 88, 78, 66, 52, 36, 22].map(lightness => ({ name: lightness === 100 ? 'Pure white' : `Neutral, ${lightness}%`, value: `oklch(${lightness}% 0 0)` })),
];
const columns = hues.length;

/** A contextual OKLCH palette arranged as a tactile honeycomb of paint swatches. */
export function OklchPalette({ value, onValueChange, label = 'Choose a color', material = 'solid' }: {
  value: string; onValueChange: (value: string) => void; label?: string; material?: 'solid' | 'liquid-glass' | 'liquid';
}) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(Math.max(0, colors.findIndex(color => color.value === value)));
  const swatches = useRef<(HTMLButtonElement | null)[]>([]);
  const moveFocus = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    let next = index;
    if (event.key === 'ArrowRight') next = row * columns + Math.min(columns - 1, column + 1);
    else if (event.key === 'ArrowLeft') next = row * columns + Math.max(0, column - 1);
    else if (event.key === 'ArrowDown') next = Math.min(colors.length - 1, index + columns);
    else if (event.key === 'ArrowUp') next = Math.max(0, index - columns);
    else if (event.key === 'Home') next = row * columns;
    else if (event.key === 'End') next = Math.min(colors.length - 1, row * columns + columns - 1);
    else return;
    event.preventDefault();
    setFocusIndex(next);
    swatches.current[next]?.focus();
  };

  return <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger className="jh-oklch-trigger" data-jh-material={material} aria-label={`${label}: ${value}`}>
      <span className="jh-oklch-trigger__swatch" style={{ background: value }} aria-hidden="true" />
      <ChevronDown size={13} aria-hidden="true" />
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content className="jh-oklch-palette" data-jh-material={material} side="bottom" align="end" sideOffset={8} collisionPadding={12} aria-label={label}>
        <div className="jh-oklch-palette__heading"><div><strong>{label}</strong><span>Spectrum in OKLCH</span></div><output>{value}</output></div>
        <div className="jh-oklch-palette__grid" role="grid" aria-label="Color spectrum" style={{ '--jh-palette-columns': columns } as CSSProperties}>
          {colors.map((color, index) => <button
            key={color.name}
            ref={element => { swatches.current[index] = element; }}
            className="jh-oklch-palette__swatch"
            type="button"
            role="gridcell"
            tabIndex={index === focusIndex ? 0 : -1}
            aria-label={color.name}
            aria-selected={value === color.value}
            title={color.name}
            style={{ background: color.value }}
            onFocus={() => setFocusIndex(index)}
            onKeyDown={event => moveFocus(index, event)}
            onClick={() => { onValueChange(color.value); setFocusIndex(index); setOpen(false); }}
          />)}
        </div>
        <div className="jh-oklch-palette__footer"><span>Selected color</span><span className="jh-oklch-palette__preview" style={{ background: value }} aria-hidden="true" /></div>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>;
}

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

export interface SegmentOption { value: string; label: string }

/** Compact radio navigation with a sliding raised thumb on a Soft Input track. */
export function SegmentedControl({ label, value, onValueChange, options, name }: {
  label: string; value: string; onValueChange: (value: string) => void; options: SegmentOption[]; name?: string;
}) {
  const id = useId();
  const track = useRef<HTMLFieldSetElement>(null);
  const optionRefs = useRef<(HTMLLabelElement | null)[]>([]);
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false });

  const measure = () => {
    const root = track.current;
    const index = Math.max(0, options.findIndex(option => option.value === value));
    const el = optionRefs.current[index];
    if (!root || !el) return;
    const rootBox = root.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    setThumb({
      x: box.left - rootBox.left,
      w: box.width,
      ready: true,
    });
  };

  useLayoutEffect(() => { measure(); }, [value, options]);
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const onResize = () => measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    observer?.observe(root);
    window.addEventListener('resize', onResize);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [value, options]);

  return (
    <div className="jh-segmented-field">
      <span className="jh-segmented__label" id={`${id}-label`}>{label}</span>
      <fieldset ref={track} className="jh-segmented" aria-labelledby={`${id}-label`}>
        <legend className="jh-visually-hidden">{label}</legend>
        <span
          className="jh-segmented__thumb"
          aria-hidden="true"
          data-ready={thumb.ready || undefined}
          style={{
            width: `${thumb.w}px`,
            transform: `translateX(${thumb.x}px)`,
          }}
        />
        {options.map((option, index) => (
          <label
            className="jh-segmented__option"
            key={option.value}
            ref={node => { optionRefs.current[index] = node; }}
          >
            <input
              type="radio"
              name={name ?? id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onValueChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

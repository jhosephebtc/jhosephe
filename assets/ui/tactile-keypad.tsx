import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from './utils';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export type TactileKeypadLayout = 'keyboard' | 'sequencer' | 'command';

export interface TactileKeypadProps {
  label?: string;
  layout?: TactileKeypadLayout;
  activeSteps?: number[];
  defaultActiveSteps?: number[];
  onActiveStepsChange?: (steps: number[]) => void;
  onKeyTrigger?: (keyId: string, active: boolean) => void;
  accentColor?: string;
  material?: SurfaceMaterial;
  className?: string;
  style?: CSSProperties;
}

interface KeypadCell {
  id: string;
  index: number;
  label: string;
  glyph?: ReactNode;
  shape: 'dish' | 'square' | 'circle';
  tone: 'surface' | 'contrast';
  led: 'corner' | 'center' | 'crimson' | 'none';
  kind: 'toggle' | 'momentary' | 'play';
}

function StepIcon({ kind }: { kind: 'rec' | 'play' | 'minus' | 'plus' | 'bar' | 'rnd' | 'ramp-up' | 'ramp-down' | 'shift' | 'arp' | 'dot4' | 'next' }) {
  switch (kind) {
    case 'rec':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor" /></svg>;
    case 'play':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="6,4.6 12,8 6,11.4" fill="currentColor" /></svg>;
    case 'minus':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><line x1="4.5" y1="8" x2="11.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
    case 'plus':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 4.5v7M4.5 8h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
    case 'ramp-up':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 11.5h2.5v-2.2H9V7h2.5V4.8H13" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'ramp-down':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.8h2v2.2h2.5v2.3H10v2.2h3" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'dot4':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5.2" cy="8" r="1" fill="currentColor" /><circle cx="8" cy="8" r="1" fill="currentColor" /><circle cx="10.8" cy="8" r="1" fill="currentColor" /></svg>;
    case 'next':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8h6.5M8.8 5.6L11.2 8 8.8 10.4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'arp':
      return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 11c1.8 0 2.5-6 4-6s2.2 6 4 6" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /></svg>;
    case 'bar':
      return <span>bar</span>;
    case 'rnd':
      return <span>rnd</span>;
    case 'shift':
      return <span>shift</span>;
  }
}

const KEYBOARD_CELLS: KeypadCell[] = [
  { id: 'rec', index: 0, label: 'Record', glyph: <StepIcon kind="rec" />, shape: 'square', tone: 'surface', led: 'crimson', kind: 'toggle' },
  { id: 'play', index: 1, label: 'Play', glyph: <StepIcon kind="play" />, shape: 'square', tone: 'surface', led: 'corner', kind: 'play' },
  { id: 'cs', index: 2, label: 'C sharp', glyph: '1', shape: 'dish', tone: 'surface', led: 'corner', kind: 'toggle' },
  { id: 'ds', index: 3, label: 'D sharp', glyph: '2', shape: 'dish', tone: 'surface', led: 'corner', kind: 'toggle' },
  { id: 'fs', index: 4, label: 'F sharp', glyph: '3', shape: 'dish', tone: 'contrast', led: 'corner', kind: 'toggle' },
  { id: 'gs', index: 5, label: 'G sharp', glyph: '4', shape: 'dish', tone: 'contrast', led: 'corner', kind: 'toggle' },
  { id: 'as', index: 6, label: 'A sharp', glyph: '5', shape: 'dish', tone: 'contrast', led: 'corner', kind: 'toggle' },
  { id: 'bar', index: 7, label: 'Bar select', glyph: <StepIcon kind="bar" />, shape: 'square', tone: 'surface', led: 'corner', kind: 'toggle' },
  { id: 'k-f', index: 8, label: 'Step F', glyph: 'F', shape: 'dish', tone: 'surface', led: 'center', kind: 'toggle' },
  { id: 'k-g', index: 9, label: 'Step G', glyph: 'G', shape: 'dish', tone: 'surface', led: 'center', kind: 'toggle' },
  { id: 'k-a', index: 10, label: 'Step A', glyph: 'A', shape: 'dish', tone: 'surface', led: 'center', kind: 'toggle' },
  { id: 'k-b', index: 11, label: 'Step B', glyph: 'B', shape: 'dish', tone: 'surface', led: 'center', kind: 'toggle' },
  { id: 'k-c', index: 12, label: 'Step C', glyph: 'C', shape: 'dish', tone: 'surface', led: 'center', kind: 'toggle' },
  { id: 'k-d', index: 13, label: 'Step D', glyph: 'D', shape: 'dish', tone: 'surface', led: 'center', kind: 'toggle' },
  { id: 'k-e', index: 14, label: 'Step E', glyph: 'E', shape: 'dish', tone: 'contrast', led: 'center', kind: 'toggle' },
  { id: 'k-f2', index: 15, label: 'Step F2', glyph: 'F+', shape: 'dish', tone: 'contrast', led: 'center', kind: 'toggle' },
];

const SEQUENCER_CELLS: KeypadCell[] = Array.from({ length: 16 }, (_, index) => ({
  id: `seq-${index + 1}`,
  index,
  label: `Step ${index + 1}`,
  glyph: String(index + 1).padStart(2, '0'),
  shape: 'dish',
  tone: Math.floor(index / 4) % 2 === 1 ? 'contrast' : 'surface',
  led: index === 0 ? 'crimson' : 'corner',
  kind: 'toggle',
}));

const COMMAND_CELLS: KeypadCell[] = [
  { id: 'cmd-minus', index: 0, label: 'Octave down', glyph: <StepIcon kind="minus" />, shape: 'circle', tone: 'surface', led: 'none', kind: 'momentary' },
  { id: 'cmd-plus', index: 1, label: 'Octave up', glyph: <StepIcon kind="plus" />, shape: 'circle', tone: 'surface', led: 'none', kind: 'momentary' },
  { id: 'cmd-shift', index: 2, label: 'Shift', glyph: <StepIcon kind="shift" />, shape: 'square', tone: 'surface', led: 'corner', kind: 'toggle' },
  { id: 'cmd-dots', index: 3, label: 'Pattern menu', glyph: <StepIcon kind="dot4" />, shape: 'dish', tone: 'contrast', led: 'center', kind: 'toggle' },
  { id: 'cmd-up', index: 4, label: 'Ramp up', glyph: <StepIcon kind="ramp-up" />, shape: 'circle', tone: 'surface', led: 'corner', kind: 'toggle' },
  { id: 'cmd-dn', index: 5, label: 'Ramp down', glyph: <StepIcon kind="ramp-down" />, shape: 'circle', tone: 'surface', led: 'corner', kind: 'toggle' },
  { id: 'cmd-rnd', index: 6, label: 'Randomize', glyph: <StepIcon kind="rnd" />, shape: 'dish', tone: 'surface', led: 'center', kind: 'toggle' },
  { id: 'cmd-arp', index: 7, label: 'Arpeggio curve', glyph: <StepIcon kind="arp" />, shape: 'circle', tone: 'surface', led: 'corner', kind: 'toggle' },
  { id: 'cmd-rec', index: 8, label: 'Record arm', glyph: <StepIcon kind="rec" />, shape: 'square', tone: 'surface', led: 'crimson', kind: 'toggle' },
  { id: 'cmd-play', index: 9, label: 'Transport play', glyph: <StepIcon kind="play" />, shape: 'square', tone: 'surface', led: 'corner', kind: 'play' },
  { id: 'cmd-bar', index: 10, label: 'Measure', glyph: <StepIcon kind="bar" />, shape: 'dish', tone: 'contrast', led: 'center', kind: 'toggle' },
  { id: 'cmd-next', index: 11, label: 'Next bank', glyph: <StepIcon kind="next" />, shape: 'circle', tone: 'surface', led: 'corner', kind: 'momentary' },
];

export function TactileKeypad({
  label = 'Tactile keypad',
  layout = 'keyboard',
  activeSteps,
  defaultActiveSteps = [2, 8, 10, 13],
  onActiveStepsChange,
  onKeyTrigger,
  accentColor,
  material,
  className,
  style,
}: TactileKeypadProps) {
  const [internalSteps, setInternalSteps] = useState<number[]>(defaultActiveSteps);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState<number | null>(null);

  const selected = activeSteps ?? internalSteps;
  const cells = layout === 'sequencer' ? SEQUENCER_CELLS : layout === 'command' ? COMMAND_CELLS : KEYBOARD_CELLS;

  useEffect(() => {
    if (!playing) {
      setPlayhead(null);
      return;
    }
    const stepIndices = layout === 'keyboard' ? [8, 9, 10, 11, 12, 13, 14, 15] : cells.map(c => c.index);
    let cursor = 0;
    setPlayhead(stepIndices[0]);
    const id = window.setInterval(() => {
      cursor = (cursor + 1) % stepIndices.length;
      setPlayhead(stepIndices[cursor]);
    }, 240);
    return () => window.clearInterval(id);
  }, [playing, layout, cells.length]);

  const toggleIndex = useCallback(
    (cell: KeypadCell) => {
      if (cell.kind === 'play') {
        const nextPlaying = !playing;
        setPlaying(nextPlaying);
        onKeyTrigger?.(cell.id, nextPlaying);
        return;
      }
      if (cell.kind === 'momentary') {
        onKeyTrigger?.(cell.id, true);
        return;
      }
      const isSelected = selected.includes(cell.index);
      const next = isSelected ? selected.filter(i => i !== cell.index) : [...selected, cell.index];
      if (!activeSteps) setInternalSteps(next);
      onActiveStepsChange?.(next);
      onKeyTrigger?.(cell.id, !isSelected);
    },
    [activeSteps, onActiveStepsChange, onKeyTrigger, playing, selected],
  );

  const mergedStyle = accentColor ? { ...style, ['--jh-tactile-led-color' as string]: accentColor } : style;

  return (
    <section
      className={cn('jh-tactile-keypad', className)}
      data-layout={layout}
      data-jh-material={material ? surfaceMaterialAttr(material) : undefined}
      style={mergedStyle}
      aria-label={label}
    >
      <div className="jh-tactile-keypad__header">
        <span className="jh-tactile-keypad__title">{label}</span>
        <span className="jh-tactile-keypad__readout" aria-live="polite">
          {playing && playhead !== null
            ? `Step ${String((playhead % 16) + 1).padStart(2, '0')}`
            : `${selected.length} armed`}
        </span>
      </div>
      <div className="jh-tactile-keypad__grid" role="group" aria-label={label}>
        {cells.map(cell => {
          const isArmed = cell.kind === 'play' ? playing : selected.includes(cell.index);
          const isScanHit = playhead === cell.index;
          const isPressed = pressedId === cell.id;
          return (
            <button
              key={cell.id}
              type="button"
              className="jh-tactile-pad"
              data-shape={cell.shape}
              data-tone={cell.tone}
              data-led={cell.led}
              data-pressed={isPressed ? 'true' : undefined}
              data-playhead={isScanHit ? 'true' : undefined}
              aria-label={cell.label}
              aria-pressed={cell.kind === 'momentary' ? undefined : isArmed}
              onPointerDown={() => setPressedId(cell.id)}
              onPointerUp={() => setPressedId(null)}
              onPointerCancel={() => setPressedId(null)}
              onPointerLeave={() => {
                if (pressedId === cell.id) setPressedId(null);
              }}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') setPressedId(cell.id);
              }}
              onKeyUp={event => {
                if (event.key === 'Enter' || event.key === ' ') setPressedId(null);
              }}
              onBlur={() => {
                if (pressedId === cell.id) setPressedId(null);
              }}
              onClick={() => toggleIndex(cell)}
            >
              <span className="jh-tactile-pad__cap">
                {cell.led !== 'none' && <span className="jh-tactile-pad__pin" aria-hidden="true" />}
                <span className="jh-tactile-pad__glyph">{cell.glyph}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './button';
import { Slider } from './controls';

export type SpectrumColorModel = 'oklch' | 'rgb' | 'hsl';
export type SpectrumPopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type SpectrumLibraryId = 'pastel-neutrals' | 'pastels' | 'neutrals' | 'vibrants';

export interface SpectrumPreset {
  name: string;
  hue: number;
  saturation: number;
  lightness: number;
}

export interface SpectrumLibrary {
  id: SpectrumLibraryId | string;
  label: string;
  description: string;
  columns?: number;
  colors: SpectrumPreset[];
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function rgbToHsl(r255: number, g255: number, b255: number): [number, number, number] {
  const r = clamp(r255, 0, 255) / 255;
  const g = clamp(g255, 0, 255) / 255;
  const b = clamp(b255, 0, 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return [Math.round(h), Math.round(s * 100), clamp(Math.round(l * 100), 8, 92)];
}

function hslToHex(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function hexToHsl(raw: string): [number, number, number] | null {
  const cleaned = raw.trim().replace(/^#/, '');
  const full = cleaned.length === 3
    ? cleaned.split('').map(ch => ch + ch).join('')
    : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return rgbToHsl(
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  );
}

const srgbToLinear = (v: number) => {
  const c = clamp(v, 0, 255) / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const linearToSrgb = (c: number) => {
  const clipped = clamp(c, 0, 1);
  const s = clipped <= 0.0031308 ? 12.92 * clipped : 1.055 * (clipped ** (1 / 2.4)) - 0.055;
  return clamp(Math.round(s * 255), 0, 255);
};

function rgbToOklch(r255: number, g255: number, b255: number): [number, number, number] {
  const r = srgbToLinear(r255);
  const g = srgbToLinear(g255);
  const b = srgbToLinear(b255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const okC = Math.sqrt(okA * okA + okB * okB);
  let okH = (Math.atan2(okB, okA) * 180) / Math.PI;
  if (okH < 0) okH += 360;

  return [
    Math.round(clamp(okL * 100, 0, 100) * 10) / 10,
    Math.round(clamp(okC, 0, 0.37) * 1000) / 1000,
    Math.round(okH) % 360,
  ];
}

function oklchToRgb(lPct: number, cVal: number, hDeg: number): [number, number, number] {
  const L = clamp(lPct, 0, 100) / 100;
  const C = clamp(cVal, 0, 0.4);
  const rad = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [linearToSrgb(rLin), linearToSrgb(gLin), linearToSrgb(bLin)];
}

function oklchPreset(name: string, lPct: number, cVal: number, hDeg: number): SpectrumPreset {
  const [r, g, b] = oklchToRgb(lPct, cVal, hDeg);
  const [hue, saturation, lightness] = rgbToHsl(r, g, b);
  return { name, hue, saturation, lightness };
}

const OKLCH_HUES = [
  ['Red', 20], ['Coral', 38], ['Amber', 62], ['Ochre', 84],
  ['Chartreuse', 110], ['Green', 142], ['Teal', 174], ['Cyan', 202],
  ['Blue', 232], ['Indigo', 262], ['Violet', 294], ['Rose', 340],
] as const;

const NEUTRAL_BASES = [
  ['Pure Ash', 0, 0], ['Warm Sand', 55, 0.018], ['Linen', 75, 0.014], ['Olive Stone', 115, 0.012],
  ['Moss Mist', 155, 0.012], ['Sea Fog', 192, 0.014], ['Glacier', 216, 0.016], ['Cool Slate', 238, 0.018],
  ['Dusk Blue', 256, 0.016], ['Ink Gray', 278, 0.012], ['Mauve Stone', 318, 0.014], ['Rose Clay', 18, 0.016],
] as const;

// 12 columns × 6 honeycomb rows = 72 swatches per library, starting with Pastels & Neutrals first.
const DEFAULT_LIBRARIES: SpectrumLibrary[] = [
  {
    id: 'pastel-neutrals',
    label: 'Pastels & Neutrals',
    description: 'Mineral neutrals and soft powdery pastels',
    columns: 12,
    colors: [
      ...[
        { name: 'Porcelain', l: 93, c: 0.008 },
        { name: 'Mist', l: 82, c: 0.012 },
      ].flatMap(tier =>
        NEUTRAL_BASES.map(([name, h, cScale]) =>
          oklchPreset(`${name} · ${tier.name}`, tier.l, cScale === 0 ? 0 : tier.c, h),
        ),
      ),
      ...[
        { label: 'Pale', l: 91, c: 0.042 },
        { label: 'Soft', l: 86, c: 0.062 },
        { label: 'Pastel', l: 80, c: 0.072 },
      ].flatMap(tier =>
        OKLCH_HUES.map(([name, h]) => oklchPreset(`${name} · ${tier.label}`, tier.l, tier.c, h)),
      ),
      ...[90, 82, 72, 62, 52, 42, 34, 26, 20, 16, 12, 9].map((l, idx) => ({
        name: `Neutral · ${92 - idx * 7}%`,
        hue: 220,
        saturation: idx > 2 && idx < 9 ? 6 : 0,
        lightness: clamp(l, 8, 92),
      })),
    ],
  },
  {
    id: 'pastels',
    label: 'Pastels',
    description: 'Luminous OKLCH pastel spectrum',
    columns: 12,
    colors: [
      { label: 'Veil', l: 93, c: 0.035 },
      { label: 'Whisper', l: 89, c: 0.052 },
      { label: 'Pastel', l: 85, c: 0.068 },
      { label: 'Bloom', l: 80, c: 0.082 },
      { label: 'Mist', l: 75, c: 0.092 },
      { label: 'Velvet', l: 70, c: 0.088 },
    ].flatMap(tier =>
      OKLCH_HUES.map(([name, h]) => oklchPreset(`${name} · ${tier.label}`, tier.l, tier.c, h)),
    ),
  },
  {
    id: 'neutrals',
    label: 'Neutrals',
    description: 'Warm, cool, and mineral neutral tones',
    columns: 12,
    colors: [
      { label: 'Alabaster', l: 94, mul: 0.55 },
      { label: 'Limestone', l: 84, mul: 0.85 },
      { label: 'Pebble', l: 72, mul: 1.0 },
      { label: 'Basalt', l: 58, mul: 1.05 },
      { label: 'Graphite', l: 42, mul: 0.9 },
      { label: 'Obsidian', l: 26, mul: 0.7 },
    ].flatMap(tier =>
      NEUTRAL_BASES.map(([name, h, c]) => oklchPreset(`${name} · ${tier.label}`, tier.l, c * tier.mul, h)),
    ),
  },
  {
    id: 'vibrants',
    label: 'Vibrants',
    description: 'High-chroma OKLCH chromatic spectrum',
    columns: 12,
    colors: [
      { label: 'Luminous', l: 82, c: 0.12 },
      { label: 'Clear', l: 72, c: 0.16 },
      { label: 'Vivid', l: 62, c: 0.2 },
      { label: 'Rich', l: 52, c: 0.21 },
      { label: 'Deep', l: 42, c: 0.18 },
      { label: 'Nocturne', l: 32, c: 0.14 },
    ].flatMap(tier =>
      OKLCH_HUES.map(([name, h]) => oklchPreset(`${name} · ${tier.label}`, tier.l, tier.c, h)),
    ),
  },
];

function ChannelInput({
  label,
  value,
  display,
  min,
  max,
  step,
  onCommit,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onCommit: (next: number) => void;
}) {
  const [draft, setDraft] = useState(display);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(display);
  }, [display, focused]);

  const applyDelta = (direction: 1 | -1, large = false) => {
    const delta = step * (large ? 5 : 1) * direction;
    const raw = clamp(value + delta, min, max);
    const decimals = step < 0.01 ? 3 : step < 1 ? 1 : 0;
    onCommit(Number(raw.toFixed(decimals)));
  };

  return (
    <div className="jh-spectrum__channel">
      <label>
        <span>{label}</span>
        <input
          type="text"
          inputMode="decimal"
          value={focused ? draft : display}
          aria-label={`${label} channel`}
          onFocus={() => {
            setDraft(display);
            setFocused(true);
          }}
          onChange={event => {
            const nextDraft = event.target.value;
            setDraft(nextDraft);
            const parsed = Number(nextDraft);
            if (nextDraft.trim() !== '' && Number.isFinite(parsed)) {
              onCommit(clamp(parsed, min, max));
            }
          }}
          onKeyDown={event => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              applyDelta(1, event.shiftKey);
            } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              applyDelta(-1, event.shiftKey);
            }
          }}
          onBlur={() => {
            setFocused(false);
            setDraft(display);
          }}
        />
      </label>
      <div className="jh-spectrum__steppers">
        <button type="button" aria-label={`Increase ${label}`} onClick={() => applyDelta(1)}>
          <ChevronUp size={9} strokeWidth={2} aria-hidden="true" />
        </button>
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => applyDelta(-1)}>
          <ChevronDown size={9} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function SpectrumControl({
  hue,
  saturation,
  lightness,
  onHueChange,
  onSaturationChange,
  onLightnessChange,
  presets,
  libraries = DEFAULT_LIBRARIES,
  defaultLibrary,
  defaultModel = 'oklch',
  mode = 'inline',
  material = 'solid',
  side = 'bottom',
  align = 'center',
  sideOffset = 10,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  triggerLabel = 'Spectrum Control',
  showPicker = true,
  label = 'Color controls',
}: {
  hue: number;
  saturation: number;
  lightness: number;
  onHueChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onLightnessChange: (value: number) => void;
  presets?: SpectrumPreset[];
  libraries?: SpectrumLibrary[];
  defaultLibrary?: SpectrumLibraryId | string;
  defaultModel?: SpectrumColorModel;
  mode?: 'inline' | 'popover';
  material?: 'solid' | 'liquid-glass' | 'liquid';
  side?: SpectrumPopoverSide;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  showPicker?: boolean;
  label?: string;
}) {
  const id = useId();
  const padRef = useRef<HTMLDivElement>(null);
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [model, setModel] = useState<SpectrumColorModel>(defaultModel);
  const [copied, setCopied] = useState(false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolvedLibraries = useMemo<SpectrumLibrary[]>(() => {
    if (presets && presets.length > 0) {
      return [{ id: 'custom', label: 'Custom', description: 'Custom swatch set', columns: 12, colors: presets }, ...libraries];
    }
    return libraries;
  }, [presets, libraries]);

  const [activeLibraryId, setActiveLibraryId] = useState<string>(defaultLibrary ?? resolvedLibraries[0]?.id ?? 'pastel-neutrals');
  const activeLibrary = resolvedLibraries.find(lib => lib.id === activeLibraryId) ?? resolvedLibraries[0];
  const columns = activeLibrary?.columns ?? 12;
  const activeColors = activeLibrary?.colors ?? [];
  const [focusIndex, setFocusIndex] = useState(0);

  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const hex = hslToHex(hue, saturation, lightness);
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  const [okL, okC, okH] = rgbToOklch(r, g, b);
  const [hexDraft, setHexDraft] = useState(hex);

  useEffect(() => {
    setHexDraft(hex);
  }, [hex]);

  const hslString = `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%)`;
  const rgbString = `rgb(${r}, ${g}, ${b})`;
  const oklchString = `oklch(${okL.toFixed(1)}% ${okC.toFixed(3)} ${okH})`;
  const activeString = model === 'oklch' ? oklchString : model === 'rgb' ? rgbString : hslString;

  const midL = Math.max(46, Math.min(76, lightness));
  const satTrack = `linear-gradient(90deg, hsl(${hue} 0% ${midL}%), hsl(${hue} 45% ${midL}%), hsl(${hue} 100% ${midL}%))`;
  const lightTrack = `linear-gradient(90deg, hsl(${hue} ${Math.min(26, saturation)}% 20%), hsl(${hue} ${saturation}% 52%), hsl(${hue} ${Math.min(22, saturation)}% 90%))`;

  // Exact HSL <-> HSV projection so the reticle always rests on its true color pixel.
  const sHslNorm = clamp(saturation, 0, 100) / 100;
  const lHslNorm = clamp(lightness, 0, 100) / 100;
  const vHsv = lHslNorm + sHslNorm * Math.min(lHslNorm, 1 - lHslNorm);
  const sHsv = vHsv === 0 ? 0 : 2 * (1 - lHslNorm / vHsv);
  const reticleX = clamp(sHsv * 100, 0, 100);
  const reticleY = clamp((1 - vHsv) * 100, 0, 100);

  const applyHsl = (nextH: number, nextS: number, nextL: number) => {
    onHueChange(clamp(Math.round(nextH), 0, 360));
    onSaturationChange(clamp(Math.round(nextS), 0, 100));
    onLightnessChange(clamp(Math.round(nextL), 8, 92));
  };

  const applyRgbChannel = (index: 0 | 1 | 2, nextVal: number) => {
    const next: [number, number, number] = [r, g, b];
    next[index] = clamp(Math.round(nextVal), 0, 255);
    const [nh, ns, nl] = rgbToHsl(next[0], next[1], next[2]);
    applyHsl(nh, ns, nl);
  };

  const applyOklchChannel = (index: 0 | 1 | 2, nextVal: number) => {
    const next: [number, number, number] = [okL, okC, okH];
    next[index] =
      index === 0 ? clamp(nextVal, 8, 94) : index === 1 ? clamp(nextVal, 0, 0.37) : clamp(nextVal, 0, 360);
    const [nr, ng, nb] = oklchToRgb(next[0], next[1], next[2]);
    const [nh, ns, nl] = rgbToHsl(nr, ng, nb);
    applyHsl(nh, ns, nl);
  };

  const updateFromPoint = (clientX: number, clientY: number) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const s = clamp((clientX - rect.left) / rect.width, 0, 1);
    const v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    const l = v * (1 - s / 2);
    const denom = Math.min(l, 1 - l);
    const sOut = denom <= 0 ? 0 : (v - l) / denom;
    onSaturationChange(clamp(Math.round(sOut * 100), 0, 100));
    onLightnessChange(clamp(Math.round(l * 100), 8, 92));
  };

  const handlePadPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPoint(event.clientX, event.clientY);
  };

  const handlePadPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.buttons & 1) === 0 && !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateFromPoint(event.clientX, event.clientY);
  };

  const handlePadKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 8 : 2;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onSaturationChange(clamp(Math.round(saturation) + step, 0, 100));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onSaturationChange(clamp(Math.round(saturation) - step, 0, 100));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      onLightnessChange(clamp(Math.round(lightness) + step, 8, 92));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      onLightnessChange(clamp(Math.round(lightness) - step, 8, 92));
    }
  };

  const activePreset = activeColors.find(
    preset => hslToHex(preset.hue, preset.saturation, preset.lightness).toUpperCase() === hex.toUpperCase(),
  );

  const moveGridFocus = (index: number, event: KeyboardEvent<HTMLButtonElement>) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    let next = index;
    if (event.key === 'ArrowRight') next = row * columns + Math.min(columns - 1, column + 1);
    else if (event.key === 'ArrowLeft') next = row * columns + Math.max(0, column - 1);
    else if (event.key === 'ArrowDown') next = Math.min(activeColors.length - 1, index + columns);
    else if (event.key === 'ArrowUp') next = Math.max(0, index - columns);
    else if (event.key === 'Home') next = row * columns;
    else if (event.key === 'End') next = Math.min(activeColors.length - 1, row * columns + columns - 1);
    else return;
    event.preventDefault();
    setFocusIndex(next);
    swatchRefs.current[next]?.focus();
  };

  const handleHexChange = (value: string) => {
    setHexDraft(value);
    const parsed = hexToHsl(value);
    if (parsed) applyHsl(parsed[0], parsed[1], parsed[2]);
  };

  const copyActiveValue = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(activeString);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const channels =
    model === 'oklch'
      ? [
          { label: 'L%', value: okL, display: okL.toFixed(1), min: 8, max: 94, step: 0.5, onCommit: (v: number) => applyOklchChannel(0, v) },
          { label: 'C', value: okC, display: okC.toFixed(3), min: 0, max: 0.37, step: 0.005, onCommit: (v: number) => applyOklchChannel(1, v) },
          { label: 'H°', value: okH, display: String(okH), min: 0, max: 360, step: 1, onCommit: (v: number) => applyOklchChannel(2, v) },
        ]
      : model === 'rgb'
        ? [
            { label: 'R', value: r, display: String(r), min: 0, max: 255, step: 1, onCommit: (v: number) => applyRgbChannel(0, v) },
            { label: 'G', value: g, display: String(g), min: 0, max: 255, step: 1, onCommit: (v: number) => applyRgbChannel(1, v) },
            { label: 'B', value: b, display: String(b), min: 0, max: 255, step: 1, onCommit: (v: number) => applyRgbChannel(2, v) },
          ]
        : [
            { label: 'H°', value: Math.round(hue), display: String(Math.round(hue)), min: 0, max: 360, step: 1, onCommit: (v: number) => onHueChange(clamp(Math.round(v), 0, 360)) },
            { label: 'S%', value: Math.round(saturation), display: String(Math.round(saturation)), min: 0, max: 100, step: 1, onCommit: (v: number) => onSaturationChange(clamp(Math.round(v), 0, 100)) },
            { label: 'L%', value: Math.round(lightness), display: String(Math.round(lightness)), min: 8, max: 92, step: 1, onCommit: (v: number) => onLightnessChange(clamp(Math.round(v), 8, 92)) },
          ];

  const slidersBlock = (
    <div className="jh-spectrum__sliders">
      <div className="jh-spectrum__field">
        <div><span id={`${id}-hue`}>Hue</span><output>{Math.round(hue)}°</output></div>
        <Slider labelId={`${id}-hue`} className="jh-spectrum__hue" min={0} max={360} step={1} value={[hue]} onValueChange={values => onHueChange(values[0])} />
      </div>

      <div className="jh-spectrum__field">
        <div><span id={`${id}-saturation`}>Saturation</span><output>{Math.round(saturation)}%</output></div>
        <Slider labelId={`${id}-saturation`} className="jh-spectrum__saturation" min={0} max={100} step={1} value={[saturation]} onValueChange={values => onSaturationChange(values[0])} style={{ '--jh-spectrum-color': hslString, '--jh-spectrum-track': satTrack } as CSSProperties} />
      </div>

      <div className="jh-spectrum__field">
        <div><span id={`${id}-lightness`}>Lightness</span><output>{Math.round(lightness)}%</output></div>
        <Slider labelId={`${id}-lightness`} className="jh-spectrum__lightness" min={8} max={92} step={1} value={[lightness]} onValueChange={values => onLightnessChange(values[0])} style={{ '--jh-spectrum-color': hslString, '--jh-spectrum-track': lightTrack } as CSSProperties} />
      </div>
    </div>
  );

  const surface = (
    <section
      className={`jh-spectrum${showPicker ? ' jh-spectrum--full' : ''}`}
      data-jh-material={mode === 'popover' ? material : undefined}
      aria-label={label}
    >
      {showPicker ? (
        <div className="jh-spectrum__studio">
          <div className="jh-spectrum__main">
            <div className="jh-spectrum__picker">
              <div className="jh-spectrum__picker-head">
                <div className="jh-spectrum__active">
                  <span className="jh-spectrum__dot" style={{ background: hslString }} aria-hidden="true" />
                  <output>{activeString}</output>
                </div>
                <div className="jh-spectrum__modes" role="tablist" aria-label="Color space format">
                  {(['oklch', 'rgb', 'hsl'] as const).map(item => (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={model === item}
                      className={model === item ? 'is-active' : undefined}
                      onClick={() => setModel(item)}
                    >
                      {item.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div
                ref={padRef}
                className="jh-spectrum__pad"
                role="slider"
                tabIndex={0}
                aria-label="Color picker plane for saturation and lightness"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(saturation)}
                aria-valuetext={activeString}
                style={{ '--jh-spectrum-hue': `hsl(${Math.round(hue)} 100% 50%)` } as CSSProperties}
                onPointerDown={handlePadPointerDown}
                onPointerMove={handlePadPointerMove}
                onKeyDown={handlePadKeyDown}
              >
                <span
                  className="jh-spectrum__reticle"
                  style={{ left: `${reticleX}%`, top: `${reticleY}%`, background: hslString }}
                />
              </div>

              <div className="jh-spectrum__channels" aria-label={`${model.toUpperCase()} color channels`}>
                {channels.map(ch => (
                  <ChannelInput
                    key={`${model}-${ch.label}`}
                    label={ch.label}
                    value={ch.value}
                    display={ch.display}
                    min={ch.min}
                    max={ch.max}
                    step={ch.step}
                    onCommit={ch.onCommit}
                  />
                ))}
              </div>

              <div className="jh-spectrum__hex-row">
                <span className="jh-spectrum__dot" style={{ background: hslString }} aria-hidden="true" />
                <label htmlFor={`${id}-hex`} className="jh-spectrum__hex-label">Hex</label>
                <input
                  id={`${id}-hex`}
                  className="jh-input jh-spectrum__hex-input"
                  type="text"
                  spellCheck={false}
                  maxLength={7}
                  value={hexDraft.toUpperCase()}
                  onChange={event => handleHexChange(event.target.value)}
                  onBlur={() => { if (!hexToHsl(hexDraft)) setHexDraft(hex); }}
                  aria-label="Hex color value"
                />
                <button type="button" className="jh-spectrum__copy" onClick={copyActiveValue}>
                  {copied ? 'Copied' : `Copy ${model.toUpperCase()}`}
                </button>
              </div>
            </div>

            {slidersBlock}
          </div>

          <aside className="jh-spectrum__presets" aria-label="Color libraries">
            <div className="jh-spectrum__presets-head">
              <div>
                <strong>Library</strong>
                <span>{activeLibrary?.description}</span>
              </div>
              <output>{activeColors.length}</output>
            </div>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="jh-spectrum__library-picker"
                  aria-label="Color library"
                >
                  <span className="jh-spectrum__library-value">
                    <strong>{activeLibrary?.label}</strong>
                    <small>{activeColors.length}</small>
                  </span>
                  <ChevronDown size={13} strokeWidth={1.7} aria-hidden="true" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="jh-spectrum__library-menu"
                  align="start"
                  sideOffset={6}
                >
                  <DropdownMenu.Label className="jh-spectrum__library-menu-label">
                    Color library
                  </DropdownMenu.Label>
                  <DropdownMenu.RadioGroup
                    value={activeLibrary?.id ?? 'pastel-neutrals'}
                    onValueChange={value => {
                      setActiveLibraryId(value);
                      setFocusIndex(0);
                    }}
                  >
                    {resolvedLibraries.map(lib => (
                      <DropdownMenu.RadioItem
                        key={lib.id}
                        value={lib.id}
                        className="jh-spectrum__library-item"
                      >
                        <span className="jh-spectrum__library-copy">
                          <strong>{lib.label}</strong>
                          <span>{lib.description}</span>
                        </span>
                        <span className="jh-spectrum__library-item-meta">
                          <small>{lib.colors.length}</small>
                        </span>
                      </DropdownMenu.RadioItem>
                    ))}
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <div
              className="jh-spectrum__honeycomb"
              role="grid"
              aria-label={`${activeLibrary?.label ?? 'Predefined'} honeycomb`}
              style={{ '--jh-spectrum-columns': columns } as CSSProperties}
            >
              {activeColors.map((preset, index) => {
                const presetColor = `hsl(${preset.hue} ${preset.saturation}% ${preset.lightness}%)`;
                const presetHex = hslToHex(preset.hue, preset.saturation, preset.lightness).toUpperCase();
                const isOffsetRow = Math.floor(index / columns) % 2 === 1;
                const isSelected = presetHex === hex.toUpperCase();

                return (
                  <button
                    key={`${activeLibrary?.id}-${preset.name}-${index}`}
                    ref={element => { swatchRefs.current[index] = element; }}
                    type="button"
                    role="gridcell"
                    tabIndex={index === focusIndex ? 0 : -1}
                    aria-selected={isSelected}
                    aria-label={`${preset.name} (${presetHex})`}
                    title={`${preset.name} · ${presetHex}`}
                    className={`jh-spectrum__swatch${isOffsetRow ? ' is-offset' : ''}${isSelected ? ' is-selected' : ''}`}
                    style={{ background: presetColor }}
                    onFocus={() => setFocusIndex(index)}
                    onKeyDown={event => moveGridFocus(index, event)}
                    onClick={() => {
                      setFocusIndex(index);
                      applyHsl(preset.hue, preset.saturation, preset.lightness);
                    }}
                  />
                );
              })}
            </div>

            <div className="jh-spectrum__presets-footer">
              <span>{activePreset ? activePreset.name : 'Custom tint'}</span>
              <span className="jh-spectrum__presets-preview">
                <output>{hex.toUpperCase()}</output>
                <span className="jh-spectrum__dot" style={{ background: hslString }} aria-hidden="true" />
              </span>
            </div>
          </aside>
        </div>
      ) : (
        <>
          <div className="jh-spectrum__sample" style={{ background: hslString }}>
            <span>{hex.toUpperCase()}</span>
            <span>{activeString}</span>
          </div>
          {slidersBlock}
        </>
      )}
    </section>
  );

  if (mode === 'inline') return surface;

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" className="jh-spectrum-trigger" aria-expanded={isOpen}>
          <span className="jh-spectrum-trigger__swatch" style={{ background: hslString }} aria-hidden="true" />
          <span className="jh-spectrum-trigger__copy">{triggerLabel}</span>
          <span className="jh-spectrum-trigger__meta">{hex.toUpperCase()}</span>
          <ChevronDown size={14} className="jh-spectrum-trigger__chevron" aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          avoidCollisions
          collisionPadding={16}
          className="jh-spectrum-popover"
        >
          {surface}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

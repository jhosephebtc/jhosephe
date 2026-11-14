import { useEffect, useId, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Moon, RotateCcw, Sun } from 'lucide-react';
import { Slider } from '../../../assets/ui/controls';

export type JhosepheTheme = 'light' | 'dark';

const STORAGE_KEY = 'jhosephe-theme';
const TRANSPARENCY_KEY = 'jhosephe-surface-transparency';
const BLUR_KEY = 'jhosephe-surface-blur';
const APPEARANCE_EVENT = 'jhosephe-appearance-change';

const clampTransparency = (value: number) => Math.max(0, Math.min(85, Math.round(Number.isFinite(value) ? value : 0)));
const clampBlur = (value: number) => Math.max(0, Math.min(32, Math.round(Number.isFinite(value) ? value : 0)));

function readStoredTheme(): JhosepheTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // Ignore storage access errors in restricted frames.
  }
  return document.documentElement.dataset.jhTheme === 'dark' ? 'dark' : 'light';
}

function readStoredNumber(key: string, clamp: (value: number) => number, fallback = 0): number {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) return clamp(Number(raw));
  } catch {
    // Ignore storage access errors in restricted frames.
  }
  return fallback;
}

export function applyJhosepheTheme(theme: JhosepheTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.jhTheme = theme;
  root.classList.toggle('dark', theme === 'dark');
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0a0a0a' : '#fafafa';
}

export function applyJhosepheSurface(transparency: number, blur: number) {
  if (typeof document === 'undefined') return;
  const t = clampTransparency(transparency);
  const b = clampBlur(blur);
  const root = document.documentElement;
  if (t > 0 || b > 0) {
    const alpha = Number(((100 - t) / 100).toFixed(3));
    root.setAttribute('data-jh-surface-custom', 'true');
    root.style.setProperty('--jh-surface-alpha', String(alpha));
    root.style.setProperty('--jh-surface-blur', `${b}px`);
  } else {
    root.removeAttribute('data-jh-surface-custom');
    root.style.removeProperty('--jh-surface-alpha');
    root.style.removeProperty('--jh-surface-blur');
  }
}

export function initJhosepheTheme() {
  applyJhosepheTheme(readStoredTheme());
  applyJhosepheSurface(
    readStoredNumber(TRANSPARENCY_KEY, clampTransparency),
    readStoredNumber(BLUR_KEY, clampBlur),
  );
}

function broadcastAppearance() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(APPEARANCE_EVENT));
}

export function useJhosepheTheme() {
  const [theme, setThemeState] = useState<JhosepheTheme>(() => readStoredTheme());
  const [surfaceTransparency, setSurfaceTransparencyState] = useState<number>(() =>
    readStoredNumber(TRANSPARENCY_KEY, clampTransparency),
  );
  const [surfaceBlur, setSurfaceBlurState] = useState<number>(() =>
    readStoredNumber(BLUR_KEY, clampBlur),
  );

  const setTheme = (next: JhosepheTheme | ((current: JhosepheTheme) => JhosepheTheme)) => {
    setThemeState(current => {
      const resolved = typeof next === 'function' ? next(current) : next;
      applyJhosepheTheme(resolved);
      try {
        window.localStorage.setItem(STORAGE_KEY, resolved);
      } catch {
        // Ignore storage write errors.
      }
      broadcastAppearance();
      return resolved;
    });
  };

  const setSurfaceTransparency = (next: number) => {
    const clamped = clampTransparency(next);
    setSurfaceTransparencyState(clamped);
    applyJhosepheSurface(clamped, readStoredNumber(BLUR_KEY, clampBlur, surfaceBlur));
    try {
      window.localStorage.setItem(TRANSPARENCY_KEY, String(clamped));
    } catch {
      // Ignore storage write errors.
    }
    broadcastAppearance();
  };

  const setSurfaceBlur = (next: number) => {
    const clamped = clampBlur(next);
    setSurfaceBlurState(clamped);
    applyJhosepheSurface(readStoredNumber(TRANSPARENCY_KEY, clampTransparency, surfaceTransparency), clamped);
    try {
      window.localStorage.setItem(BLUR_KEY, String(clamped));
    } catch {
      // Ignore storage write errors.
    }
    broadcastAppearance();
  };

  const resetSurface = () => {
    setSurfaceTransparencyState(0);
    setSurfaceBlurState(0);
    applyJhosepheSurface(0, 0);
    try {
      window.localStorage.setItem(TRANSPARENCY_KEY, '0');
      window.localStorage.setItem(BLUR_KEY, '0');
    } catch {
      // Ignore storage write errors.
    }
    broadcastAppearance();
  };

  useEffect(() => {
    applyJhosepheTheme(theme);
    applyJhosepheSurface(surfaceTransparency, surfaceBlur);
  }, [theme, surfaceTransparency, surfaceBlur]);

  useEffect(() => {
    const syncFromStorage = () => {
      setThemeState(readStoredTheme());
      setSurfaceTransparencyState(readStoredNumber(TRANSPARENCY_KEY, clampTransparency));
      setSurfaceBlurState(readStoredNumber(BLUR_KEY, clampBlur));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === TRANSPARENCY_KEY || event.key === BLUR_KEY) {
        syncFromStorage();
      }
    };
    window.addEventListener(APPEARANCE_EVENT, syncFromStorage);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(APPEARANCE_EVENT, syncFromStorage);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = () => setTheme(current => (current === 'dark' ? 'light' : 'dark'));
  return {
    theme,
    setTheme,
    toggle,
    surfaceTransparency,
    setSurfaceTransparency,
    surfaceBlur,
    setSurfaceBlur,
    resetSurface,
  };
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const {
    theme,
    setTheme,
    surfaceTransparency,
    setSurfaceTransparency,
    surfaceBlur,
    setSurfaceBlur,
    resetSurface,
  } = useJhosepheTheme();
  const [open, setOpen] = useState(false);
  const transparencyLabelId = useId();
  const blurLabelId = useId();
  const isDark = theme === 'dark';
  const hasSurfaceEffect = surfaceTransparency > 0 || surfaceBlur > 0;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`jh-theme-toggle${className ? ` ${className}` : ''}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label="Open theme and surface picker"
          title="Theme, transparency and blur"
        >
          {isDark ? <Moon size={14} strokeWidth={1.7} aria-hidden="true" /> : <Sun size={14} strokeWidth={1.7} aria-hidden="true" />}
          <span>{isDark ? 'Black' : 'Light'}</span>
          {hasSurfaceEffect && <span className="jh-theme-toggle__dot" aria-hidden="true" />}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="jh-picker-overlay jh-theme-picker-popover"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          aria-label="Theme and surface settings"
        >
          <div className="jh-theme-picker-popover__head">
            <div>
              <span className="jh-theme-picker-popover__eyebrow">Appearance</span>
              <strong>Theme &amp; Surface</strong>
            </div>
            {hasSurfaceEffect && (
              <button
                type="button"
                className="jh-theme-picker-popover__reset"
                onClick={resetSurface}
              >
                <RotateCcw size={12} strokeWidth={1.75} aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="jh-theme-picker-popover__section">
            <span className="jh-theme-picker-popover__section-label">Theme</span>
            <div className="jh-theme-picker-popover__modes" role="group" aria-label="Color theme">
              <button
                type="button"
                aria-pressed={!isDark}
                onClick={() => setTheme('light')}
              >
                <Sun size={13} strokeWidth={1.75} aria-hidden="true" />
                <span>Light</span>
              </button>
              <button
                type="button"
                aria-pressed={isDark}
                onClick={() => setTheme('dark')}
              >
                <Moon size={13} strokeWidth={1.75} aria-hidden="true" />
                <span>Black</span>
              </button>
            </div>
          </div>

          <div className="jh-theme-picker-popover__sliders">
            <div className="jh-theme-picker-popover__field">
              <div className="jh-theme-picker-popover__label-row">
                <span id={transparencyLabelId}>Transparency</span>
                <output>{surfaceTransparency}%</output>
              </div>
              <Slider
                labelId={transparencyLabelId}
                value={[surfaceTransparency]}
                min={0}
                max={85}
                step={1}
                onValueChange={values => setSurfaceTransparency(values[0])}
              />
            </div>
            <div className="jh-theme-picker-popover__field">
              <div className="jh-theme-picker-popover__label-row">
                <span id={blurLabelId}>Blur</span>
                <output>{surfaceBlur} px</output>
              </div>
              <Slider
                labelId={blurLabelId}
                value={[surfaceBlur]}
                min={0}
                max={32}
                step={1}
                onValueChange={values => setSurfaceBlur(values[0])}
              />
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

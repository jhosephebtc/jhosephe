import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export type JhosepheTheme = 'light' | 'dark';

const STORAGE_KEY = 'jhosephe-theme';

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

export function applyJhosepheTheme(theme: JhosepheTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.jhTheme = theme;
  root.classList.toggle('dark', theme === 'dark');
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0a0a0a' : '#fafafa';
}

export function initJhosepheTheme() {
  applyJhosepheTheme(readStoredTheme());
}

export function useJhosepheTheme() {
  const [theme, setTheme] = useState<JhosepheTheme>(() => readStoredTheme());

  useEffect(() => {
    applyJhosepheTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage write errors.
    }
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
        setTheme(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = () => setTheme(current => (current === 'dark' ? 'light' : 'dark'));
  return { theme, setTheme, toggle };
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useJhosepheTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`jh-theme-toggle${className ? ` ${className}` : ''}`}
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to black theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to black theme'}
    >
      {isDark ? <Sun size={14} strokeWidth={1.7} aria-hidden="true" /> : <Moon size={14} strokeWidth={1.7} aria-hidden="true" />}
      <span>{isDark ? 'Light' : 'Black'}</span>
    </button>
  );
}

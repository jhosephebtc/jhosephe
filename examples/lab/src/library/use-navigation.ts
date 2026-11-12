import { useEffect, useRef, useState, type MouseEvent } from 'react';

const currentPath = () => window.location.pathname.replace(/\/$/, '') || '/';

/** Preserve the library shell, native links, modifier-clicks, history, and route focus. */
export function useLibraryNavigation() {
  const [path, setPath] = useState(currentPath);
  const changed = useRef(false);
  const scroll = useRef(0);
  useEffect(() => {
    const pop = (event: PopStateEvent) => { changed.current = true; scroll.current = Number(event.state?.jhScroll || 0); setPath(currentPath()); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    if (!changed.current) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById('library-main')?.focus({ preventScroll: true });
      window.scrollTo({ top: scroll.current, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [path]);
  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || url.hash || url.search || !(url.pathname === '/' || url.pathname === '/installation' || url.pathname.startsWith('/components'))) return;
    event.preventDefault();
    const next = url.pathname.replace(/\/$/, '') || '/';
    if (next === path) return;
    history.replaceState({ ...history.state, jhScroll: window.scrollY }, '');
    history.pushState({ jhScroll: 0 }, '', url.pathname);
    changed.current = true; scroll.current = 0; setPath(next);
  };
  return { path, navigate };
}

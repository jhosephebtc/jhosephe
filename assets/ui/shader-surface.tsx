import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';

const Mesh = lazy(() => import('@paper-design/shaders-react').then(module => ({ default: module.MeshGradient })));
const colors = ['#dedede', '#f6f6f6', '#c8c8c8', '#f1f1f1'];

class ShaderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Progressive decoration. The surrounding CSS is the complete static fallback. */
export function ShaderSurface() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window.matchMedia !== 'function') return;
    const queries = ['(prefers-reduced-motion: reduce)', '(prefers-reduced-transparency: reduce)', '(forced-colors: active)'].map(q => window.matchMedia(q));
    let inView = typeof IntersectionObserver === 'undefined';
    let supported = false;
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2');
      supported = Boolean(context);
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { supported = false; }
    const update = () => setEnabled(supported && inView && !document.hidden && !queries.some(query => query.matches));
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      update();
    });
    observer?.observe(element);
    queries.forEach(query => query.addEventListener('change', update));
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer?.disconnect();
      queries.forEach(query => query.removeEventListener('change', update));
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <div ref={ref} className="jh-shader" aria-hidden="true">
      {enabled && <ShaderBoundary><Suspense fallback={null}>
        <Mesh className="jh-shader__canvas" colors={colors} distortion={0.16} swirl={0.08} grainMixer={0} grainOverlay={0.02} speed={0.08} maxPixelCount={500000} />
      </Suspense></ShaderBoundary>}
    </div>
  );
}

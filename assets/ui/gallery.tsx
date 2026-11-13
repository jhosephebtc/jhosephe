import { useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './button';

export interface GalleryItem { id: string; title: string; description?: string; content: ReactNode }
export function Gallery({ items, label = 'Gallery', showCaptions = true, showIndicators = true }: {
  items: GalleryItem[]; label?: string; showCaptions?: boolean; showIndicators?: boolean;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const move = (index: number) => {
    const element = viewport.current;
    if (!element) return;
    const next = Math.max(0, Math.min(items.length - 1, index));
    element.scrollTo({ left: next * element.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  if (!items.length) return <p className="jh-gallery-empty">No items to display.</p>;
  return <section className="jh-gallery" aria-label={label} aria-roledescription="carousel">
    <div ref={viewport} className="jh-gallery__viewport" tabIndex={0} data-dragging={dragging}
      onScroll={event => { const element = event.currentTarget; setActive(Math.round(element.scrollLeft / Math.max(1, element.clientWidth))); }}
      onKeyDown={event => { if (event.target !== event.currentTarget) return; const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']; if (keys.includes(event.key)) { event.preventDefault(); move(event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1)); } }}
      onPointerDown={event => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || (event.target as HTMLElement).closest('button,a,input,textarea,select')) return;
        event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false }; setDragging(true);
      }}
      onPointerMove={event => { if (!drag.current) return; const distance = event.clientX - drag.current.x; if (Math.abs(distance) > 4) drag.current.moved = true; event.currentTarget.scrollLeft = drag.current.scroll - distance; }}
      onPointerUp={event => { if (!drag.current) return; drag.current = null; setDragging(false); const element = event.currentTarget; requestAnimationFrame(() => move(Math.round(element.scrollLeft / element.clientWidth))); }}
      onPointerCancel={() => { drag.current = null; setDragging(false); }} onLostPointerCapture={() => { drag.current = null; setDragging(false); }}>
      {items.map((item, index) => <div key={item.id} className="jh-gallery__slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}: ${item.title}`} inert={index !== active || undefined}><div className="jh-gallery__art">{item.content}</div>{showCaptions && <div className="jh-gallery__caption"><strong>{item.title}</strong>{item.description && <p>{item.description}</p>}</div>}</div>)}
    </div><div className="jh-gallery__footer"><Button type="button" size="icon" variant="secondary" aria-label="Previous slide" onClick={() => move(active - 1)} disabled={active === 0}><ArrowLeft size={16} aria-hidden="true" /></Button>{showIndicators ? <div className="jh-gallery__dots">{items.map((item, index) => <button type="button" key={item.id} aria-label={`Go to slide ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => move(index)}><span /></button>)}</div> : <span className="jh-gallery__count">{active + 1} / {items.length}</span>}<Button type="button" size="icon" variant="secondary" aria-label="Next slide" onClick={() => move(active + 1)} disabled={active >= items.length - 1}><ArrowRight size={16} aria-hidden="true" /></Button></div><span className="jh-visually-hidden" aria-live="polite">Slide {active + 1} of {items.length}</span>
  </section>;
}

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CurrencyPicker } from './currency-picker';

/** Mock brokerage order flow inspired by layered portfolio and review dialogs. */
export function FinancialOrderModal({ symbol = 'NOVA', company = 'Nova Systems', price = 156.3, material = 'solid' }: { symbol?: string; company?: string; price?: number; material?: 'solid' | 'liquid-glass' }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [quantity, setQuantity] = useState('10');
  const [currency, setCurrency] = useState('USD');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [limit, setLimit] = useState(price.toFixed(2));
  const [placed, setPlaced] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const numericQuantity = Math.max(0, Number(quantity) || 0);
  const estimated = numericQuantity * (orderType === 'Limit' ? Number(limit) || price : price);
  const format = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),[href]');
    const first = focusable()?.[0];
    window.setTimeout(() => first?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); return; }
      if (event.key !== 'Tab') return;
      const items = Array.from(focusable() ?? []);
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger.current?.focus();
      if (previous && previous !== document.body) previous.focus?.();
    };
  }, [open]);

  const content = open && <div className="jh-financial-order__backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
    <div data-jh-material={material} className="jh-financial-order" role="dialog" aria-modal="true" aria-labelledby={id + '-title'} aria-describedby={id + '-description'} ref={panel}>
      <header className="jh-financial-order__header"><div><span className="jh-financial-order__eyebrow">Trade ticket · Demo</span><h2 id={id + '-title'}>Review your order</h2><p id={id + '-description'}>Check the details before placing a simulated order.</p></div><button className="jh-financial-order__close" type="button" aria-label="Close order dialog" onClick={() => setOpen(false)}>×</button></header>
      <div className="jh-financial-order__body">
        <section className="jh-financial-order__asset"><span className="jh-market-picker__ticker">{symbol.slice(0,1)}</span><div><strong>{symbol}</strong><span>{company}</span></div><div><strong>{format(price)}</strong><small>Last price</small></div></section>
        <div className="jh-financial-order__side" role="group" aria-label="Order side">{(['Buy','Sell'] as const).map(item => <button key={item} type="button" aria-pressed={side === item} onClick={() => setSide(item)}>{item}</button>)}</div>
        <div className="jh-financial-order__fields"><label>Shares<input inputMode="decimal" type="number" min="0.001" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} /></label><label>Order type<select value={orderType} onChange={event => setOrderType(event.target.value as 'Market' | 'Limit')}><option>Market</option><option>Limit</option></select></label>{orderType === 'Limit' && <label className="jh-financial-order__limit">Limit price<input inputMode="decimal" type="number" min="0.01" step="0.01" value={limit} onChange={event => setLimit(event.target.value)} /></label>}</div>
        <CurrencyPicker value={currency} onValueChange={setCurrency} label="Order currency" />
        <div className="jh-financial-order__account"><div><span>Paying from</span><strong>Everyday investing ·· 4821</strong></div><span>Available<br /><b>{format(12480.52)}</b></span></div>
        <div className="jh-financial-order__summary"><span>Estimated {side.toLowerCase()} total</span><strong>{format(estimated)}</strong><small>Price may change before execution. No real order will be sent.</small></div>
      </div>
      <footer className="jh-financial-order__footer"><button type="button" className="jh-financial-order__cancel" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="jh-financial-order__confirm" onClick={() => setPlaced(true)}>{placed ? 'Demo order placed' : 'Place ' + side.toLowerCase() + ' order'}</button></footer>
      <span className="jh-visually-hidden" role="status">{placed ? 'Demo ' + side.toLowerCase() + ' order for ' + quantity + ' ' + symbol + ' shares recorded locally.' : ''}</span>
    </div>
  </div>;

  return <div className="jh-financial-order__launcher"><button ref={trigger} className="jh-financial-order__launch" type="button" onClick={() => { setPlaced(false); setOpen(true); }}>Review order <span aria-hidden="true">↗</span></button>{typeof document !== 'undefined' && content ? createPortal(content, document.body) : content}</div>;
}

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { CurrencyPicker } from './currency-picker';
import { Input } from './input';
import { PickerPanel } from './picker-panel';
import { SegmentedControl } from './segmented-control';
import { ShaderSurface } from './shader-surface';

export type FinancialOrderMaterial = 'solid' | 'glass' | 'liquid' | 'liquid-glass';

const ORDER_TYPES = [
  { value: 'Market', label: 'Market', detail: 'Fill at the next available price' },
  { value: 'Limit', label: 'Limit', detail: 'Fill only at your limit price or better' },
] as const;

const ORDER_HEIGHT_EASE = 'height 340ms cubic-bezier(0.22, 1, 0.36, 1)';

const normalizeMaterial = (material: FinancialOrderMaterial) => {
  if (material === 'liquid-glass') return 'glass';
  return material;
};

/** Mock brokerage order flow inspired by layered portfolio and review dialogs. */
export function FinancialOrderModal({ symbol = 'NOVA', company = 'Nova Systems', price = 156.3, material = 'solid' }: {
  symbol?: string; company?: string; price?: number; material?: FinancialOrderMaterial;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [quantity, setQuantity] = useState('10');
  const [currency, setCurrency] = useState('USD');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);
  const [orderTypeQuery, setOrderTypeQuery] = useState('');
  const [limit, setLimit] = useState(price.toFixed(2));
  const [placed, setPlaced] = useState(false);
  const launch = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const orderTypeTrigger = useRef<HTMLButtonElement>(null);
  const panelHeight = useRef<number | null>(null);
  const finish = normalizeMaterial(material);
  const materialAttr = finish === 'glass' ? 'liquid-glass' : finish;
  const numericQuantity = Math.max(0, Number(quantity) || 0);
  const estimated = numericQuantity * (orderType === 'Limit' ? Number(limit) || price : price);
  const format = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  const orderTypeResults = useMemo(
    () => ORDER_TYPES.filter(item => (item.label + ' ' + item.detail).toLowerCase().includes(orderTypeQuery.toLowerCase())),
    [orderTypeQuery],
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => panel.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled),input:not(:disabled),[href],[role="radio"]',
    );
    const first = focusable()?.[0];
    window.setTimeout(() => first?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.querySelector('.jh-picker-overlay')) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = priorOverflow;
      document.removeEventListener('keydown', onKeyDown);
      launch.current?.focus();
      if (previous && previous !== document.body) previous.focus?.();
    };
  }, [open]);

  // Smooth panel height when Limit field (and other body content) grows/shrinks.
  useLayoutEffect(() => {
    const node = panel.current;
    if (!open) {
      panelHeight.current = null;
      return;
    }
    if (!node) return;

    const maxHeight = Math.min(760, window.innerHeight - 40);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const measure = () => {
      const prior = node.style.height;
      node.style.height = 'auto';
      const natural = Math.min(node.getBoundingClientRect().height, maxHeight);
      node.style.height = prior;
      return natural;
    };

    const target = measure();
    const from = panelHeight.current;
    if (from == null || reduce || Math.abs(from - target) < 0.5) {
      node.style.transition = 'none';
      node.style.height = `${target}px`;
      panelHeight.current = target;
      return;
    }

    node.style.transition = 'none';
    node.style.height = `${from}px`;
    void node.offsetHeight;
    node.style.transition = ORDER_HEIGHT_EASE;
    node.style.height = `${target}px`;
    panelHeight.current = target;

    const onEnd = (event: TransitionEvent) => {
      if (event.propertyName !== 'height') return;
      node.style.transition = 'none';
      node.style.height = `${measure()}px`;
      panelHeight.current = measure();
      node.removeEventListener('transitionend', onEnd);
    };
    node.addEventListener('transitionend', onEnd);
    return () => node.removeEventListener('transitionend', onEnd);
  }, [open, orderType, side, currency, placed]);

  const content = open && (
    <div
      className={`jh-financial-order__backdrop${finish === 'liquid' ? ' is-liquid-stage' : finish === 'glass' ? ' is-glass-stage' : ''}`}
      data-jh-material={materialAttr}
      onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}
    >
      {finish === 'liquid' && (
        <div className="jh-financial-order__stage-light" aria-hidden="true">
          <ShaderSurface />
        </div>
      )}
      <div
        data-jh-material={materialAttr}
        className={`jh-financial-order${finish === 'liquid' ? ' jh-menu--liquid' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id + '-title'}
        aria-describedby={id + '-description'}
        ref={panel}
      >
        <header className="jh-financial-order__header">
          <div>
            <span className="jh-financial-order__eyebrow">Trade ticket · Demo</span>
            <h2 id={id + '-title'}>Review your order</h2>
            <p id={id + '-description'}>Check the details before placing a simulated order.</p>
          </div>
          <button className="jh-financial-order__close" type="button" aria-label="Close order dialog" onClick={() => setOpen(false)}>×</button>
        </header>
        <div className="jh-financial-order__body">
          <section className="jh-financial-order__asset">
            <span className="jh-market-picker__ticker">{symbol.slice(0, 1)}</span>
            <div><strong>{symbol}</strong><span>{company}</span></div>
            <div><strong>{format(price)}</strong><small>Last price</small></div>
          </section>

          <SegmentedControl
            label="Order side"
            value={side}
            onValueChange={value => setSide(value as 'Buy' | 'Sell')}
            options={[
              { value: 'Buy', label: 'Buy' },
              { value: 'Sell', label: 'Sell' },
            ]}
          />

          <div className="jh-financial-order__fields">
            <label>
              Shares
              <Input
                inputMode="decimal"
                autoComplete="off"
                value={quantity}
                onChange={event => setQuantity(event.target.value.replace(/[^\d.]/g, ''))}
              />
            </label>
            <div className="jh-financial-order__order-type">
              <span className="jh-financial-order__field-label" id={id + '-order-type'}>Order type</span>
              <button
                ref={orderTypeTrigger}
                type="button"
                className="jh-financial-order__type-trigger jh-input"
                aria-labelledby={id + '-order-type'}
                aria-haspopup="listbox"
                aria-expanded={orderTypeOpen}
                onClick={() => setOrderTypeOpen(value => !value)}
              >
                <span>{orderType}</span>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
              </button>
              <PickerPanel
                open={orderTypeOpen}
                triggerRef={orderTypeTrigger}
                onClose={() => { setOrderTypeOpen(false); setOrderTypeQuery(''); }}
                search={orderTypeQuery}
                onSearchChange={setOrderTypeQuery}
                searchPlaceholder="Search order type"
                label="Order type options"
                className="jh-financial-order__type-panel"
                preferredHeight={220}
              >
                <ul className="jh-financial-order__type-options" role="listbox" aria-label="Order type options">
                  {orderTypeResults.map(item => (
                    <li key={item.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={orderType === item.value}
                        onClick={() => {
                          setOrderType(item.value);
                          setOrderTypeOpen(false);
                          setOrderTypeQuery('');
                        }}
                      >
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </button>
                    </li>
                  ))}
                  {!orderTypeResults.length && <li className="jh-currency-picker__empty">No matching order types.</li>}
                </ul>
              </PickerPanel>
            </div>
            <div
              className="jh-financial-order__limit-slot"
              data-open={orderType === 'Limit' ? 'true' : 'false'}
              aria-hidden={orderType !== 'Limit'}
            >
              <div className="jh-financial-order__limit-slot-inner">
                <label className="jh-financial-order__limit">
                  Limit price
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    tabIndex={orderType === 'Limit' ? 0 : -1}
                    value={limit}
                    onChange={event => setLimit(event.target.value.replace(/[^\d.]/g, ''))}
                  />
                </label>
              </div>
            </div>
          </div>

          <CurrencyPicker value={currency} onValueChange={setCurrency} label="Order currency" />

          <div className="jh-financial-order__account">
            <div><span>Paying from</span><strong>Everyday investing ·· 4821</strong></div>
            <span>Available<br /><b>{format(12480.52)}</b></span>
          </div>
          <div className="jh-financial-order__summary">
            <span>Estimated {side.toLowerCase()} total</span>
            <strong>{format(estimated)}</strong>
            <small>Price may change before execution. No real order will be sent.</small>
          </div>
        </div>
        <footer className="jh-financial-order__footer">
          <button type="button" className="jh-financial-order__cancel" onClick={() => setOpen(false)}>Cancel</button>
          <Button variant="primary" onClick={() => setPlaced(true)}>
            {placed ? 'Demo order placed' : 'Place ' + side.toLowerCase() + ' order'}
          </Button>
        </footer>
        <span className="jh-visually-hidden" role="status">
          {placed ? 'Demo ' + side.toLowerCase() + ' order for ' + quantity + ' ' + symbol + ' shares recorded locally.' : ''}
        </span>
      </div>
    </div>
  );

  return (
    <div className="jh-financial-order__launcher" data-jh-material={materialAttr}>
      <Button
        ref={launch}
        className="jh-financial-order__launch"
        variant="secondary"
        onClick={() => { setPlaced(false); setOpen(true); }}
      >
        Review order <span aria-hidden="true">↗</span>
      </Button>
      {typeof document !== 'undefined' && content ? createPortal(content, document.body) : content}
    </div>
  );
}

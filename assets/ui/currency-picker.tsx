import { useMemo, useState } from 'react';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: '1.0000' },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: '0.9234' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: '0.7912' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: '5.7421' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: '151.84' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rate: '0.8837' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: '1.3972' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: '1.5480' },
];

/** Compact, searchable currency selector with explicit, static demo rates. */
export function CurrencyPicker({ value = 'USD', onValueChange, label = 'Settlement currency' }: {
  value?: string; onValueChange?: (value: string) => void; label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const currency = CURRENCIES.find(item => item.code === value) ?? CURRENCIES[0];
  const results = useMemo(() => CURRENCIES.filter(item => (item.code + ' ' + item.name).toLowerCase().includes(query.toLowerCase())), [query]);
  const select = (code: string) => { onValueChange?.(code); setOpen(false); setQuery(''); };
  return <div className="jh-currency-picker">
    <span className="jh-currency-picker__label">{label}</span>
    <button className="jh-currency-picker__trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)}><span className="jh-currency-picker__symbol">{currency.symbol}</span><span><strong>{currency.code}</strong><small>{currency.name}</small></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg></button>
    {open && <div className="jh-currency-picker__popover"><label className="jh-currency-picker__search"><span className="jh-visually-hidden">Search currencies</span><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search currency" onKeyDown={event => { if (event.key === 'Escape') setOpen(false); if (event.key === 'Enter' && results[0]) select(results[0].code); }} /><kbd>Esc</kbd></label><div className="jh-currency-picker__options" role="listbox" aria-label="Currency options">{results.map(item => <button key={item.code} type="button" role="option" aria-selected={item.code === value} onClick={() => select(item.code)}><span className="jh-currency-picker__option-symbol">{item.symbol}</span><span><strong>{item.code}</strong><small>{item.name}</small></span><span className="jh-currency-picker__rate">{item.rate}</span></button>)}</div><p>Indicative rates · Demo</p></div>}
  </div>;
}

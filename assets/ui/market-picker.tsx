import { useMemo, useState } from 'react';

const MARKETS = {
  Stocks: [{ symbol: 'NOVA', name: 'Nova Systems', price: '$156.30', change: '+2.34%' }, { symbol: 'ALTO', name: 'Alto Mobility', price: '$82.14', change: '+0.81%' }, { symbol: 'MERI', name: 'Meridian Energy', price: '$43.78', change: '−0.42%' }, { symbol: 'ORBT', name: 'Orbit Cloud', price: '$218.09', change: '+1.16%' }],
  Funds: [{ symbol: 'US500', name: 'Broad Market Fund', price: '$524.60', change: '+0.62%' }, { symbol: 'CLN', name: 'Clean Energy Fund', price: '$38.42', change: '+1.04%' }, { symbol: 'BND', name: 'Core Bond Fund', price: '$91.07', change: '−0.08%' }],
  Crypto: [{ symbol: 'BTC', name: 'Bitcoin', price: '$68,420', change: '+3.14%' }, { symbol: 'ETH', name: 'Ethereum', price: '$3,540', change: '+1.72%' }, { symbol: 'SOL', name: 'Solana', price: '$184.20', change: '−0.36%' }],
};
type MarketKind = keyof typeof MARKETS;

/** Searchable mock market picker. Supply your own instrument catalog in production. */
export function MarketPicker({ onSelect, initialSymbol = 'NOVA' }: { onSelect?: (symbol: string) => void; initialSymbol?: string }) {
  const [kind, setKind] = useState<MarketKind>('Stocks');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialSymbol);
  const rows = useMemo(() => MARKETS[kind].filter(item => (item.symbol + ' ' + item.name).toLowerCase().includes(query.toLowerCase())), [kind, query]);
  const choose = (symbol: string) => { setSelected(symbol); onSelect?.(symbol); };
  return <section className="jh-market-picker" aria-label="Choose an asset">
    <div className="jh-market-picker__heading"><div><span>Market</span><strong>Explore assets</strong></div><span className="jh-market-picker__live"><i /> Demo data</span></div>
    <label className="jh-market-picker__search"><span className="jh-visually-hidden">Search market assets</span><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name or ticker" /></label>
    <div className="jh-market-picker__tabs" role="tablist" aria-label="Asset type">{(Object.keys(MARKETS) as MarketKind[]).map(item => <button type="button" role="tab" aria-selected={kind === item} key={item} onClick={() => setKind(item)}>{item}</button>)}</div>
    <div className="jh-market-picker__list" role="listbox" aria-label={kind + ' assets'}>
      {rows.map(item => <button type="button" role="option" aria-selected={selected === item.symbol} className="jh-market-picker__asset" key={item.symbol} onClick={() => choose(item.symbol)}><span className="jh-market-picker__ticker">{item.symbol.slice(0, 1)}</span><span className="jh-market-picker__name"><strong>{item.symbol}</strong><small>{item.name}</small></span><span className="jh-market-picker__price"><strong>{item.price}</strong><small data-positive={!item.change.includes('−')}>{item.change}</small></span><span className="jh-market-picker__check" aria-hidden="true">{selected === item.symbol ? '✓' : ''}</span></button>)}
      {!rows.length && <p className="jh-market-picker__empty">No matching assets.</p>}
    </div>
    <p className="jh-market-picker__footnote">Quotes are illustrative. Connect a market data source for live prices.</p>
  </section>;
}

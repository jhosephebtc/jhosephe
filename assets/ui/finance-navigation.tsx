import { useState } from 'react';

const ITEMS = [
  { id: 'overview', label: 'Overview', glyph: '◫' },
  { id: 'markets', label: 'Markets', glyph: '⌁' },
  { id: 'portfolio', label: 'Portfolio', glyph: '◷' },
  { id: 'activity', label: 'Activity', glyph: '↗' },
  { id: 'insights', label: 'Insights', glyph: '◇' },
];
type Layout = 'sidebar' | 'header';

/** Responsive finance navigation with compact header and tactile side-menu variants. */
export function FinanceNavigation({ layout = 'sidebar', activeItem = 'overview', onNavigate }: {
  layout?: Layout; activeItem?: string; onNavigate?: (item: string) => void;
}) {
  const [current, setCurrent] = useState(activeItem);
  const [collapsed, setCollapsed] = useState(false);
  const choose = (id: string) => { setCurrent(id); onNavigate?.(id); };
  if (layout === 'header') return <nav className="jh-finance-nav jh-finance-nav--header" aria-label="Finance navigation">
    <a className="jh-finance-nav__brand" href="#" onClick={event => event.preventDefault()} aria-label="Northstar finance home"><span>N</span> Northstar</a>
    <div className="jh-finance-nav__header-links">{ITEMS.map(item => <button key={item.id} type="button" aria-current={current === item.id ? 'page' : undefined} onClick={() => choose(item.id)}><span aria-hidden="true">{item.glyph}</span>{item.label}</button>)}</div>
    <button className="jh-finance-nav__account" type="button" onClick={() => choose('account')}><span>JD</span> Jordan Davis</button>
  </nav>;
  return <nav className={'jh-finance-nav jh-finance-nav--sidebar' + (collapsed ? ' is-collapsed' : '')} aria-label="Finance navigation">
    <div className="jh-finance-nav__side-head"><a className="jh-finance-nav__brand" href="#" onClick={event => event.preventDefault()} aria-label="Northstar finance home"><span>N</span>{!collapsed && 'Northstar'}</a><button type="button" className="jh-finance-nav__collapse" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-pressed={collapsed} onClick={() => setCollapsed(value => !value)}>{collapsed ? '›' : '‹'}</button></div>
    {!collapsed && <div className="jh-finance-nav__section-label">Workspace</div>}
    <div className="jh-finance-nav__side-links">{ITEMS.map(item => <button key={item.id} type="button" title={collapsed ? item.label : undefined} aria-current={current === item.id ? 'page' : undefined} onClick={() => choose(item.id)}><span className="jh-finance-nav__glyph" aria-hidden="true">{item.glyph}</span>{!collapsed && <span>{item.label}</span>}{!collapsed && item.id === 'activity' && <i>3</i>}</button>)}</div>
    <div className="jh-finance-nav__spacer" />
    <div className="jh-finance-nav__profile"><span className="jh-finance-nav__avatar">JD</span>{!collapsed && <span><strong>Jordan Davis</strong><small>Personal account</small></span>}</div>
  </nav>;
}

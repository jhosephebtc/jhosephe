import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Code2, Copy, CornerDownLeft, Grid2X2, Menu, Monitor, RotateCcw, Search, Smartphone, Star, Sun, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '../../../../assets/ui/button';
import { Dial } from '../../../../assets/ui/dial';
import { Slider, Switch } from '../../../../assets/ui/controls';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../../../../assets/ui/dialog';
import { Input } from '../../../../assets/ui/input';
import { InstrumentBars } from '../../../../assets/ui/instrument';
import { ShaderSurface } from '../../../../assets/ui/shader-surface';
import { SmoothShape, smoothPath } from '../../../../assets/ui/smooth-shape';
import { categories, components, defaults, settingsFor, usage, type ComponentId, type ComponentInfo, type Settings } from './data';
import { ExtraPreview } from './ExtraPreview';
import { extraComponents } from './extra-data';
import { SearchInput } from '../../../../assets/ui/search-input';
import { OklchPalette } from '../../../../assets/ui/oklch-palette';
import { useLibraryNavigation } from './use-navigation';
import { ThemeToggle, useJhosepheTheme } from '../theme';
import { useScrollItemReveal } from '../../../../assets/ui/vertical-gallery';
import './library.css';

const iconProps = { size: 16, strokeWidth: 1.6, 'aria-hidden': true } as const;
const normalise = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const matches = (component: ComponentInfo, query: string) => normalise(`${component.name} ${component.category} ${component.tag} ${component.description}`).includes(normalise(query));

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="library-brand-mark" aria-hidden="true">
      <rect x="1.75" y="1.75" width="18.5" height="18.5" rx="5.6" fill="currentColor" fillOpacity=".045" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.25" />
      <path d="M12.25 8.5v5.15c0 1.95-1.15 3.1-3.1 3.1H7.75" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" />
      <circle cx="12.25" cy="5.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(old => !old); }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);

  const results = useMemo(() => components.filter(item => matches(item, query)), [query]);
  const grouped = useMemo(() => {
    const map = new Map<string, Array<{ item: ComponentInfo; flatIndex: number }>>();
    results.forEach((item, flatIndex) => {
      const bucket = map.get(item.category) ?? [];
      bucket.push({ item, flatIndex });
      map.set(item.category, bucket);
    });
    return Array.from(map.entries());
  }, [results]);

  const safeIndex = results.length ? Math.min(activeIndex, results.length - 1) : -1;

  useScrollItemReveal(resultsRef, [open, query, results.length], '.jh-command-dialog__item, .jh-command-dialog__group-label');

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const navigateTo = (id: string) => {
    setOpen(false);
    setQuery('');
    window.history.pushState({}, '', `/components/${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && safeIndex >= 0) {
      event.preventDefault();
      navigateTo(results[safeIndex].id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={next => { setOpen(next); if (!next) setQuery(''); }}>
      <DialogTrigger asChild><button className="library-search-trigger" aria-label="Search components"><Search {...iconProps} /><span>Search components</span><kbd>⌘ K</kbd></button></DialogTrigger>
      <DialogContent material="solid" className="library-dialog-shell jh-dialog jh-dialog--rich jh-command-dialog library-search-dialog" aria-label="Search components" onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus(); }}>
        <div className="jh-financial-order">
          <div className="jh-financial-order__header">
            <div>
              <span className="jh-financial-order__eyebrow">Quick search</span>
              <DialogTitle className="jh-dialog-title">Find a detail.</DialogTitle>
              <DialogDescription className="library-sr">Search by name, material, or category.</DialogDescription>
            </div>
            <DialogClose className="jh-financial-order__close" aria-label="Close search"><X size={15} strokeWidth={1.75} aria-hidden="true" /></DialogClose>
          </div>

          <div className="jh-financial-order__body jh-command-dialog__body">
            <div className="jh-command-dialog__search">
              <Search size={14} strokeWidth={1.75} aria-hidden="true" className="jh-command-dialog__search-icon" />
              <label className="library-sr" htmlFor="library-search-field">Search components</label>
              <Input
                ref={inputRef}
                id="library-search-field"
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Buttons, glass, controls…"
                aria-controls={listboxId}
                aria-activedescendant={safeIndex >= 0 ? `${listboxId}-${results[safeIndex].id}` : undefined}
              />
            </div>

            <div ref={resultsRef} id={listboxId} role="listbox" aria-label="Components" className="jh-command-dialog__results">
              {grouped.length === 0 ? (
                <div className="jh-command-dialog__empty" role="status">No matching component.</div>
              ) : (
                grouped.map(([categoryName, entries]) => (
                  <div key={categoryName} className="jh-command-dialog__group">
                    <div className="jh-command-dialog__group-label">{categoryName}</div>
                    {entries.map(({ item, flatIndex }) => {
                      const isActive = flatIndex === safeIndex;
                      return (
                        <a
                          key={item.id}
                          id={`${listboxId}-${item.id}`}
                          href={`/components/${item.id}`}
                          role="option"
                          aria-selected={isActive}
                          className={`jh-command-dialog__item${isActive ? ' is-active' : ''}`}
                          onMouseEnter={() => setActiveIndex(flatIndex)}
                          onClick={() => { setOpen(false); setQuery(''); }}
                        >
                          <span className="jh-command-dialog__item-copy">
                            <span className="jh-command-dialog__item-label">{item.name}</span>
                            <span className="jh-command-dialog__item-hint">{item.tag}</span>
                          </span>
                          <CornerDownLeft size={12} strokeWidth={1.75} aria-hidden="true" />
                        </a>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="jh-financial-order__footer jh-command-dialog__footer">
            <span>{results.length} {results.length === 1 ? 'component' : 'components'}</span>
            <span>↑↓ navigate · ↵ open · Esc close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Header({ path }: { path: string }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  return <header className="library-header">
    <div className="library-header-inner">
      <a className="library-brand" href="/" aria-label="jhosephe, home"><Mark /><span>jhosephe<span className="library-brand-dot">.</span></span></a>
      <nav className="library-header-nav" aria-label="Main navigation"><a aria-current={path.startsWith('/components') ? 'page' : undefined} href="/components">Components</a><a href="/lab">Laboratory</a><a href="/solar">Solar <ArrowUpRight size={12} aria-hidden="true" /></a></nav>
      <div className="library-header-actions"><SearchDialog /><a className="jh-github-star" href="https://github.com/jhosephebtc/jhosephe" target="_blank" rel="noreferrer" aria-label="Star jhosephe on GitHub"><Star size={14} strokeWidth={1.75} aria-hidden="true" /><span>Star on GitHub</span></a><ThemeToggle /><button className="library-menu" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="library-mobile-nav" onClick={() => setMenu(!menu)}>{menu ? <X {...iconProps} /> : <Menu {...iconProps} />}</button><span className="library-version">v0.1</span></div>
    </div>
    {menu && <nav id="library-mobile-nav" className="library-mobile-nav" aria-label="Mobile navigation"><a href="/components">All components</a><a href="/installation">Installation</a><a href="/lab">Laboratory</a><a href="/solar">Solar panel</a><a className="jh-github-star library-mobile-star" href="https://github.com/jhosephebtc/jhosephe" target="_blank" rel="noreferrer" aria-label="Star jhosephe on GitHub"><Star size={14} strokeWidth={1.75} aria-hidden="true" /><span>Star on GitHub</span></a>{components.map(item => <a key={item.id} href={`/components/${item.id}`}>{item.name}</a>)}</nav>}
  </header>;
}

function Sidebar({ path }: { path: string }) {
  const entry = (href: string, label: string, icon?: ReactNode) => (
    <a href={href} aria-current={path === href ? 'page' : undefined}>
      {icon}
      <span>{label}</span>
      <span className="library-nav-dot" aria-hidden="true" />
    </a>
  );
  return <aside className="library-sidebar"><nav aria-label="Component library">
    <div className="library-nav-group"><p>Getting started</p>{entry('/components', 'Overview', <Grid2X2 {...iconProps} />)}{entry('/installation', 'Installation', <Code2 {...iconProps} />)}</div>
    {categories.filter(category => category !== 'All').map(category => <div className="library-nav-group" key={category}><p>{category}</p>{components.filter(item => item.category === category).map(item => <div key={item.id}>{entry(`/components/${item.id}`, item.name)}</div>)}</div>)}
    <div className="library-nav-group"><p>In context</p>{entry('/lab', 'Laboratory', <Grid2X2 {...iconProps} />)}{entry('/solar', 'Solar panel', <Sun {...iconProps} />)}</div>
  </nav><div className="library-sidebar-note"><span className="library-lens-dot" /><p>Made to be felt.<br /><span>Ready to be yours.</span></p></div></aside>;
}

function LinkButton({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a className={`jh-button jh-button--glass ${secondary ? 'jh-button--secondary' : 'jh-button--primary'} library-link-button`} href={href}><SmoothShape className="jh-button__face" radius={16} /><span className="jh-button__content">{children}</span></a>;
}

function InstrumentControl({ value, onChange, labelId, orientation = 'horizontal', accentColor, accentColorEnd, accentGradient, glowIntensity, glowBlur }: {
  value: number; onChange: (value: number) => void; labelId: string; orientation?: 'horizontal' | 'vertical';
  accentColor: string; accentColorEnd: string; accentGradient: boolean; glowIntensity: number; glowBlur: number;
}) {
  const control = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const vertical = orientation === 'vertical';
  const setFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = vertical
      ? Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
      : Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    onChange(Math.round(ratio * 100));
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: vertical ? -1 : 1, ArrowLeft: -1, ArrowDown: vertical ? 1 : -1, PageUp: 10, PageDown: -10 };
    if (event.key === 'Home') { event.preventDefault(); setDragging(true); onChange(0); return; }
    if (event.key === 'End') { event.preventDefault(); setDragging(true); onChange(100); return; }
    if (event.key in steps) { event.preventDefault(); setDragging(true); onChange(Math.max(0, Math.min(100, value + steps[event.key]))); }
  };
  return <div ref={control} className={`library-instrument-control${vertical ? ' is-vertical' : ''}`} data-dragging={dragging ? 'true' : undefined} role="slider" tabIndex={0} aria-labelledby={labelId} aria-orientation={orientation} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={`${value}%`} onKeyDown={onKeyDown} onKeyUp={() => setDragging(false)} onBlur={() => setDragging(false)} onPointerDown={event => { if (event.button !== 0) return; setDragging(true); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); setFromPointer(event); }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromPointer(event); }} onPointerUp={event => { setDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={event => { setDragging(false); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
    <InstrumentBars value={value} orientation={orientation} dragging={dragging} accentColor={accentColor} accentColorEnd={accentColorEnd} accentGradient={accentGradient} glowIntensity={glowIntensity} glowBlur={glowBlur} />
  </div>;
}

function SmoothCornerStudy({
  radius,
  smoothing,
  width,
  height,
  compact = false,
}: {
  radius: number;
  smoothing: number;
  width: number;
  height: number;
  compact?: boolean;
}) {
  const s = smoothing / 100;
  const maxW = compact ? 168 : width;
  const maxH = compact ? 118 : height;
  const scale = compact ? Math.min(1, maxW / Math.max(1, width), maxH / Math.max(1, height)) : 1;
  const renderW = Math.max(48, Math.round(width * scale));
  const renderH = Math.max(48, Math.round(height * scale));
  const effectiveOuterR = Math.min(Math.round(radius * scale), renderW / 2, renderH / 2);
  const outerPath = smoothPath({ width: renderW, height: renderH, radius: effectiveOuterR, smoothing: s });
  // True concentric geometry: inner corner radius equals max(0, outerRadius - inset)
  const inset = Math.max(12, Math.min(28, Math.round(Math.min(renderW, renderH) * 0.14)));
  const innerW = Math.max(24, renderW - inset * 2);
  const innerH = Math.max(24, renderH - inset * 2);
  const innerRadius = Math.max(0, effectiveOuterR - inset);
  const innerPath = smoothPath({ width: innerW, height: innerH, radius: innerRadius, smoothing: s });
  return (
    <div className="library-demo-shape" style={{ width: renderW, height: renderH }}>
      {/* Clip-path face so inset Glass-button face chrome follows the squircle */}
      <SmoothShape className="jh-glass-shape" radius={effectiveOuterR} smoothing={s} />
      <svg className="library-demo-shape__guides" viewBox={`0 0 ${renderW} ${renderH}`} aria-hidden="true">
        {/* No outer/specular strokes — those read as a black outline */}
        {innerPath && <path d={innerPath} transform={`translate(${inset} ${inset})`} className="library-demo-shape__inner" />}
      </svg>
      <span className="library-demo-shape__readout" aria-hidden="true">
        <span>{Math.round(smoothing)}%</span>
        <small>{width} × {height}</small>
      </span>
    </div>
  );
}

function Preview({ id, settings, onChange, compact = false }: { id: ComponentId; settings: Settings; onChange: (value: Partial<Settings>) => void; compact?: boolean }) {
  const labelId = useId();
  if (extraComponents.some(item => item.id === id)) return <ExtraPreview id={id} settings={settings} onChange={onChange} compact={compact} />;
  if (id === 'button') return <div className="library-demo-button"><Button variant={settings.variant} radius={settings.radius} smoothing={settings.smoothing / 100} liquid={settings.liquid} loading={settings.loading} disabled={settings.disabled}>{settings.label || 'Your button'}</Button></div>;
  if (id === 'slider') return <div className="library-demo-slider"><div className="library-demo-label"><span id={labelId}>Intensity</span><output>{settings.value}%</output></div><Slider labelId={labelId} value={[settings.value]} onValueChange={values => onChange({ value: values[0] })} thumbThickness={settings.thumbThickness} thumbHeight={settings.thumbHeight} thumbRadius={settings.thumbRadius} accentColor={settings.accentColor} accentColorEnd={settings.accentColorEnd} accentGradient={settings.accentGradient} glowIntensity={settings.glowIntensity} glowBlur={settings.glowBlur} max={100} step={1} disabled={settings.disabled} /><div className="library-demo-endpoints" aria-hidden="true"><span>0</span><span>100</span></div></div>;
  if (id === 'switch') return <div className="library-demo-switch"><div><label htmlFor={labelId}>Ambient light</label><span>{settings.checked ? 'The light is on' : 'The light is off'}</span></div><Switch id={labelId} checked={settings.checked} onCheckedChange={checked => onChange({ checked })} disabled={settings.disabled} /></div>;
  if (id === 'dial') return <div className="library-demo-dial"><Dial label="Adjust intensity" variant={settings.dialVariant} value={settings.value} onChange={value => onChange({ value })} accentColor={settings.accentColor} accentColorEnd={settings.accentColorEnd} accentGradient={settings.accentGradient} glowIntensity={settings.glowIntensity} glowBlur={settings.glowBlur} /><div><span>Intensity</span><output>{settings.value}<small>%</small></output></div></div>;
  if (id === 'dialog') return <Dialog><DialogTrigger asChild><Button size={compact ? 'small' : 'default'}>Review details <ArrowUpRight size={14} aria-hidden="true" /></Button></DialogTrigger><DialogContent material={settings.material === 'liquid' ? 'liquid-glass' : settings.material} className={`library-example-dialog jh-dialog--rich${settings.material === 'liquid' ? ' jh-surface--liquid' : ''}`}><span className="library-eyebrow">Workspace settings</span><DialogTitle>{settings.title || 'Your title'}</DialogTitle><DialogDescription>{settings.description}</DialogDescription><div className="jh-dialog-summary"><div className="jh-dialog-summary__row"><span>Workspace</span><strong>Northstar Studio</strong></div><div className="jh-dialog-summary__row"><span>Plan</span><strong>Professional</strong></div><div className="jh-dialog-summary__row"><span>Renewal</span><strong>December 1, 2026</strong></div></div><div className="jh-dialog-actions"><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><DialogClose asChild><Button variant="primary">Save changes <Check {...iconProps} /></Button></DialogClose></div></DialogContent></Dialog>;
  if (id === 'smooth-shape') return <SmoothCornerStudy radius={settings.radius} smoothing={settings.smoothing} width={settings.shapeWidth} height={settings.shapeHeight} compact={compact} />;
  if (id === 'shader-surface') return <div className="library-demo-shader"><ShaderSurface /><div style={{ ['--jh-glass-alpha' as string]: String(settings.opacity / 100), backdropFilter: `blur(${settings.blur}px)` }} className="library-demo-glass">Light in layers<span aria-hidden="true">↗</span></div></div>;
  return <div className={`library-demo-instrument${settings.instrumentOrientation === 'vertical' ? ' is-vertical' : ''}`}><div className="library-demo-label"><span id={labelId}>Intensity</span><span className="library-live-dot">Live</span></div><output>{settings.value}<small>%</small></output><InstrumentControl value={settings.value} onChange={value => onChange({ value })} labelId={labelId} orientation={settings.instrumentOrientation} accentColor={settings.accentColor} accentColorEnd={settings.accentColorEnd} accentGradient={settings.accentGradient} glowIntensity={settings.glowIntensity} glowBlur={settings.glowBlur} /></div>;
}

function Tile({ item, index = 0 }: { item: ComponentInfo; index?: number }) {
  const [settings, setSettings] = useState(settingsFor(item.id));
  return <article className={`library-card library-card--${item.id}`}>
    <div className={`library-card-preview${settings.material === 'liquid' ? ' is-liquid-stage' : settings.material === 'liquid-glass' ? ' is-glass-stage' : ''}`} data-jh-material={settings.material} role="group" aria-label={`${item.name} interactive preview`}>{settings.material === 'liquid' && <div className="library-material-backdrop" aria-hidden="true"><ShaderSurface /></div>}<span className="library-card-index">{String(index + 1).padStart(2, '0')}</span><Preview id={item.id} settings={settings} onChange={patch => setSettings(old => ({ ...old, ...patch }))} compact /></div>
    <div className="library-card-copy"><div><h2><a href={`/components/${item.id}`}>{item.name}</a></h2><p>{item.description}</p></div><ArrowUpRight {...iconProps} /></div>
    <span className="library-card-tag">{item.tag}</span>
  </article>;
}

function Landing() {
  return <main tabIndex={-1} id="library-main" className="library-landing">
    <section className="library-hero"><div className="library-eyebrow"><span className="library-lens-dot" /> A library for the senses</div><h1>Small details.<br /><span>Lasting impressions.</span></h1><p>Components made of glass, light, and motion.<br />Customize, copy, and shape your next interface.</p><div className="library-hero-actions"><LinkButton href="/components">Explore components <ArrowRight {...iconProps} /></LinkButton><a className="library-text-link" href="/installation">How to install <ArrowUpRight {...iconProps} /></a></div><div className="library-tech-note"><span>React + TypeScript</span><i /><span>CSS you can make your own</span><i /><span>shadcn compatible</span></div></section>
    <section className="library-featured" aria-label="Interactive components"><div className="library-section-head"><div><span className="library-eyebrow">Explore the collection</span><h2>Every detail, ready to use.</h2></div><a className="library-text-link" href="/components">Browse all {components.length} components <ArrowRight {...iconProps} /></a></div><div className="library-card-grid">{components.map((item, index) => <Tile key={item.id} item={item} index={index} />)}</div></section>
    <section className="library-solar-feature"><div><span className="library-eyebrow">The language in context</span><h2>One interface.<br />The rhythm of a day.</h2><p>A solar instrument that follows the light at your location. Built with the same attention to detail.</p><LinkButton href="/solar">Open solar panel <ArrowUpRight {...iconProps} /></LinkButton></div><a href="/solar" className="library-solar-art"><svg viewBox="0 0 600 250" fill="none" aria-hidden="true"><path className="library-solar-art-horizon" d="M35 190H565" /><path className="library-solar-art-arc" d="M35 190Q300 -110 565 190" /><path className="library-solar-art-ray" d="M300 48v142" strokeDasharray="2 7" /><circle cx="300" cy="40" r="16" className="library-solar-art-sun" /><circle cx="300" cy="40" r="5" className="library-solar-art-core" fill="currentColor" />{Array.from({ length: 47 }, (_, i) => <path key={i} className="library-solar-art-ticks" d={`M${47 + i * 11} 206v${i % 4 === 0 ? 14 : 7}`} strokeWidth=".7" />)}<text x="35" y="175">East</text><text x="530" y="175">West</text></svg><span>Solar study / 002</span></a></section>
    <section className="library-principles"><div><span>01</span><h3>Choose a detail.</h3><p>Explore controls and surfaces in a consistent visual language.</p></div><div><span>02</span><h3>Find your balance.</h3><p>Adjust shape, intensity, and behavior. Watch every detail respond.</p></div><div><span>03</span><h3>Make it part of your project.</h3><p>Install with the CLI or copy the code. The implementation is yours.</p></div></section>
  </main>;
}

function Catalog() {
  const [category, setCategory] = useState<string>('All');
  const [query, setQuery] = useState('');
  const filtered = components.filter(item => (category === 'All' || category === item.category) && matches(item, query));
  return <main tabIndex={-1} id="library-main" className="library-main"><div className="library-breadcrumb">Library <ChevronRight size={12} aria-hidden="true" /> Components</div><div className="library-page-heading"><span className="library-eyebrow">Made to be yours</span><h1>Components<span className="library-heading-count">{String(components.length).padStart(2, '0')}</span></h1><p>A little glass. A precise response.<br />Considered details, ready for your next idea.</p></div>
    <div className="library-catalog-toolbar"><div className="library-filter" aria-label="Filter by category">{categories.map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><SearchInput label="Filter components" value={query} onValueChange={setQuery} placeholder="Find a component…" /></div>
    <div className="library-results-note" role="status">{filtered.length} {filtered.length === 1 ? 'component' : 'components'}</div>
    {filtered.length ? <div className="library-card-grid">{filtered.map(item => <Tile key={item.id} item={item} index={components.indexOf(item)} />)}</div> : <div className="library-empty"><Search size={26} strokeWidth={1.3} aria-hidden="true" /><h2>No details here yet.</h2><p>Try another name or explore all categories.</p><Button onClick={() => { setCategory('All'); setQuery(''); }}>Clear filters</Button></div>}
    <div className="library-catalog-bottom"><span>Small pieces. Open possibilities.</span><a href="/lab">See everything in context <ArrowUpRight {...iconProps} /></a></div>
  </main>;
}

function RangeField({ label, value, min = 0, max = 100, unit = '', onChange }: { label: string; value: number; min?: number; max?: number; unit?: string; onChange: (value: number) => void }) {
  const id = useId();
  return <div className="library-control-field"><div><span id={id}>{label}</span><output>{value}{unit}</output></div><Slider labelId={id} value={[value]} min={min} max={max} step={1} onValueChange={values => onChange(values[0])} /></div>;
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return <div className="library-toggle-field"><label htmlFor={id}>{label}</label><Switch id={id} checked={checked} onCheckedChange={onChange} /></div>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const selected = options.find(option => option.value === value) ?? options[0];
  return <label className="library-text-field">{label}<DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger className="library-select-trigger" aria-label={label}><span>{selected.label}</span><ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" /></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content className="library-select-menu" align="start" sideOffset={5}>
      <DropdownMenu.Label className="library-select-label">{label}</DropdownMenu.Label>
      <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>{options.map(option => <DropdownMenu.RadioItem key={option.value} className="library-select-item" value={option.value}><span>{option.label}</span></DropdownMenu.RadioItem>)}</DropdownMenu.RadioGroup>
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root></label>;
}

function Customizer({ id, settings: s, change, reset }: { id: ComponentId; settings: Settings; change: (value: Partial<Settings>) => void; reset: () => void }) {
  return <section className="library-customizer" aria-labelledby="customizer-title"><div className="library-customizer-head"><h2 id="customizer-title">Make it your own.</h2><button aria-label="Reset settings" onClick={reset}><RotateCcw {...iconProps} /></button></div><p>The code follows every adjustment.</p>
    <RangeField label="Transparency" value={s.surfaceTransparency} min={0} max={85} unit="%" onChange={surfaceTransparency => change({ surfaceTransparency })} />
    <RangeField label="Blur" value={s.surfaceBlur} min={0} max={32} unit=" px" onChange={surfaceBlur => change({ surfaceBlur })} />
    {id === 'button' && <><label className="library-text-field">Label<input value={s.label} maxLength={60} onChange={event => change({ label: event.target.value })} /></label><SelectField label="Variant" value={s.variant} options={[{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'ghost', label: 'Ghost' }, { value: 'working', label: 'Working' }]} onChange={variant => change({ variant: variant as Settings['variant'] })} /><RangeField label="Corner radius" value={s.radius} max={32} unit=" px" onChange={radius => change({ radius })} /><RangeField label="Corner smoothness" value={s.smoothing} unit="%" onChange={smoothing => change({ smoothing })} /><ToggleField label="Liquid feedback" checked={s.liquid} onChange={liquid => change({ liquid })} /><ToggleField label="Working / loading" checked={s.loading} onChange={loading => change({ loading })} /></>}
    {['slider', 'dial', 'instrument', 'bar-slider'].includes(id) && <RangeField label="Value" value={s.value} unit="%" onChange={value => change({ value })} />}
    {id === 'dial' && <SelectField label="Edition" value={s.dialVariant} options={[{ value: 'classic', label: 'Classic' }, { value: 'arc', label: 'Arc ring' }, { value: 'vernier', label: 'Vernier' }, { value: 'monolith', label: 'Monolith' }]} onChange={dialVariant => change({ dialVariant: dialVariant as Settings['dialVariant'] })} />}
    {id === 'instrument' && <SelectField label="Orientation" value={s.instrumentOrientation} options={[{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]} onChange={instrumentOrientation => change({ instrumentOrientation: instrumentOrientation as Settings['instrumentOrientation'] })} />}
    {['slider', 'bar-slider', 'dial', 'instrument', 'tactile-lever', 'audio-meter'].includes(id) && <>{(id !== 'audio-meter' || s.audioColorScale === 'accent') && <><div className="library-palette-setting"><span>Accent light</span><OklchPalette label="Choose the accent light color" value={s.accentColor} onValueChange={accentColor => change({ accentColor })} material={s.material} /></div><ToggleField label="Accent gradient" checked={s.accentGradient} onChange={accentGradient => change({ accentGradient })} />{s.accentGradient && <div className="library-palette-setting"><span>Gradient end</span><OklchPalette label="Choose the gradient end color" value={s.accentColorEnd} onValueChange={accentColorEnd => change({ accentColorEnd })} material={s.material} /></div>}</>}<RangeField label="Glow intensity" value={s.glowIntensity} unit="%" onChange={glowIntensity => change({ glowIntensity })} /><RangeField label="Glow blur" value={s.glowBlur} max={16} unit=" px" onChange={glowBlur => change({ glowBlur })} /></>}
    {['attitude-indicator', 'navigation-instrument', 'compass', 'race-telemetry', 'weather-instrument', 'weather-conditions', 'wind-instrument', 'tide-instrument', 'financial-chart', 'market-picker', 'currency-picker', 'metric-card', 'astronomy-instrument', 'astrology-wheel', 'lunar-ephemeris'].includes(id) && <div className="library-palette-setting"><span>Accent light</span><OklchPalette label="Choose the accent light color" value={s.accentColor} onValueChange={accentColor => change({ accentColor })} material={s.material} /></div>}
    {['slider', 'bar-slider'].includes(id) && <><RangeField label="Thumb thickness" value={s.thumbThickness} min={8} max={30} unit=" px" onChange={thumbThickness => change({ thumbThickness })} /><RangeField label="Thumb height" value={s.thumbHeight} min={20} max={58} unit=" px" onChange={thumbHeight => change({ thumbHeight })} /><RangeField label="Thumb corner radius" value={s.thumbRadius} min={0} max={18} unit=" px" onChange={thumbRadius => change({ thumbRadius })} /></>}
    {id === 'progress-bar' && <RangeField label="Progress" value={s.progressValue} unit="%" onChange={progressValue => change({ progressValue })} />}
    {id === 'switch' && <ToggleField label="Enabled" checked={s.checked} onChange={checked => change({ checked })} />}
    {['button', 'slider', 'switch', 'bar-slider', 'date-picker', 'input', 'search-input'].includes(id) && <ToggleField label="Disabled" checked={s.disabled} onChange={disabled => change({ disabled })} />}
    {['dialog', 'toast', 'data-form'].includes(id) && <><label className="library-text-field">Title<input value={s.title} maxLength={80} onChange={event => change({ title: event.target.value })} /></label><label className="library-text-field">Description<textarea rows={4} value={s.description} maxLength={240} onChange={event => change({ description: event.target.value })} /></label></>}
    {id === 'smooth-shape' && (
      <>
        <RangeField label="Radius" value={s.radius} max={90} unit=" px" onChange={radius => change({ radius })} />
        <RangeField label="Smoothing" value={s.smoothing} unit="%" onChange={smoothing => change({ smoothing })} />
        <SelectField
          label="Aspect ratio"
          value={s.shapeAspect}
          options={[
            { value: 'custom', label: 'Custom' },
            { value: '1:1', label: '1:1 Square' },
            { value: '4:3', label: '4:3 Studio' },
            { value: '16:9', label: '16:9 Wide' },
            { value: '3:4', label: '3:4 Portrait' },
          ]}
          onChange={value => {
            const aspect = value as Settings['shapeAspect'];
            if (aspect === 'custom') { change({ shapeAspect: aspect }); return; }
            const [rw, rh] = aspect.split(':').map(Number);
            const nextHeight = Math.max(96, Math.min(260, Math.round((s.shapeWidth * rh) / rw)));
            change({ shapeAspect: aspect, shapeHeight: nextHeight });
          }}
        />
        <RangeField
          label="Width"
          value={s.shapeWidth}
          min={96}
          max={320}
          unit=" px"
          onChange={shapeWidth => {
            if (s.shapeAspect === 'custom') { change({ shapeWidth }); return; }
            const [rw, rh] = s.shapeAspect.split(':').map(Number);
            const shapeHeight = Math.max(96, Math.min(260, Math.round((shapeWidth * rh) / rw)));
            change({ shapeWidth, shapeHeight });
          }}
        />
        <RangeField
          label="Height"
          value={s.shapeHeight}
          min={96}
          max={260}
          unit=" px"
          onChange={shapeHeight => {
            if (s.shapeAspect === 'custom') { change({ shapeHeight }); return; }
            const [rw, rh] = s.shapeAspect.split(':').map(Number);
            const shapeWidth = Math.max(96, Math.min(320, Math.round((shapeHeight * rw) / rh)));
            change({ shapeWidth, shapeHeight });
          }}
        />
      </>
    )}
    {id === 'scroll-area' && (
      <SelectField
        label="Columns"
        value={String(s.scrollColumns)}
        options={[
          { value: '1', label: '1 column' },
          { value: '2', label: '2 columns' },
          { value: '3', label: '3 columns' },
        ]}
        onChange={value => change({ scrollColumns: Number(value) as 1 | 2 | 3 })}
      />
    )}
    {id === 'financial-order-modal' && (
      <SelectField
        label="Variant"
        value={s.orderVariant}
        options={[
          { value: 'order', label: 'Order review' },
          { value: 'image-generation', label: 'Image generation' },
        ]}
        onChange={orderVariant => change({ orderVariant: orderVariant as Settings['orderVariant'] })}
      />
    )}
    {id === 'shader-surface' && <><RangeField label="Glass opacity" value={s.opacity} min={15} max={95} unit="%" onChange={opacity => change({ opacity })} /><RangeField label="Blur" value={s.blur} max={32} unit=" px" onChange={blur => change({ blur })} /></>}
    {['calendar', 'date-picker'].includes(id) && <label className="library-text-field">Selected date<input type="date" value={s.date} onChange={event => change({ date: event.target.value })} /></label>}
    {id === 'calendar' && <><ToggleField label="Outside days" checked={s.showOutsideDays} onChange={showOutsideDays => change({ showOutsideDays })} /><ToggleField label="Monday first" checked={s.mondayFirst} onChange={mondayFirst => change({ mondayFirst })} /></>}
    {['menu', 'context-menu'].includes(id) && <SelectField label="Alignment" value={s.align} options={[{ value: 'start', label: 'Start' }, { value: 'end', label: 'End' }]} onChange={align => change({ align: align as Settings['align'] })} />}
    {id === 'radio-group' && <SelectField label="Billing frequency" value={s.radioValue} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} onChange={radioValue => change({ radioValue })} />}
    {id === 'segmented-control' && <SelectField label="Selected view" value={s.segmentValue} options={[{ value: 'map', label: 'Map' }, { value: 'list', label: 'List' }, { value: 'saved', label: 'Saved' }]} onChange={segmentValue => change({ segmentValue })} />}
    {id === 'tactile-key' && <><ToggleField label="Pressed" checked={s.keyPressed} onChange={keyPressed => change({ keyPressed })} /><SelectField label="Key shape" value={s.keyShape} options={[{ value: 'pad', label: 'Square pad' }, { value: 'dish', label: 'Concave dish' }, { value: 'circle', label: 'Round cap' }, { value: 'pill', label: 'Wide pill' }]} onChange={keyShape => change({ keyShape: keyShape as Settings['keyShape'] })} /><SelectField label="Cap tone" value={s.keyTone} options={[{ value: 'surface', label: 'Matching chassis' }, { value: 'contrast', label: 'Monochrome contrast' }]} onChange={keyTone => change({ keyTone: keyTone as Settings['keyTone'] })} /><SelectField label="Pinhole LED" value={s.keyLedPosition} options={[{ value: 'bottom', label: 'Bottom' }, { value: 'center', label: 'Center top' }, { value: 'top-left', label: 'Top left' }, { value: 'top-right', label: 'Top right' }, { value: 'none', label: 'None' }]} onChange={keyLedPosition => change({ keyLedPosition: keyLedPosition as Settings['keyLedPosition'] })} /><div className="library-palette-setting"><span>LED accent</span><OklchPalette label="Choose the key LED accent" value={s.keyAccentColor} onValueChange={keyAccentColor => change({ keyAccentColor })} /></div></>}
    {id === 'tactile-keypad' && <><SelectField label="Deck layout" value={s.keypadLayout} options={[{ value: 'keyboard', label: 'Chromatic keyboard' }, { value: 'sequencer', label: '16-step sequencer' }, { value: 'command', label: 'Compact command' }]} onChange={keypadLayout => change({ keypadLayout: keypadLayout as Settings['keypadLayout'] })} /><div className="library-palette-setting"><span>Pin LED accent</span><OklchPalette label="Choose the keypad LED accent" value={s.keyAccentColor} onValueChange={keyAccentColor => change({ keyAccentColor })} /></div></>}
    {id === 'tactile-console' && <div className="library-palette-setting"><span>Console accent</span><OklchPalette label="Choose the console ring accent" value={s.keyAccentColor} onValueChange={keyAccentColor => change({ keyAccentColor })} /></div>}
    {id === 'camera-wheel' && <><SelectField label="Optical scale" value={s.cameraMode} options={[{ value: 'ev', label: 'Third-stop EV ruler' }, { value: 'aperture', label: 'Aperture (f/)' }, { value: 'iso', label: 'ISO sensitivity' }, { value: 'shutter', label: 'Shutter speed' }]} onChange={cameraMode => change({ cameraMode: cameraMode as Settings['cameraMode'] })} /><SelectField label="Orientation" value={s.cameraOrientation} options={[{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical barrel' }]} onChange={cameraOrientation => change({ cameraOrientation: cameraOrientation as Settings['cameraOrientation'] })} /><div className="library-palette-setting"><span>Needle accent</span><OklchPalette label="Choose the camera needle accent" value={s.keyAccentColor} onValueChange={keyAccentColor => change({ keyAccentColor })} /></div></>}
    {id === 'camera-dial' && <><SelectField label="Turret type" value={s.cameraDialVariant} options={[{ value: 'exposure', label: 'GF670 Exposure + ISO' }, { value: 'film', label: 'Fujifilm Film Dial' }]} onChange={cameraDialVariant => change({ cameraDialVariant: cameraDialVariant as Settings['cameraDialVariant'] })} /><div className="library-palette-setting"><span>Datum accent</span><OklchPalette label="Choose the dial datum accent" value={s.keyAccentColor} onValueChange={keyAccentColor => change({ keyAccentColor })} /></div></>}
    {id === 'filmstrip-gallery' && <div className="library-palette-setting"><span>Gate LED accent</span><OklchPalette label="Choose the film gate accent" value={s.keyAccentColor} onValueChange={keyAccentColor => change({ keyAccentColor })} /></div>}
    {id === 'compass' && <RangeField label="Heading" value={s.compassHeading} max={359} unit="°" onChange={compassHeading => change({ compassHeading })} />}
    {id === 'spectrum-control' && <><SelectField label="Opening position" value={s.spectrumSide} options={[{ value: 'bottom', label: 'Bottom' }, { value: 'top', label: 'Top' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]} onChange={spectrumSide => change({ spectrumSide: spectrumSide as Settings['spectrumSide'] })} /><RangeField label="Hue" value={s.spectrumHue} max={360} unit="°" onChange={spectrumHue => change({ spectrumHue })} /><RangeField label="Saturation" value={s.spectrumSaturation} unit="%" onChange={spectrumSaturation => change({ spectrumSaturation })} /><RangeField label="Lightness" value={s.spectrumLightness} min={8} max={92} unit="%" onChange={spectrumLightness => change({ spectrumLightness })} /></>}
    {id === 'step-navigation' && <RangeField label="Current step" value={s.stepIndex + 1} min={1} max={3} onChange={step => change({ stepIndex: step - 1 })} />}
    {id === 'toast' && <RangeField label="Duration" value={s.duration / 1000} min={2} max={10} unit=" s" onChange={duration => change({ duration: duration * 1000 })} />}
    {id === 'gallery' && <><ToggleField label="Captions" checked={s.showCaptions} onChange={showCaptions => change({ showCaptions })} /><ToggleField label="Indicators" checked={s.showIndicators} onChange={showIndicators => change({ showIndicators })} /></>}
    {id === 'audio-meter' && <><SelectField label="Grid orientation" value={s.audioOrientation} options={[{ value: 'horizontal', label: 'Horizontal bands' }, { value: 'vertical', label: 'Vertical bands' }]} onChange={audioOrientation => change({ audioOrientation: audioOrientation as Settings['audioOrientation'] })} /><SelectField label="Decibel color scale" value={s.audioColorScale} options={[{ value: 'accent', label: 'Accent color' }, { value: 'heat', label: 'Heat gradient' }, { value: 'pastel', label: 'Pastel gradient' }]} onChange={audioColorScale => change({ audioColorScale: audioColorScale as Settings['audioColorScale'] })} /></>}
    {id === 'weather-instrument' && <><RangeField label="Temperature" value={s.weatherTemperature} min={-20} max={45} unit="°C" onChange={weatherTemperature => change({ weatherTemperature })} /><RangeField label="Wind speed" value={s.weatherWindSpeed} max={120} unit=" km/h" onChange={weatherWindSpeed => change({ weatherWindSpeed })} /><RangeField label="Wind direction" value={s.weatherWindDirection} max={359} unit="°" onChange={weatherWindDirection => change({ weatherWindDirection })} /></>}
    {id === 'attitude-indicator' && <><RangeField label="Pitch" value={s.attitudePitch} min={-45} max={45} unit="°" onChange={attitudePitch => change({ attitudePitch })} /><RangeField label="Roll" value={s.attitudeRoll} min={-90} max={90} unit="°" onChange={attitudeRoll => change({ attitudeRoll })} /></>}
    {id === 'navigation-instrument' && <><SelectField label="Instrument mode" value={s.navigationMode} options={[{ value: 'marine', label: 'Marine' }, { value: 'aviation', label: 'Aviation' }]} onChange={navigationMode => change({ navigationMode: navigationMode as Settings['navigationMode'] })} /><RangeField label="Heading" value={s.navigationHeading} max={359} unit="°" onChange={navigationHeading => change({ navigationHeading })} /><RangeField label="Speed" value={s.navigationSpeed} max={220} onChange={navigationSpeed => change({ navigationSpeed })} /><RangeField label={s.navigationMode === 'marine' ? 'Depth' : 'Altitude'} value={s.navigationAuxiliary} max={12000} unit={s.navigationMode === 'marine' ? ' m' : ' ft'} onChange={navigationAuxiliary => change({ navigationAuxiliary })} /></>}
    {id === 'accordion' && <ToggleField label="Open first section" checked={s.accordionOpen} onChange={accordionOpen => change({ accordionOpen })} />}
    {id === 'detent-dial' && <RangeField label="Selected detent" value={s.detentIndex + 1} min={1} max={3} onChange={position => change({ detentIndex: position - 1 })} />}
    {id === 'tactile-lever' && <RangeField label="Lever position" value={s.leverValue} unit="%" onChange={leverValue => change({ leverValue })} />}
    {id === 'image-frame' && <><label className="library-text-field">Image URL<input value={s.imageSrc} maxLength={240} onChange={event => change({ imageSrc: event.target.value })} placeholder="/images/your-image.jpg" /></label><label className="library-text-field">Alternative text<input value={s.imageAlt} maxLength={120} onChange={event => change({ imageAlt: event.target.value })} /></label><label className="library-text-field">Caption<input value={s.imageCaption} maxLength={100} onChange={event => change({ imageCaption: event.target.value })} /></label></>}
    {['input', 'search-input'].includes(id) && <><label className="library-text-field">Placeholder<input value={s.placeholder} maxLength={80} onChange={event => change({ placeholder: event.target.value })} /></label>{id === 'input' && <label className="library-text-field">Field label<input value={s.inputLabel} maxLength={60} onChange={event => change({ inputLabel: event.target.value })} /></label>}<label className="library-text-field">Value<input value={s.text} maxLength={200} onChange={event => change({ text: event.target.value })} /></label></>}
    <div className="library-customizer-note"><span className="library-lens-dot" /><span>Glass. Light. Your intention.</span></div>
  </section>;
}

function CopyButton({ value, label = 'Copy', className = '' }: { value: string; label?: string; className?: string }) {
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setStatus('ok'); }
    catch { setStatus('error'); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2800);
  };
  return <div className={`library-copy-wrap ${className}`}><button className="library-copy" onClick={copy} aria-label={label}>{status === 'ok' ? <Check {...iconProps} /> : <Copy {...iconProps} />}<span>{status === 'ok' ? 'Copied' : label}</span></button><span className="library-sr" role="status">{status === 'ok' ? 'Copied to clipboard.' : ''}</span>{status === 'error' && <span className="library-copy-error" role="alert">Couldn’t copy. Select the text and copy it manually.</span>}</div>;
}

function CodeBlock({ value, title }: { value: string; title: string }) {
  return <div className="library-code-block"><div className="library-code-toolbar"><span>{title}</span><CopyButton value={value} label="Copy code" /></div><pre tabIndex={0} aria-label={title}><code>{value}</code></pre></div>;
}

interface RegistryFile { path: string; content: string; target: string; type: string }
interface RegistryItem { name: string; dependencies: string[]; files: RegistryFile[] }

function SourceCode({ id }: { id: ComponentId }) {
  const [item, setItem] = useState<RegistryItem | null>(null);
  const [file, setFile] = useState(0);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setItem(null); setError(false); setFile(0);
    fetch(`/r/${id}.json`, { signal: abort.signal }).then(response => { if (!response.ok) throw new Error('Registry unavailable'); return response.json(); }).then(value => {
      if (!Array.isArray(value.files) || !value.files.length || value.files.some((entry: RegistryFile) => typeof entry.content !== 'string')) throw new Error('Invalid registry');
      setItem(value);
    }).catch(reason => { if (reason.name !== 'AbortError') setError(true); });
    return () => abort.abort();
  }, [id, retry]);
  if (error) return <div className="library-source-message" role="alert"><p>Couldn’t load the source files.</p><Button onClick={() => setRetry(value => value + 1)}>Try again</Button></div>;
  if (!item) return <p className="library-source-message" role="status">Loading source…</p>;
  const selected = item.files[file];
  return <div className="library-source"><label className="library-file-select">File<select value={file} onChange={event => setFile(Number(event.target.value))}>{item.files.map((entry, index) => <option key={entry.path} value={index}>{entry.path.split('/').pop()}</option>)}</select></label><CodeBlock title={selected.target} value={selected.content} /><p className="library-code-footnote">These are the files delivered by the installation command. Local imports stay together in components/jhosephe.</p></div>;
}

function InstallationCommand({ id }: { id: ComponentId }) {
  const url = `${window.location.origin}/r/${id}.json`;
  const command = `npx shadcn@latest add ${url}`;
  return <div className="library-command"><code>{command}</code><CopyButton value={command} label="Copy command" /></div>;
}

function ComponentPage({ item }: { item: ComponentInfo }) {
  const [settings, setSettings] = useState<Settings>(settingsFor(item.id));
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [narrow, setNarrow] = useState(false);
  const [source, setSource] = useState(false);
  const { surfaceTransparency, setSurfaceTransparency, surfaceBlur, setSurfaceBlur, resetSurface } = useJhosepheTheme();
  const effectiveSettings = useMemo(
    () => ({ ...settings, surfaceTransparency, surfaceBlur }),
    [settings, surfaceTransparency, surfaceBlur],
  );
  const change = (patch: Partial<Settings>) => {
    if (patch.surfaceTransparency !== undefined) setSurfaceTransparency(patch.surfaceTransparency);
    if (patch.surfaceBlur !== undefined) setSurfaceBlur(patch.surfaceBlur);
    setSettings(old => ({ ...old, ...patch }));
  };
  const index = components.indexOf(item);
  const next = components[(index + 1) % components.length];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasSurfaceEffect = surfaceTransparency > 0 || surfaceBlur > 0;
  const surfaceAlpha = Number(((100 - surfaceTransparency) / 100).toFixed(3));
  const surfaceVars = hasSurfaceEffect
    ? ({
        '--jh-surface-alpha': String(surfaceAlpha),
        '--jh-surface-blur': `${surfaceBlur}px`,
      } as CSSProperties)
    : undefined;

  return <main tabIndex={-1} id="library-main" className="library-main library-detail"><div className="library-breadcrumb"><a href="/components">Components</a><ChevronRight size={12} aria-hidden="true" /><span>{item.name}</span></div><div className="library-page-heading"><span className="library-eyebrow">{item.category} / {item.tag}</span><h1>{item.name}</h1><p>{item.detail}</p></div>
    <div className="library-detail-toolbar"><div role="tablist" aria-label="Component view" className="library-tabs">{(['preview', 'code'] as const).map((value, i) => <button key={value} ref={element => { tabRefs.current[i] = element; }} id={`tab-${value}`} aria-controls={`panel-${value}`} role="tab" tabIndex={tab === value ? 0 : -1} aria-selected={tab === value} onClick={() => setTab(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const target = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - i; setTab(target === 0 ? 'preview' : 'code'); tabRefs.current[target]?.focus(); } }}>{value === 'preview' ? <><Monitor {...iconProps} />Preview</> : <><Code2 {...iconProps} />Code</>}</button>)}</div>{tab === 'preview' && <div className="library-view-toggle" aria-label="Preview width"><button aria-label="Wide preview" aria-pressed={!narrow} onClick={() => setNarrow(false)}><Monitor {...iconProps} /></button><button aria-label="Compact preview" aria-pressed={narrow} onClick={() => setNarrow(true)}><Smartphone {...iconProps} /></button></div>}</div>
    <div className="library-playground">
      <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" hidden={tab !== 'preview'} tabIndex={0}><div className={`library-preview-stage library-preview-stage--${item.id} ${narrow ? 'is-narrow' : ''}`}><span className="library-preview-caption">{item.tag} / Interactive</span><div className="library-preview-object" data-jh-material={effectiveSettings.material} data-jh-surface-custom={hasSurfaceEffect ? 'true' : undefined} style={surfaceVars}><Preview id={item.id} settings={effectiveSettings} onChange={change} /></div><span className="library-preview-hint">{item.id === 'instrument' ? 'Drag across the bars or use the arrow keys.' : item.id === 'shader-surface' ? 'Light adapts to your device’s motion preferences.' : hasSurfaceEffect ? 'Adjust Transparency and Blur to inspect translucent backdrop diffusion.' : 'Try a touch. Feel the response.'}</span></div></div>
      <div id="panel-code" role="tabpanel" aria-labelledby="tab-code" hidden={tab !== 'code'} tabIndex={0}><div className="library-code-switch"><button aria-pressed={!source} onClick={() => setSource(false)}>Your configuration</button><button aria-pressed={source} onClick={() => setSource(true)}>Component files</button></div>{tab === 'code' && (source ? <SourceCode id={item.id} /> : <CodeBlock title="example.tsx" value={usage(item.id, effectiveSettings)} />)}</div>
      <Customizer id={item.id} settings={effectiveSettings} change={change} reset={() => { setSettings(settingsFor(item.id)); resetSurface(); }} />
    </div>
    {item.id === 'dial' && (
      <section className="library-dial-versions" aria-labelledby="dial-versions-heading">
        <div className="library-section-label"><span>Editions</span><h2 id="dial-versions-heading">Four tactile studies.</h2></div>
        <div className="library-dial-versions-grid">
          {([
            ['classic', '01 / Classic', 'Recessed 25-tick orbital groove with jewel slot'],
            ['arc', '02 / Arc ring', 'Continuous fiber-optic channel gauge with datum ticks'],
            ['vernier', '03 / Vernier', 'Knurled instrument collar and 37-step precision scale'],
            ['monolith', '04 / Monolith', 'Flush sunken puck with concealed under-rim halo'],
          ] as const).map(([variantId, title, caption]) => (
            <div
              key={variantId}
              className={`library-dial-version-card${settings.dialVariant === variantId ? ' is-selected' : ''}`}
              data-jh-material={settings.material}
              data-jh-surface-custom={hasSurfaceEffect ? 'true' : undefined}
              style={surfaceVars}
            >
              <div className="library-dial-version-stage" onPointerDown={() => change({ dialVariant: variantId })}>
                <Dial
                  label={`${title} tactile dial`}
                  variant={variantId}
                  value={settings.value}
                  onChange={value => change({ value, dialVariant: variantId })}
                  accentColor={settings.accentColor}
                  accentColorEnd={settings.accentColorEnd}
                  accentGradient={settings.accentGradient}
                  glowIntensity={settings.glowIntensity}
                  glowBlur={settings.glowBlur}
                />
              </div>
              <button
                type="button"
                className="library-dial-version-meta"
                aria-pressed={settings.dialVariant === variantId}
                onClick={() => change({ dialVariant: variantId })}
              >
                <strong>{title}</strong>
                <span>{caption}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    )}
    <section className="library-install-section" aria-labelledby="install-heading"><div className="library-section-label"><span>01</span><h2 id="install-heading">Bring it into your project.</h2></div><p>With React and shadcn initialized, run the command. The source and styles become part of your project.</p><InstallationCommand id={item.id} /><a className="library-text-link" href="/installation">First time? Start with installation <ArrowUpRight {...iconProps} /></a></section>
    <section className="library-props-section" aria-labelledby="props-heading"><div className="library-section-label"><span>02</span><h2 id="props-heading">The details you can adjust.</h2></div><div className="library-table-scroll" tabIndex={0} aria-label="Component properties"><table><thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead><tbody>{item.props.map(([name, type, value, description]) => <tr key={name}><td>{name}</td><td>{type}</td><td>{value}</td><td>{description}</td></tr>)}</tbody></table></div></section>
    <nav className="library-detail-footer" aria-label="More components"><a href="/components"><ArrowLeft {...iconProps} />All components</a><a href={`/components/${next.id}`}><span>Next<strong>{next.name}</strong></span><ArrowRight {...iconProps} /></a></nav>
  </main>;
}

function Installation() {
  return <main tabIndex={-1} id="library-main" className="library-main library-install-page"><div className="library-breadcrumb">Getting started <ChevronRight size={12} aria-hidden="true" /> Installation</div><div className="library-page-heading"><span className="library-eyebrow">From the library to your project</span><h1>Yours to build with.</h1><p>Components that live in your code.<br />Install what you need. Make every detail your own.</p></div><section><span className="library-step">01 / Prepare</span><h2>A React project, ready to begin.</h2><p>Use React with TypeScript in Next.js or Vite. Initialize shadcn to set up aliases and components.json.</p><CodeBlock title="Terminal" value="npx shadcn@latest init" /><p>Already using shadcn? Skip this step. See the <a href="https://ui.shadcn.com/docs/installation" target="_blank" rel="noreferrer">official installation guide <ArrowUpRight size={12} aria-hidden="true" /></a> to set up your stack.</p></section><section><span className="library-step">02 / Install</span><h2>Choose a component.</h2><p>Copy the command from a component page. The CLI adds source files to the jhosephe folder under your components alias, along with the required dependencies.</p><InstallationCommand id="button" /><p>Each component imports its styles. Classes and tokens use the jh prefix, leaving your app’s global theme in place.</p></section><section><span className="library-step">03 / Use</span><h2>One small detail, already in place.</h2><CodeBlock title="example.tsx" value={'import { Button } from "@/components/jhosephe/button";\n\nexport function Example() {\n  return <Button variant="primary">Get started</Button>;\n}'} /><p>This example uses the @/components alias. Adjust the import if yours is different. Components include Geist Sans without changing the rest of your app’s typography.</p></section><section><span className="library-step">04 / Customize</span><h2>Find your own balance.</h2><p>Adjust the preview controls, then open the Code tab. “Your configuration” shows your updated example. “Component files” shows the full implementation installed by the CLI.</p><p>Prefer to copy manually? Keep the shown files together, preserve relative imports, and install the dependencies listed in the <a href="/r/button.json">component JSON</a>.</p><LinkButton href="/components">Find my first component <ArrowRight {...iconProps} /></LinkButton></section></main>;
}

function NotFound() {
  return <main tabIndex={-1} id="library-main" className="library-main library-not-found"><span className="library-eyebrow">404 / A LITTLE EMPTY SPACE</span><h1>That detail isn’t here yet.</h1><p>Explore the pieces available in the library.</p><LinkButton href="/components">Back to components <ArrowRight {...iconProps} /></LinkButton></main>;
}

export function Library() {
  const { path, navigate } = useLibraryNavigation();
  const item = components.find(component => path === `/components/${component.id}`);
  const landing = path === '/';
  useEffect(() => { document.title = `${item ? item.name : landing ? 'Interfaces to feel' : path === '/components' ? 'Components' : path === '/installation' ? 'Installation' : 'Page not found'} — jhosephe`; }, [item, path, landing]);
  return <div className="library" onClick={navigate}><a className="library-skip" href="#library-main">Skip to content</a><Header path={path} /><div className={landing ? '' : 'library-layout'}>{!landing && <Sidebar path={path} />}<div className="library-route" key={path}>{landing ? <Landing /> : path === '/components' ? <Catalog /> : path === '/installation' ? <Installation /> : item ? <ComponentPage key={item.id} item={item} /> : <NotFound />}</div></div><footer className="library-footer"><a className="library-brand" href="/"><Mark /><span>jhosephe<span className="library-brand-dot">.</span></span></a><p>Interfaces made of small details.</p><a href="/components">Explore the collection <ArrowUpRight {...iconProps} /></a><span>React · CSS · MIT</span></footer></div>;
}

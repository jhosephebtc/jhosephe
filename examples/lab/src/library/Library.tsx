import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, ChevronRight, Code2, Copy, Grid2X2, Menu, Monitor, RotateCcw, Search, Smartphone, Sun, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from '../../../../assets/ui/button';
import { Dial } from '../../../../assets/ui/dial';
import { Slider, Switch } from '../../../../assets/ui/controls';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../../../../assets/ui/dialog';
import { InstrumentBars } from '../../../../assets/ui/instrument';
import { ShaderSurface } from '../../../../assets/ui/shader-surface';
import { SmoothShape } from '../../../../assets/ui/smooth-shape';
import { categories, components, defaults, settingsFor, usage, type ComponentId, type ComponentInfo, type Settings } from './data';
import { ExtraPreview } from './ExtraPreview';
import { extraComponents } from './extra-data';
import { SearchInput } from '../../../../assets/ui/search-input';
import { useLibraryNavigation } from './use-navigation';
import './library.css';

const iconProps = { size: 16, strokeWidth: 1.6, 'aria-hidden': true } as const;
const normalise = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const matches = (component: ComponentInfo, query: string) => normalise(`${component.name} ${component.category} ${component.tag} ${component.description}`).includes(normalise(query));

function Mark() {
  return <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true"><path d="M14 8v9c0 4-2.3 6-6 6H5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="14" cy="3" r="1.6" fill="currentColor" /></svg>;
}

function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(old => !old); }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);
  const results = components.filter(item => matches(item, query));
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild><button className="library-search-trigger"><Search {...iconProps} /><span>Search components</span><kbd>⌘ K</kbd></button></DialogTrigger>
    <DialogContent className="library-search-dialog">
      <DialogTitle>Find a detail.</DialogTitle>
      <DialogDescription>Search by name, material, or category.</DialogDescription>
      <label className="library-search"><Search {...iconProps} /><span className="library-sr">Search the library</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buttons, glass, controls…" /></label>
      <ul className="library-search-results">{results.map(item => <li key={item.id}><a href={`/components/${item.id}`} onClick={() => setOpen(false)}><span>{item.name}<small>{item.category}</small></span><ArrowUpRight {...iconProps} /></a></li>)}</ul>
      {!results.length && <p role="status">No components found. Try another term.</p>}
    </DialogContent>
  </Dialog>;
}

function Header({ path }: { path: string }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  return <header className="library-header">
    <div className="library-header-inner">
      <a className="library-brand" href="/" aria-label="jhosephe, home"><Mark /><span>jhosephe<span className="library-brand-dot">.</span></span></a>
      <nav className="library-header-nav" aria-label="Main navigation"><a aria-current={path.startsWith('/components') ? 'page' : undefined} href="/components">Components</a><a href="/lab">Laboratory</a><a href="/solar">Solar <ArrowUpRight size={12} aria-hidden="true" /></a></nav>
      <div className="library-header-actions"><SearchDialog /><button className="library-menu" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="library-mobile-nav" onClick={() => setMenu(!menu)}>{menu ? <X {...iconProps} /> : <Menu {...iconProps} />}</button><span className="library-version">v0.1</span></div>
    </div>
    {menu && <nav id="library-mobile-nav" className="library-mobile-nav" aria-label="Mobile navigation"><a href="/components">All components</a><a href="/installation">Installation</a><a href="/lab">Laboratory</a><a href="/solar">Solar panel</a>{components.map(item => <a key={item.id} href={`/components/${item.id}`}>{item.name}</a>)}</nav>}
  </header>;
}

function Sidebar({ path }: { path: string }) {
  const entry = (href: string, label: string, icon?: ReactNode) => <a href={href} aria-current={path === href ? 'page' : undefined}>{icon}<span>{label}</span>{path === href && <span className="library-nav-dot" />}</a>;
  return <aside className="library-sidebar"><nav aria-label="Component library">
    <div className="library-nav-group"><p>Getting started</p>{entry('/components', 'Overview', <Grid2X2 {...iconProps} />)}{entry('/installation', 'Installation', <Code2 {...iconProps} />)}</div>
    {categories.filter(category => category !== 'All').map(category => <div className="library-nav-group" key={category}><p>{category}</p>{components.filter(item => item.category === category).map(item => <div key={item.id}>{entry(`/components/${item.id}`, item.name)}</div>)}</div>)}
    <div className="library-nav-group"><p>In context</p>{entry('/lab', 'Laboratory', <Grid2X2 {...iconProps} />)}{entry('/solar', 'Solar panel', <Sun {...iconProps} />)}</div>
  </nav><div className="library-sidebar-note"><span className="library-lens-dot" /><p>Made to be felt.<br /><span>Ready to be yours.</span></p></div></aside>;
}

function LinkButton({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a className={`jh-button jh-button--glass ${secondary ? 'jh-button--secondary' : 'jh-button--primary'} library-link-button`} href={href}><SmoothShape className="jh-button__face" radius={16} /><span className="jh-button__content">{children}</span></a>;
}

function InstrumentControl({ value, onChange, labelId }: { value: number; onChange: (value: number) => void; labelId: string }) {
  const control = useRef<HTMLDivElement>(null);
  const setFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    onChange(Math.round(Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)) * 100));
  };
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key === 'Home') { event.preventDefault(); onChange(0); return; }
    if (event.key === 'End') { event.preventDefault(); onChange(100); return; }
    if (event.key in steps) { event.preventDefault(); onChange(Math.max(0, Math.min(100, value + steps[event.key]))); }
  };
  return <div ref={control} className="library-instrument-control" role="slider" tabIndex={0} aria-labelledby={labelId} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={`${value}%`} onKeyDown={onKeyDown} onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); setFromPointer(event); }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) setFromPointer(event); }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}>
    <InstrumentBars value={value} />
  </div>;
}

function Preview({ id, settings, onChange, compact = false }: { id: ComponentId; settings: Settings; onChange: (value: Partial<Settings>) => void; compact?: boolean }) {
  const labelId = useId();
  if (extraComponents.some(item => item.id === id)) return <ExtraPreview id={id} settings={settings} onChange={onChange} compact={compact} />;
  if (id === 'button') return <div className="library-demo-button"><Button variant={settings.variant} radius={settings.radius} smoothing={settings.smoothing / 100} liquid={settings.liquid} disabled={settings.disabled}>{settings.label || 'Your button'}</Button></div>;
  if (id === 'slider') return <div className="library-demo-slider"><div className="library-demo-label"><span id={labelId}>Intensity</span><output>{settings.value}%</output></div><Slider labelId={labelId} value={[settings.value]} onValueChange={values => onChange({ value: values[0] })} max={100} step={1} disabled={settings.disabled} /><div className="library-demo-endpoints" aria-hidden="true"><span>0</span><span>100</span></div></div>;
  if (id === 'switch') return <div className="library-demo-switch"><div><label htmlFor={labelId}>Ambient light</label><span>{settings.checked ? 'The light is on' : 'The light is off'}</span></div><Switch id={labelId} checked={settings.checked} onCheckedChange={checked => onChange({ checked })} disabled={settings.disabled} /></div>;
  if (id === 'dial') return <div className="library-demo-dial"><Dial label="Adjust intensity" value={settings.value} onChange={value => onChange({ value })} /><div><span>Intensity</span><output>{settings.value}<small>%</small></output></div></div>;
  if (id === 'dialog') return <Dialog><DialogTrigger asChild><Button size={compact ? 'small' : 'default'}>Review details <ArrowUpRight size={14} aria-hidden="true" /></Button></DialogTrigger><DialogContent className="library-example-dialog jh-dialog--rich"><span className="library-eyebrow">Workspace settings</span><DialogTitle>{settings.title || 'Your title'}</DialogTitle><DialogDescription>{settings.description}</DialogDescription><div className="jh-dialog-summary"><div className="jh-dialog-summary__row"><span>Workspace</span><strong>Northstar Studio</strong></div><div className="jh-dialog-summary__row"><span>Plan</span><strong>Professional</strong></div><div className="jh-dialog-summary__row"><span>Renewal</span><strong>December 1, 2026</strong></div></div><div className="jh-dialog-actions"><DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose><DialogClose asChild><Button variant="primary">Save changes <Check {...iconProps} /></Button></DialogClose></div></DialogContent></Dialog>;
  if (id === 'smooth-shape') return <div className="library-demo-shape"><SmoothShape className="jh-glass-shape" radius={settings.radius} smoothing={settings.smoothing / 100} /><div className="library-demo-shape-inner" aria-hidden="true"><span /><span /></div></div>;
  if (id === 'shader-surface') return <div className="library-demo-shader"><ShaderSurface /><div style={{ background: `rgb(255 255 255 / ${settings.opacity / 100})`, backdropFilter: `blur(${settings.blur}px)` }} className="library-demo-glass">Light in layers<span aria-hidden="true">↗</span></div></div>;
  return <div className="library-demo-instrument"><div className="library-demo-label"><span id={labelId}>Intensity</span><span className="library-live-dot">Live</span></div><output>{settings.value}<small>%</small></output><InstrumentControl value={settings.value} onChange={value => onChange({ value })} labelId={labelId} /></div>;
}

function Tile({ item, index = 0 }: { item: ComponentInfo; index?: number }) {
  const [settings, setSettings] = useState(settingsFor(item.id));
  return <article className={`library-card library-card--${item.id}`}>
    <div className="library-card-preview" role="group" aria-label={`${item.name} interactive preview`}><span className="library-card-index">{String(index + 1).padStart(2, '0')}</span><Preview id={item.id} settings={settings} onChange={patch => setSettings(old => ({ ...old, ...patch }))} compact /></div>
    <div className="library-card-copy"><div><h2><a href={`/components/${item.id}`}>{item.name}</a></h2><p>{item.description}</p></div><ArrowUpRight {...iconProps} /></div>
    <span className="library-card-tag">{item.tag}</span>
  </article>;
}

function Landing() {
  return <main tabIndex={-1} id="library-main" className="library-landing">
    <section className="library-hero"><div className="library-eyebrow"><span className="library-lens-dot" /> A library for the senses</div><h1>Small details.<br /><span>Lasting impressions.</span></h1><p>Components made of glass, light, and motion.<br />Customize, copy, and shape your next interface.</p><div className="library-hero-actions"><LinkButton href="/components">Explore components <ArrowRight {...iconProps} /></LinkButton><a className="library-text-link" href="/installation">How to install <ArrowUpRight {...iconProps} /></a></div><div className="library-tech-note"><span>React + TypeScript</span><i /><span>CSS you can make your own</span><i /><span>shadcn compatible</span></div></section>
    <section className="library-featured" aria-label="Interactive components"><div className="library-section-head"><div><span className="library-eyebrow">Explore the collection</span><h2>Every detail, ready to use.</h2></div><a className="library-text-link" href="/components">Browse all {components.length} components <ArrowRight {...iconProps} /></a></div><div className="library-card-grid">{components.map((item, index) => <Tile key={item.id} item={item} index={index} />)}</div></section>
    <section className="library-solar-feature"><div><span className="library-eyebrow">The language in context</span><h2>One interface.<br />The rhythm of a day.</h2><p>A solar instrument that follows the light at your location. Built with the same attention to detail.</p><LinkButton href="/solar">Open solar panel <ArrowUpRight {...iconProps} /></LinkButton></div><a href="/solar" className="library-solar-art"><svg viewBox="0 0 600 250" fill="none" aria-hidden="true"><path className="library-solar-art-horizon" d="M35 190H565" /><path className="library-solar-art-arc" d="M35 190Q300 -110 565 190" /><path className="library-solar-art-ray" d="M300 48v142" strokeDasharray="2 7" /><circle cx="300" cy="40" r="16" className="library-solar-art-sun" /><circle cx="300" cy="40" r="5" fill="#fff" />{Array.from({ length: 47 }, (_, i) => <path key={i} d={`M${47 + i * 11} 206v${i % 4 === 0 ? 14 : 7}`} stroke="#a5a5a5" strokeWidth=".7" />)}<text x="35" y="175">East</text><text x="530" y="175">West</text></svg><span>Solar study / 002</span></a></section>
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
  return <label className="library-text-field">{label}<DropdownMenu.Root>
    <DropdownMenu.Trigger className="library-select-trigger" aria-label={label}><span>{selected.label}</span><ChevronDown size={14} strokeWidth={1.6} aria-hidden="true" /></DropdownMenu.Trigger>
    <DropdownMenu.Portal><DropdownMenu.Content className="library-select-menu" align="start" sideOffset={5}>
      <DropdownMenu.Label className="library-select-label">{label}</DropdownMenu.Label>
      <DropdownMenu.RadioGroup value={value} onValueChange={onChange}>{options.map(option => <DropdownMenu.RadioItem key={option.value} className="library-select-item" value={option.value}><span>{option.label}</span>{value === option.value && <Check size={13} strokeWidth={1.6} aria-hidden="true" />}</DropdownMenu.RadioItem>)}</DropdownMenu.RadioGroup>
    </DropdownMenu.Content></DropdownMenu.Portal>
  </DropdownMenu.Root></label>;
}

function Customizer({ id, settings: s, change, reset }: { id: ComponentId; settings: Settings; change: (value: Partial<Settings>) => void; reset: () => void }) {
  return <section className="library-customizer" aria-labelledby="customizer-title"><div className="library-customizer-head"><h2 id="customizer-title">Make it your own.</h2><button aria-label="Reset settings" title="Reset settings" onClick={reset}><RotateCcw {...iconProps} /></button></div><p>The code follows every adjustment.</p>
    {id === 'button' && <><label className="library-text-field">Label<input value={s.label} maxLength={60} onChange={event => change({ label: event.target.value })} /></label><SelectField label="Variant" value={s.variant} options={[{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'ghost', label: 'Ghost' }]} onChange={variant => change({ variant: variant as Settings['variant'] })} /><RangeField label="Corner radius" value={s.radius} max={32} unit=" px" onChange={radius => change({ radius })} /><RangeField label="Corner smoothness" value={s.smoothing} unit="%" onChange={smoothing => change({ smoothing })} /><ToggleField label="Liquid feedback" checked={s.liquid} onChange={liquid => change({ liquid })} /></>}
    {['slider', 'dial', 'instrument', 'bar-slider'].includes(id) && <RangeField label="Value" value={s.value} unit="%" onChange={value => change({ value })} />}
    {id === 'progress-bar' && <RangeField label="Progress" value={s.progressValue} unit="%" onChange={progressValue => change({ progressValue })} />}
    {id === 'switch' && <ToggleField label="Enabled" checked={s.checked} onChange={checked => change({ checked })} />}
    {['button', 'slider', 'switch', 'bar-slider', 'date-picker', 'input', 'search-input'].includes(id) && <ToggleField label="Disabled" checked={s.disabled} onChange={disabled => change({ disabled })} />}
    {['dialog', 'toast', 'data-form'].includes(id) && <><label className="library-text-field">Title<input value={s.title} maxLength={80} onChange={event => change({ title: event.target.value })} /></label><label className="library-text-field">Description<textarea rows={4} value={s.description} maxLength={240} onChange={event => change({ description: event.target.value })} /></label></>}
    {id === 'smooth-shape' && <><RangeField label="Radius" value={s.radius} max={90} unit=" px" onChange={radius => change({ radius })} /><RangeField label="Smoothing" value={s.smoothing} unit="%" onChange={smoothing => change({ smoothing })} /></>}
    {id === 'shader-surface' && <><RangeField label="Glass opacity" value={s.opacity} min={15} max={95} unit="%" onChange={opacity => change({ opacity })} /><RangeField label="Blur" value={s.blur} max={32} unit=" px" onChange={blur => change({ blur })} /></>}
    {['calendar', 'date-picker'].includes(id) && <label className="library-text-field">Selected date<input type="date" value={s.date} onChange={event => change({ date: event.target.value })} /></label>}
    {id === 'calendar' && <><ToggleField label="Outside days" checked={s.showOutsideDays} onChange={showOutsideDays => change({ showOutsideDays })} /><ToggleField label="Monday first" checked={s.mondayFirst} onChange={mondayFirst => change({ mondayFirst })} /></>}
    {['menu', 'context-menu'].includes(id) && <SelectField label="Alignment" value={s.align} options={[{ value: 'start', label: 'Start' }, { value: 'end', label: 'End' }]} onChange={align => change({ align: align as Settings['align'] })} />}
    {id === 'radio-group' && <SelectField label="Billing frequency" value={s.radioValue} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]} onChange={radioValue => change({ radioValue })} />}
    {id === 'segmented-control' && <SelectField label="Selected view" value={s.segmentValue} options={[{ value: 'map', label: 'Map' }, { value: 'list', label: 'List' }, { value: 'saved', label: 'Saved' }]} onChange={segmentValue => change({ segmentValue })} />}
    {id === 'tactile-key' && <ToggleField label="Pressed" checked={s.keyPressed} onChange={keyPressed => change({ keyPressed })} />}
    {id === 'compass' && <RangeField label="Heading" value={s.compassHeading} max={359} unit="°" onChange={compassHeading => change({ compassHeading })} />}
    {id === 'spectrum-control' && <><RangeField label="Hue" value={s.spectrumHue} max={360} unit="°" onChange={spectrumHue => change({ spectrumHue })} /><RangeField label="Saturation" value={s.spectrumSaturation} unit="%" onChange={spectrumSaturation => change({ spectrumSaturation })} /><RangeField label="Lightness" value={s.spectrumLightness} min={8} max={92} unit="%" onChange={spectrumLightness => change({ spectrumLightness })} /></>}
    {id === 'step-navigation' && <RangeField label="Current step" value={s.stepIndex + 1} min={1} max={3} onChange={step => change({ stepIndex: step - 1 })} />}
    {id === 'toast' && <RangeField label="Duration" value={s.duration / 1000} min={2} max={10} unit=" s" onChange={duration => change({ duration: duration * 1000 })} />}
    {id === 'gallery' && <><ToggleField label="Captions" checked={s.showCaptions} onChange={showCaptions => change({ showCaptions })} /><ToggleField label="Indicators" checked={s.showIndicators} onChange={showIndicators => change({ showIndicators })} /></>}
    {id === 'audio-meter' && <SelectField label="Bar orientation" value={s.audioOrientation} options={[{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]} onChange={audioOrientation => change({ audioOrientation: audioOrientation as Settings['audioOrientation'] })} />}
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
  const change = (patch: Partial<Settings>) => setSettings(old => ({ ...old, ...patch }));
  const index = components.indexOf(item);
  const next = components[(index + 1) % components.length];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  return <main tabIndex={-1} id="library-main" className="library-main library-detail"><div className="library-breadcrumb"><a href="/components">Components</a><ChevronRight size={12} aria-hidden="true" /><span>{item.name}</span></div><div className="library-page-heading"><span className="library-eyebrow">{item.category} / {item.tag}</span><h1>{item.name}</h1><p>{item.detail}</p></div>
    <div className="library-detail-toolbar"><div role="tablist" aria-label="Component view" className="library-tabs">{(['preview', 'code'] as const).map((value, i) => <button key={value} ref={element => { tabRefs.current[i] = element; }} id={`tab-${value}`} aria-controls={`panel-${value}`} role="tab" tabIndex={tab === value ? 0 : -1} aria-selected={tab === value} onClick={() => setTab(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const target = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - i; setTab(target === 0 ? 'preview' : 'code'); tabRefs.current[target]?.focus(); } }}>{value === 'preview' ? <><Monitor {...iconProps} />Preview</> : <><Code2 {...iconProps} />Code</>}</button>)}</div>{tab === 'preview' && <div className="library-view-toggle" aria-label="Preview width"><button aria-label="Wide preview" aria-pressed={!narrow} onClick={() => setNarrow(false)}><Monitor {...iconProps} /></button><button aria-label="Compact preview" aria-pressed={narrow} onClick={() => setNarrow(true)}><Smartphone {...iconProps} /></button></div>}</div>
    <div className="library-playground">
      <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" hidden={tab !== 'preview'} tabIndex={0}><div className={`library-preview-stage library-preview-stage--${item.id} ${narrow ? 'is-narrow' : ''}`}><span className="library-preview-caption">{item.tag} / Interactive</span><div className="library-preview-object"><Preview id={item.id} settings={settings} onChange={change} /></div><span className="library-preview-hint">{item.id === 'instrument' ? 'Drag across the bars or use the arrow keys.' : item.id === 'shader-surface' ? 'Light adapts to your device’s motion preferences.' : 'Try a touch. Feel the response.'}</span></div></div>
      <div id="panel-code" role="tabpanel" aria-labelledby="tab-code" hidden={tab !== 'code'} tabIndex={0}><div className="library-code-switch"><button aria-pressed={!source} onClick={() => setSource(false)}>Your configuration</button><button aria-pressed={source} onClick={() => setSource(true)}>Component files</button></div>{tab === 'code' && (source ? <SourceCode id={item.id} /> : <CodeBlock title="example.tsx" value={usage(item.id, settings)} />)}</div>
      <Customizer id={item.id} settings={settings} change={change} reset={() => setSettings(settingsFor(item.id))} />
    </div>
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
  return <div className="library" onClick={navigate}><a className="library-skip" href="#library-main">Skip to content</a><Header path={path} /><div className={landing ? '' : 'library-layout'}>{!landing && <Sidebar path={path} />}<div className="library-route" key={path}>{landing ? <Landing /> : path === '/components' ? <Catalog /> : path === '/installation' ? <Installation /> : item ? <ComponentPage key={item.id} item={item} /> : <NotFound />}</div></div><footer className="library-footer"><a className="library-brand" href="/"><Mark /><span>jhosephe.</span></a><p>Interfaces made of small details.</p><a href="/components">Explore the collection <ArrowUpRight {...iconProps} /></a><span>React · CSS · MIT</span></footer></div>;
}

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, Code2, Copy, Grid2X2, Menu, Monitor, RotateCcw, Search, Smartphone, Sun, X } from 'lucide-react';
import { Button } from '../../../../assets/ui/button';
import { Dial } from '../../../../assets/ui/dial';
import { Slider, Switch } from '../../../../assets/ui/controls';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../../../../assets/ui/dialog';
import { InstrumentBars } from '../../../../assets/ui/instrument';
import { ShaderSurface } from '../../../../assets/ui/shader-surface';
import { SmoothShape } from '../../../../assets/ui/smooth-shape';
import { categories, components, defaults, usage, type ComponentId, type ComponentInfo, type Settings } from './data';
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
    <DialogTrigger asChild><button className="library-search-trigger"><Search {...iconProps} /><span>Buscar componentes</span><kbd>⌘ K</kbd></button></DialogTrigger>
    <DialogContent className="library-search-dialog">
      <DialogTitle>Encontre um detalhe.</DialogTitle>
      <DialogDescription>Busque pelo nome, material ou categoria.</DialogDescription>
      <label className="library-search"><Search {...iconProps} /><span className="library-sr">Buscar na biblioteca</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Botão, vidro, controles…" /></label>
      <ul className="library-search-results">{results.map(item => <li key={item.id}><a href={`/components/${item.id}`}><span>{item.name}<small>{item.category}</small></span><ArrowUpRight {...iconProps} /></a></li>)}</ul>
      {!results.length && <p role="status">Nenhum componente encontrado. Tente outro termo.</p>}
    </DialogContent>
  </Dialog>;
}

function Header({ path }: { path: string }) {
  const [menu, setMenu] = useState(false);
  return <header className="library-header">
    <div className="library-header-inner">
      <a className="library-brand" href="/" aria-label="jhosephe, início"><Mark /><span>jhosephe<span className="library-brand-dot">.</span></span></a>
      <nav className="library-header-nav" aria-label="Navegação principal"><a aria-current={path.startsWith('/components') ? 'page' : undefined} href="/components">Componentes</a><a href="/lab">Laboratório</a><a href="/solar">Solar <ArrowUpRight size={12} aria-hidden="true" /></a></nav>
      <div className="library-header-actions"><SearchDialog /><button className="library-menu" aria-label={menu ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={menu} aria-controls="library-mobile-nav" onClick={() => setMenu(!menu)}>{menu ? <X {...iconProps} /> : <Menu {...iconProps} />}</button><span className="library-version">v0.1</span></div>
    </div>
    {menu && <nav id="library-mobile-nav" className="library-mobile-nav" aria-label="Navegação móvel"><a href="/components">Todos os componentes</a><a href="/installation">Instalação</a><a href="/lab">Laboratório</a><a href="/solar">Painel solar</a>{components.map(item => <a key={item.id} href={`/components/${item.id}`}>{item.name}</a>)}</nav>}
  </header>;
}

function Sidebar({ path }: { path: string }) {
  const entry = (href: string, label: string, icon?: ReactNode) => <a href={href} aria-current={path === href ? 'page' : undefined}>{icon}<span>{label}</span>{path === href && <span className="library-nav-dot" />}</a>;
  return <aside className="library-sidebar"><nav aria-label="Biblioteca de componentes">
    <div className="library-nav-group"><p>Comece por aqui</p>{entry('/components', 'Visão geral', <Grid2X2 {...iconProps} />)}{entry('/installation', 'Instalação', <Code2 {...iconProps} />)}</div>
    {categories.filter(category => category !== 'Todos').map(category => <div className="library-nav-group" key={category}><p>{category}</p>{components.filter(item => item.category === category).map(item => <div key={item.id}>{entry(`/components/${item.id}`, item.name)}</div>)}</div>)}
    <div className="library-nav-group"><p>Em contexto</p>{entry('/lab', 'Laboratório', <Grid2X2 {...iconProps} />)}{entry('/solar', 'Painel solar', <Sun {...iconProps} />)}</div>
  </nav><div className="library-sidebar-note"><span className="library-lens-dot" /><p>Feito para ser sentido.<br /><span>Pronto para ser seu.</span></p></div></aside>;
}

function LinkButton({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <a className={`jh-button jh-button--glass ${secondary ? 'jh-button--secondary' : 'jh-button--primary'} library-link-button`} href={href}><SmoothShape className="jh-button__face" radius={16} /><span className="jh-button__content">{children}</span></a>;
}

function Preview({ id, settings, onChange, compact = false }: { id: ComponentId; settings: Settings; onChange: (value: Partial<Settings>) => void; compact?: boolean }) {
  const labelId = useId();
  if (id === 'button') return <div className="library-demo-button"><Button variant={settings.variant} radius={settings.radius} liquid={settings.liquid} disabled={settings.disabled}>{settings.label || 'Seu botão'}</Button></div>;
  if (id === 'slider') return <div className="library-demo-slider"><div className="library-demo-label"><span id={labelId}>Intensidade</span><output>{settings.value}%</output></div><Slider labelId={labelId} value={[settings.value]} onValueChange={values => onChange({ value: values[0] })} max={100} step={1} disabled={settings.disabled} /><div className="library-demo-endpoints" aria-hidden="true"><span>0</span><span>100</span></div></div>;
  if (id === 'switch') return <div className="library-demo-switch"><div><label htmlFor={labelId}>Luz ambiente</label><span>{settings.checked ? 'A luz está ligada' : 'A luz está desligada'}</span></div><Switch id={labelId} checked={settings.checked} onCheckedChange={checked => onChange({ checked })} disabled={settings.disabled} /></div>;
  if (id === 'dial') return <div className="library-demo-dial"><Dial label="Ajustar intensidade" value={settings.value} onChange={value => onChange({ value })} /><div><span>INTENSIDADE</span><output>{settings.value}<small>%</small></output></div></div>;
  if (id === 'dialog' && compact) return <div className="library-mini-dialog"><div className="library-mini-icon"><Check {...iconProps} /></div><strong>{settings.title}</strong><span>Um momento para o que importa.</span><div className="library-mini-action">Entendi <Check size={12} /></div></div>;
  if (id === 'dialog') return <Dialog><DialogTrigger asChild><Button>Abrir diálogo</Button></DialogTrigger><DialogContent className="library-example-dialog"><div className="library-mini-icon"><Check {...iconProps} /></div><DialogTitle>{settings.title || 'Seu título'}</DialogTitle><DialogDescription>{settings.description}</DialogDescription><DialogClose asChild><Button>Entendi <Check {...iconProps} /></Button></DialogClose></DialogContent></Dialog>;
  if (id === 'smooth-shape') return <div className="library-demo-shape"><SmoothShape className="jh-glass-shape" radius={settings.radius} smoothing={settings.smoothing / 100} /><div className="library-demo-shape-inner" aria-hidden="true"><span /><span /></div></div>;
  if (id === 'shader-surface') return <div className="library-demo-shader"><ShaderSurface /><div style={{ background: `rgb(255 255 255 / ${settings.opacity / 100})`, backdropFilter: `blur(${settings.blur}px)` }} className="library-demo-glass">Luz em camadas<span aria-hidden="true">↗</span></div></div>;
  return <div className="library-demo-instrument"><div className="library-demo-label"><span>INTENSIDADE</span><span className="library-live-dot">AO VIVO</span></div><output>{settings.value}<small>%</small></output><InstrumentBars value={settings.value} /></div>;
}

function Tile({ item, index = 0 }: { item: ComponentInfo; index?: number }) {
  const [settings, setSettings] = useState(defaults);
  return <article className={`library-card library-card--${item.id}`}>
    <div className="library-card-preview" aria-hidden="true" inert><span className="library-card-index">{String(index + 1).padStart(2, '0')}</span><Preview id={item.id} settings={settings} onChange={patch => setSettings(old => ({ ...old, ...patch }))} compact /></div>
    <div className="library-card-copy"><div><h3><a href={`/components/${item.id}`}>{item.name}</a></h3><p>{item.description}</p></div><ArrowUpRight {...iconProps} /></div>
    <span className="library-card-tag">{item.tag}</span>
  </article>;
}

function Landing() {
  return <main id="library-main" className="library-landing">
    <section className="library-hero"><div className="library-eyebrow"><span className="library-lens-dot" /> UMA BIBLIOTECA PARA O TOQUE</div><h1>Pequenos detalhes.<br /><span>Grandes sensações.</span></h1><p>Componentes de vidro, luz e movimento.<br />Personalize, copie e dê forma à sua próxima interface.</p><div className="library-hero-actions"><LinkButton href="/components">Explorar componentes <ArrowRight {...iconProps} /></LinkButton><a className="library-text-link" href="/installation">Como instalar <ArrowUpRight {...iconProps} /></a></div><div className="library-tech-note"><span>React + TypeScript</span><i /><span>CSS que você controla</span><i /><span>Compatível com shadcn</span></div></section>
    <section className="library-featured" aria-label="Seleção de componentes"><div className="library-section-head"><div><span className="library-eyebrow">EXPLORE A COLEÇÃO</span><h2>O essencial, com presença.</h2></div><a className="library-text-link" href="/components">Ver os 8 componentes <ArrowRight {...iconProps} /></a></div><div className="library-card-grid">{components.slice(0, 6).map((item, index) => <Tile key={item.id} item={item} index={index} />)}</div></section>
    <section className="library-solar-feature"><div><span className="library-eyebrow">A LINGUAGEM EM CONTEXTO</span><h2>Uma interface.<br />O ritmo de um dia.</h2><p>Um instrumento solar que acompanha a luz na sua localização. Construído com a mesma atenção ao detalhe.</p><LinkButton href="/solar">Abrir painel solar <ArrowUpRight {...iconProps} /></LinkButton></div><a href="/solar" className="library-solar-art" aria-label="Conhecer o painel solar"><svg viewBox="0 0 600 250" fill="none" aria-hidden="true"><path className="library-solar-art-horizon" d="M35 190H565" /><path className="library-solar-art-arc" d="M35 190Q300 -110 565 190" /><path className="library-solar-art-ray" d="M300 48v142" strokeDasharray="2 7" /><circle cx="300" cy="40" r="16" className="library-solar-art-sun" /><circle cx="300" cy="40" r="5" fill="#fff" />{Array.from({ length: 47 }, (_, i) => <path key={i} d={`M${47 + i * 11} 206v${i % 4 === 0 ? 14 : 7}`} stroke="#a5a5a5" strokeWidth=".7" />)}<text x="35" y="175">LESTE</text><text x="530" y="175">OESTE</text></svg><span>ESTUDO SOLAR / 002</span></a></section>
    <section className="library-principles"><div><span>01</span><h3>Escolha um detalhe.</h3><p>Explore controles e superfícies em uma linguagem visual consistente.</p></div><div><span>02</span><h3>Encontre o seu ajuste.</h3><p>Mude a forma, a intensidade e o comportamento. Veja tudo responder.</p></div><div><span>03</span><h3>Faça parte do seu projeto.</h3><p>Instale pelo CLI ou copie o código. A implementação fica com você.</p></div></section>
  </main>;
}

function Catalog() {
  const [category, setCategory] = useState<string>('Todos');
  const [query, setQuery] = useState('');
  const filtered = components.filter(item => (category === 'Todos' || category === item.category) && matches(item, query));
  return <main id="library-main" className="library-main"><div className="library-breadcrumb">Biblioteca <ChevronRight size={12} aria-hidden="true" /> Componentes</div><div className="library-page-heading"><span className="library-eyebrow">FEITO PARA SER SEU</span><h1>Componentes<span className="library-heading-count">08</span></h1><p>Um pouco de vidro. Uma resposta precisa.<br />Detalhes prontos para ganhar a sua forma.</p></div>
    <div className="library-catalog-toolbar"><div className="library-filter" aria-label="Filtrar por categoria">{categories.map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="library-search"><Search {...iconProps} /><span className="library-sr">Filtrar componentes</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar componente…" />{query && <button aria-label="Limpar busca" onClick={() => setQuery('')}><X size={14} aria-hidden="true" /></button>}</label></div>
    <div className="library-results-note" role="status">{filtered.length} {filtered.length === 1 ? 'componente' : 'componentes'}</div>
    {filtered.length ? <div className="library-card-grid">{filtered.map(item => <Tile key={item.id} item={item} index={components.indexOf(item)} />)}</div> : <div className="library-empty"><Search size={26} strokeWidth={1.3} aria-hidden="true" /><h2>Nenhum detalhe por aqui.</h2><p>Tente outro nome ou explore todas as categorias.</p><Button onClick={() => { setCategory('Todos'); setQuery(''); }}>Limpar filtros</Button></div>}
    <div className="library-catalog-bottom"><span>Peças pequenas. Possibilidades abertas.</span><a href="/lab">Veja tudo em contexto <ArrowUpRight {...iconProps} /></a></div>
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

function Customizer({ id, settings: s, change, reset }: { id: ComponentId; settings: Settings; change: (value: Partial<Settings>) => void; reset: () => void }) {
  return <section className="library-customizer" aria-labelledby="customizer-title"><div className="library-customizer-head"><h2 id="customizer-title">Faça do seu jeito.</h2><button aria-label="Restaurar configuração" title="Restaurar configuração" onClick={reset}><RotateCcw {...iconProps} /></button></div><p>O código acompanha cada ajuste.</p>
    {id === 'button' && <><label className="library-text-field">Texto<input value={s.label} maxLength={60} onChange={event => change({ label: event.target.value })} /></label><label className="library-text-field">Variante<select value={s.variant} onChange={event => change({ variant: event.target.value as Settings['variant'] })}><option value="primary">Primária</option><option value="secondary">Secundária</option><option value="ghost">Ghost</option></select></label><RangeField label="Raio" value={s.radius} max={32} unit=" px" onChange={radius => change({ radius })} /><ToggleField label="Efeito liquid" checked={s.liquid} onChange={liquid => change({ liquid })} /></>}
    {['slider', 'dial', 'instrument'].includes(id) && <RangeField label="Valor" value={s.value} unit="%" onChange={value => change({ value })} />}
    {id === 'switch' && <ToggleField label="Ligado" checked={s.checked} onChange={checked => change({ checked })} />}
    {['button', 'slider', 'switch'].includes(id) && <ToggleField label="Desabilitado" checked={s.disabled} onChange={disabled => change({ disabled })} />}
    {id === 'dialog' && <><label className="library-text-field">Título<input value={s.title} maxLength={80} onChange={event => change({ title: event.target.value })} /></label><label className="library-text-field">Descrição<textarea rows={4} value={s.description} maxLength={240} onChange={event => change({ description: event.target.value })} /></label></>}
    {id === 'smooth-shape' && <><RangeField label="Raio" value={s.radius} max={90} unit=" px" onChange={radius => change({ radius })} /><RangeField label="Suavização" value={s.smoothing} unit="%" onChange={smoothing => change({ smoothing })} /></>}
    {id === 'shader-surface' && <><RangeField label="Opacidade do vidro" value={s.opacity} min={15} max={95} unit="%" onChange={opacity => change({ opacity })} /><RangeField label="Desfoque" value={s.blur} max={32} unit=" px" onChange={blur => change({ blur })} /></>}
    <div className="library-customizer-note"><span className="library-lens-dot" /><span>Vidro. Luz. Sua intenção.</span></div>
  </section>;
}

function CopyButton({ value, label = 'Copiar', className = '' }: { value: string; label?: string; className?: string }) {
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setStatus('ok'); }
    catch { setStatus('error'); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2800);
  };
  return <div className={`library-copy-wrap ${className}`}><button className="library-copy" onClick={copy} aria-label={label}>{status === 'ok' ? <Check {...iconProps} /> : <Copy {...iconProps} />}<span>{status === 'ok' ? 'Copiado' : label}</span></button><span className="library-sr" role="status">{status === 'ok' ? 'Copiado para a área de transferência.' : ''}</span>{status === 'error' && <span className="library-copy-error" role="alert">Não foi possível copiar. Selecione o texto e copie manualmente.</span>}</div>;
}

function CodeBlock({ value, title }: { value: string; title: string }) {
  return <div className="library-code-block"><div className="library-code-toolbar"><span>{title}</span><CopyButton value={value} label="Copiar código" /></div><pre tabIndex={0} aria-label={title}><code>{value}</code></pre></div>;
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
    fetch(`/r/${id}.json`, { signal: abort.signal }).then(response => { if (!response.ok) throw new Error('Registry indisponível'); return response.json(); }).then(value => {
      if (!Array.isArray(value.files) || !value.files.length || value.files.some((entry: RegistryFile) => typeof entry.content !== 'string')) throw new Error('Registry inválido');
      setItem(value);
    }).catch(reason => { if (reason.name !== 'AbortError') setError(true); });
    return () => abort.abort();
  }, [id, retry]);
  if (error) return <div className="library-source-message" role="alert"><p>Não foi possível carregar os arquivos.</p><Button onClick={() => setRetry(value => value + 1)}>Tentar novamente</Button></div>;
  if (!item) return <p className="library-source-message" role="status">Carregando código…</p>;
  const selected = item.files[file];
  return <div className="library-source"><label className="library-file-select">Arquivo<select value={file} onChange={event => setFile(Number(event.target.value))}>{item.files.map((entry, index) => <option key={entry.path} value={index}>{entry.path.split('/').pop()}</option>)}</select></label><CodeBlock title={selected.target} value={selected.content} /><p className="library-code-footnote">Estes são os arquivos entregues pelo comando de instalação. As importações locais permanecem juntas em components/jhosephe.</p></div>;
}

function InstallationCommand({ id }: { id: ComponentId }) {
  const url = `${window.location.origin}/r/${id}.json`;
  const command = `npx shadcn@latest add ${url}`;
  return <div className="library-command"><code>{command}</code><CopyButton value={command} label="Copiar comando" /></div>;
}

function ComponentPage({ item }: { item: ComponentInfo }) {
  const [settings, setSettings] = useState<Settings>({ ...defaults });
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [narrow, setNarrow] = useState(false);
  const [source, setSource] = useState(false);
  const change = (patch: Partial<Settings>) => setSettings(old => ({ ...old, ...patch }));
  const index = components.indexOf(item);
  const next = components[(index + 1) % components.length];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  return <main id="library-main" className="library-main library-detail"><div className="library-breadcrumb"><a href="/components">Componentes</a><ChevronRight size={12} aria-hidden="true" /><span>{item.name}</span></div><div className="library-page-heading"><span className="library-eyebrow">{item.category.toUpperCase()} / {item.tag.toUpperCase()}</span><h1>{item.name}</h1><p>{item.detail}</p></div>
    <div className="library-detail-toolbar"><div role="tablist" aria-label="Visualização do componente" className="library-tabs">{(['preview', 'code'] as const).map((value, i) => <button key={value} ref={element => { tabRefs.current[i] = element; }} id={`tab-${value}`} aria-controls={`panel-${value}`} role="tab" tabIndex={tab === value ? 0 : -1} aria-selected={tab === value} onClick={() => setTab(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const target = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - i; setTab(target === 0 ? 'preview' : 'code'); tabRefs.current[target]?.focus(); } }}>{value === 'preview' ? <><Monitor {...iconProps} />Prévia</> : <><Code2 {...iconProps} />Código</>}</button>)}</div>{tab === 'preview' && <div className="library-view-toggle" aria-label="Largura da prévia"><button aria-label="Prévia ampla" aria-pressed={!narrow} onClick={() => setNarrow(false)}><Monitor {...iconProps} /></button><button aria-label="Prévia compacta" aria-pressed={narrow} onClick={() => setNarrow(true)}><Smartphone {...iconProps} /></button></div>}</div>
    <div className="library-playground">
      <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" hidden={tab !== 'preview'} tabIndex={0}><div className={`library-preview-stage library-preview-stage--${item.id} ${narrow ? 'is-narrow' : ''}`}><span className="library-preview-caption">{item.tag.toUpperCase()} / INTERACTIVE</span><div className="library-preview-object"><Preview id={item.id} settings={settings} onChange={change} /></div><span className="library-preview-hint">{item.id === 'shader-surface' ? 'A luz se adapta às preferências de movimento do dispositivo.' : 'Experimente o toque. O detalhe responde.'}</span></div></div>
      <div id="panel-code" role="tabpanel" aria-labelledby="tab-code" hidden={tab !== 'code'} tabIndex={0}><div className="library-code-switch"><button aria-pressed={!source} onClick={() => setSource(false)}>Sua configuração</button><button aria-pressed={source} onClick={() => setSource(true)}>Arquivos do componente</button></div>{tab === 'code' && (source ? <SourceCode id={item.id} /> : <CodeBlock title="example.tsx" value={usage(item.id, settings)} />)}</div>
      <Customizer id={item.id} settings={settings} change={change} reset={() => setSettings({ ...defaults })} />
    </div>
    <section className="library-install-section" aria-labelledby="install-heading"><div className="library-section-label"><span>01</span><h2 id="install-heading">Leve para o seu projeto.</h2></div><p>Com seu projeto React e o shadcn inicializados, execute o comando. O código e os estilos ficam com você.</p><InstallationCommand id={item.id} /><a className="library-text-link" href="/installation">Primeira vez? Veja a instalação <ArrowUpRight {...iconProps} /></a></section>
    <section className="library-props-section" aria-labelledby="props-heading"><div className="library-section-label"><span>02</span><h2 id="props-heading">Os ajustes do componente.</h2></div><div className="library-table-scroll" tabIndex={0} aria-label="Propriedades do componente"><table><thead><tr><th>Propriedade</th><th>Tipo</th><th>Padrão</th><th>Descrição</th></tr></thead><tbody>{item.props.map(([name, type, value, description]) => <tr key={name}><td>{name}</td><td>{type}</td><td>{value}</td><td>{description}</td></tr>)}</tbody></table></div></section>
    <nav className="library-detail-footer" aria-label="Mais componentes"><a href="/components"><ArrowLeft {...iconProps} />Todos os componentes</a><a href={`/components/${next.id}`}><span>Próximo<strong>{next.name}</strong></span><ArrowRight {...iconProps} /></a></nav>
  </main>;
}

function Installation() {
  return <main id="library-main" className="library-main library-install-page"><div className="library-breadcrumb">Comece por aqui <ChevronRight size={12} aria-hidden="true" /> Instalação</div><div className="library-page-heading"><span className="library-eyebrow">DO CATÁLOGO PARA O SEU PROJETO</span><h1>É seu para construir.</h1><p>Componentes que vivem no seu código.<br />Instale apenas o que precisa e ajuste cada detalhe.</p></div><section><span className="library-step">01 / PREPARE</span><h2>Um projeto React, pronto para receber.</h2><p>Use React com TypeScript em Next.js ou Vite. Inicialize o shadcn para configurar os aliases e o arquivo components.json.</p><CodeBlock title="Terminal" value="npx shadcn@latest init" /><p>Já usa shadcn no projeto? Pule este passo. Consulte o <a href="https://ui.shadcn.com/docs/installation" target="_blank" rel="noreferrer">guia oficial de instalação <ArrowUpRight size={12} aria-hidden="true" /></a> para configurar sua stack.</p></section><section><span className="library-step">02 / INSTALE</span><h2>Escolha um componente.</h2><p>Copie o comando da página do componente. O CLI adiciona os arquivos em seu alias de componentes, dentro da pasta jhosephe, junto com as dependências necessárias.</p><InstallationCommand id="button" /><p>Os estilos são importados pelo próprio componente. Eles usam classes e tokens com prefixo jh, sem mudar o tema global do seu app.</p></section><section><span className="library-step">03 / USE</span><h2>Um pequeno detalhe, já no lugar.</h2><CodeBlock title="example.tsx" value={'import { Button } from "@/components/jhosephe/button";\n\nexport function Example() {\n  return <Button variant="primary">Começar agora</Button>;\n}'} /><p>O exemplo assume o alias @/components. Se você configurou outro alias, ajuste a importação. Geist Sans acompanha os componentes; a fonte do restante do seu app permanece a mesma.</p></section><section><span className="library-step">04 / PERSONALIZE</span><h2>Encontre a sua configuração.</h2><p>Use os controles ao lado da prévia e abra a aba Código. “Sua configuração” mostra o exemplo atualizado. “Arquivos do componente” mostra a implementação completa, igual à que o CLI instala.</p><p>Prefere copiar à mão? Crie os arquivos mostrados na mesma pasta, preserve as importações relativas e instale as dependências listadas no <a href="/r/button.json">JSON do componente</a>.</p><LinkButton href="/components">Encontrar meu primeiro componente <ArrowRight {...iconProps} /></LinkButton></section></main>;
}

function NotFound() {
  return <main id="library-main" className="library-main library-not-found"><span className="library-eyebrow">404 / UM ESPAÇO EM BRANCO</span><h1>Esse detalhe ainda não existe.</h1><p>Explore as peças disponíveis na biblioteca.</p><LinkButton href="/components">Voltar aos componentes <ArrowRight {...iconProps} /></LinkButton></main>;
}

export function Library() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const item = components.find(component => path === `/components/${component.id}`);
  const landing = path === '/';
  useEffect(() => { document.title = `${item ? item.name : landing ? 'Interfaces para sentir' : path === '/components' ? 'Componentes' : path === '/installation' ? 'Instalação' : 'Página não encontrada'} — jhosephe`; }, [item, path, landing]);
  return <div className="library"><a className="library-skip" href="#library-main">Ir para o conteúdo</a><Header path={path} /><div className={landing ? '' : 'library-layout'}>{!landing && <Sidebar path={path} />}{landing ? <Landing /> : path === '/components' ? <Catalog /> : path === '/installation' ? <Installation /> : item ? <ComponentPage key={item.id} item={item} /> : <NotFound />}</div><footer className="library-footer"><a className="library-brand" href="/"><Mark /><span>jhosephe.</span></a><p>Interfaces feitas de pequenos detalhes.</p><a href="/components">Explore a coleção <ArrowUpRight {...iconProps} /></a><span>React · CSS · MIT</span></footer></div>;
}

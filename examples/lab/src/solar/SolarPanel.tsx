import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, LocateFixed, MapPin, Settings2, Sun, Sunrise } from 'lucide-react';
import { Button } from '../../../../assets/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../../../../assets/ui/dialog';
import { buildDayPath, buildSolarSnapshot, compassDirection, DEFAULT_LOCATION, formatTime, timezoneForCoordinates, type Location } from './solar';
import './solar.css';

type Snapshot = ReturnType<typeof buildSolarSnapshot>;
const degrees = (value: number | undefined, decimals = 1) => value == null ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
const pad = (value: number) => String(value).padStart(2, '0');
const hourSpan = (seconds: number | undefined) => seconds == null ? '—' : `${Math.floor(seconds / 3600)}h ${pad(Math.floor(seconds % 3600 / 60))}m`;
const phaseLabels: Record<Snapshot['status'], string> = { day: 'Acima do horizonte', night: 'Abaixo do horizonte', twilight: 'Crepúsculo', 'polar-day': 'Dia polar', 'polar-night': 'Noite polar' };

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => { if (!document.hidden) setNow(new Date()); };
    const timer = window.setInterval(refresh, 1000);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  return now;
}

function Scale({ x, reverse = false, value, bearing = false }: { x: number; reverse?: boolean; value?: number; bearing?: boolean }) {
  const min = bearing ? 0 : -90;
  const max = bearing ? 360 : 90;
  const marker = value == null ? null : 294 - ((value - min) / (max - min)) * 162;
  return <g transform={`translate(${x} 0)`}>
    {Array.from({ length: 37 }, (_, index) => {
      const y = 132 + index * 4.5;
      const major = index % 6 === 0;
      const n = max - index * (max - min) / 36;
      return <g key={index} opacity={major ? .7 : .35}>
        <line x1={reverse ? 0 : -28} x2={reverse ? (major ? 28 : 15) : 0} y1={y} y2={y} stroke="currentColor" strokeWidth={major ? .8 : .5} />
        {major && <text x={reverse ? 40 : -40} y={y + 3} textAnchor={reverse ? 'start' : 'end'} className="instrument__tick">{n}°</text>}
      </g>;
    })}
    {marker !== null && <g className="instrument__pointer" transform={`translate(0 ${marker})`}>
      <path d={reverse ? 'M-9,-4 L-2,0 L-9,4 Z' : 'M9,-4 L2,0 L9,4 Z'} fill="currentColor" />
      <line x1={reverse ? -19 : 19} x2={reverse ? -130 : 130} y1="0" y2="0" stroke="currentColor" strokeWidth=".6" />
    </g>}
  </g>;
}

function Instrument({ data, now, zone }: { data: Snapshot | null; now: Date; zone: string }) {
  const rise = formatTime(data?.sunrise ?? null, zone);
  const set = formatTime(data?.sunset ?? null, zone);
  const altitude = degrees(data?.altitude);
  const azimuth = degrees(data?.azimuth);
  return <section className="solar-instrument" aria-labelledby="instrument-title">
    <h1 className="sr-only" id="instrument-title">Posição do Sol em tempo real</h1>
    <svg className="instrument" viewBox="0 0 1440 440" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="display-silver" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fafafa" /><stop offset=".45" stopColor="#ededed" /><stop offset="1" stopColor="#f8f8f8" /></linearGradient>
        <linearGradient id="display-edge"><stop stopColor="#e0e0e0" /><stop offset=".25" stopColor="#f9f9f9" /><stop offset=".5" stopColor="#fff" /><stop offset=".8" stopColor="#f4f4f4" /><stop offset="1" stopColor="#ddd" /></linearGradient>
        <linearGradient id="wing-fade"><stop stopColor="#b0b0b0" stopOpacity=".22" /><stop offset="1" stopColor="#d6d6d6" stopOpacity="0" /></linearGradient>
        <clipPath id="display-clip"><path d="M18 131 Q720 -80 1422 131 L1422 424 Q720 238 18 424 Z" /></clipPath>
      </defs>
      <path className="instrument__housing" d="M10 128 Q720 -90 1430 128 L1430 434 Q720 246 10 434 Z" fill="#e4e4e4" stroke="url(#display-edge)" strokeWidth="2" />
      <g clipPath="url(#display-clip)">
        <path d="M18 131 Q720 -80 1422 131 L1422 424 Q720 238 18 424 Z" fill="url(#display-silver)" />
        <rect x="18" y="0" width="245" height="440" fill="url(#wing-fade)" />
        <rect x="18" y="0" width="245" height="440" fill="url(#wing-fade)" transform="translate(1440 0) scale(-1 1)" />
        {[0, 1, 2, 3].map(n => <g key={n} opacity={.1 - n * .02}><rect x={38 + n * 30} width="28" height="440" fill="#8c8c8c" /><rect x={1374 - n * 30} width="28" height="440" fill="#8c8c8c" /></g>)}
        <g className="instrument__ink">
          <path d="M556 67 h-18 v35 M884 67 h18 v35 M568 286 h-18 v35 h28 M872 286 h18 v35 h-28" className="instrument__bracket" />
          <text x="566" y="77" className="instrument__caption">Luz do dia</text>
          <text x="566" y="102" className="instrument__small-value">{hourSpan(data?.dayLengthSeconds)}</text>
          <text x="874" y="77" className="instrument__caption" textAnchor="end">Hora local</text>
          <text x="874" y="102" className="instrument__small-value instrument__clock" textAnchor="end">{data ? formatTime(now, zone, true) : '—'}</text>
          <text x="720" y="144" textAnchor="middle" className="instrument__eyebrow">ELEVAÇÃO SOLAR</text>
          <text x="720" y="246" textAnchor="middle" className="instrument__main">{altitude}<tspan className="instrument__unit" dy="-38">°</tspan></text>
          <text x="720" y="270" textAnchor="middle" className="instrument__caption">{data ? phaseLabels[data.status] : 'Permita o acesso à localização'}</text>
          <text x="575" y="299" className="instrument__caption">Azimute</text>
          <text x="575" y="324" className="instrument__small-value">{azimuth}°</text>
          <text x="865" y="299" className="instrument__caption" textAnchor="end">Direção</text>
          <text x="865" y="324" className="instrument__small-value" textAnchor="end">{data ? compassDirection(data.azimuth) : '—'}</text>
          <Scale x={397} value={data?.altitude} />
          <Scale x={1043} value={data?.azimuth} reverse bearing />
          <text x="248" y="210" textAnchor="middle" className="instrument__caption">Nascer do sol</text>
          <text x="248" y="249" textAnchor="middle" className="instrument__event">{rise}</text>
          <path d="M186 270 h124" className="instrument__bracket" />
          <text x="248" y="291" textAnchor="middle" className="instrument__eyebrow">HORIZONTE / LESTE</text>
          <text x="1192" y="210" textAnchor="middle" className="instrument__caption">Pôr do sol</text>
          <text x="1192" y="249" textAnchor="middle" className="instrument__event">{set}</text>
          <path d="M1130 270 h124" className="instrument__bracket" />
          <text x="1192" y="291" textAnchor="middle" className="instrument__eyebrow">HORIZONTE / OESTE</text>
        </g>
      </g>
      <path d="M20 132 Q720 -77 1420 132" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.5" />
    </svg>
    <div className="instrument-mobile">
      <span className="solar-label">ELEVAÇÃO SOLAR</span>
      <div className="instrument-mobile__value">{altitude}<sup>°</sup></div>
      <span>{data ? phaseLabels[data.status] : 'Aguardando localização'}</span>
      <dl><div><dt>Nascer do sol</dt><dd>{rise}</dd></div><div><dt>Pôr do sol</dt><dd>{set}</dd></div><div><dt>Azimute</dt><dd>{azimuth}°</dd></div><div><dt>Direção</dt><dd>{data ? compassDirection(data.azimuth) : '—'}</dd></div></dl>
    </div>
    <dl className="sr-only instrument-data"><div><dt>Elevação solar</dt><dd>{altitude} graus</dd></div><div><dt>Nascer do sol</dt><dd>{rise}</dd></div><div><dt>Pôr do sol</dt><dd>{set}</dd></div><div><dt>Azimute solar</dt><dd>{azimuth} graus</dd></div><div><dt>Direção solar</dt><dd>{data ? compassDirection(data.azimuth) : 'Indisponível'}</dd></div></dl>
    <div className="instrument-pedestal" aria-hidden="true"><div className="instrument-pedestal__flutes">{Array.from({ length: 13 }, (_, i) => <i key={i} style={{ opacity: .25 + .65 * (data ? Math.max(0, Math.cos(data.altitude * Math.PI / 180)) : .5) }} />)}</div></div>
  </section>;
}

function DayPath({ now, location, data }: { now: Date; location: Location | null; data: Snapshot | null }) {
  const day = location ? new Intl.DateTimeFormat('en-CA', { timeZone: location.timeZone }).format(now) : '';
  const samples = useMemo(() => location ? buildDayPath(now, location) : [], [day, location]);
  const plot = { left: 32, right: 1068, top: 20, bottom: 154 };
  const start = samples[0]?.time.getTime() ?? 0;
  const end = samples.at(-1)?.time.getTime() ?? 1;
  const x = (ms: number) => plot.left + (ms - start) / (end - start) * (plot.right - plot.left);
  const y = (alt: number) => plot.top + (90 - alt) / 180 * (plot.bottom - plot.top);
  const path = samples.map((sample, i) => `${i ? 'L' : 'M'}${x(sample.time.getTime()).toFixed(2)} ${y(sample.altitude).toFixed(2)}`).join(' ');
  return <section className="solar-path" aria-labelledby="path-title">
    <div className="solar-path__header"><h2 id="path-title">O percurso da luz</h2><span className="solar-label">HOJE / DIA LOCAL</span></div>
    <div className="solar-path__plot">
      <svg viewBox="0 0 1100 182" role="img" aria-label={data ? `Trajetória diária da elevação solar. Agora: ${degrees(data.altitude)} graus acima do horizonte.` : 'Trajetória solar aguardando localização.'}>
        <defs><linearGradient id="path-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#555" stopOpacity=".08" /><stop offset="1" stopColor="#555" stopOpacity="0" /></linearGradient></defs>
        {[90, 0, -90].map(alt => <g key={alt}><line x1={32} x2={1068} y1={y(alt)} y2={y(alt)} className={alt === 0 ? 'solar-path__horizon' : 'solar-path__grid'} /><text x="0" y={y(alt) + 3}>{alt > 0 ? '+' : ''}{alt}°</text></g>)}
        {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1={32 + i * 259} x2={32 + i * 259} y1="20" y2="154" className="solar-path__grid" /><text x={32 + i * 259} y="178" textAnchor="middle">{samples[i * 24] && location ? formatTime(samples[i * 24].time, location.timeZone) : `${pad(i * 6)}:00`}</text></g>)}
        {path && <><path className="solar-path__area" d={`${path} L1068 154 L32 154 Z`} fill="url(#path-fill)" /><path className="solar-path__curve" d={path} fill="none" stroke="#555" strokeWidth="1.3" vectorEffect="non-scaling-stroke" /></>}
        {data && <g><line className="solar-path__now" x1={x(now.getTime())} x2={x(now.getTime())} y1="12" y2="154" stroke="#aaa" strokeWidth=".7" strokeDasharray="2 4" /><circle className="solar-path__halo" cx={x(now.getTime())} cy={y(data.altitude)} r="9" fill="#333" fillOpacity=".08" /><circle className="solar-path__marker" cx={x(now.getTime())} cy={y(data.altitude)} r="3.5" fill="#333" /></g>}
      </svg>
      {!location && <p className="solar-path__empty">Sua localização revela o percurso de hoje.</p>}
    </div>
    <div className="solar-path__axis" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <span key={i}>{samples[i * 24] && location ? formatTime(samples[i * 24].time, location.timeZone) : `${pad(i * 6)}:00`}</span>)}</div><div className="solar-path__legend"><span><i /> Elevação solar</span><span>Linha tracejada · horizonte de 0°</span><span>Hora local{location ? ` · ${location.timeZone}` : ''}</span></div>
  </section>;
}

export function SolarPanel() {
  const now = useClock();
  const [location, setLocation] = useState<Location | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [source, setSource] = useState<'device' | 'manual'>('device');
  const [geoState, setGeoState] = useState<'pending' | 'ready' | 'error'>('pending');
  const [message, setMessage] = useState('Aguardando permissão de localização…');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_LOCATION);
  const requested = useRef(false);
  const requestId = useRef(0);
  const requestLocation = useCallback(() => {
    const id = ++requestId.current;
    if (!navigator.geolocation) { setGeoState('error'); setMessage('Este navegador não oferece localização. Informe suas coordenadas.'); return; }
    setGeoState('pending');
    setMessage('Aguardando permissão de localização…');
    navigator.geolocation.getCurrentPosition(position => {
      if (id !== requestId.current) return;
      const { latitude, longitude, accuracy: precision } = position.coords;
      let timeZone: string;
      try { timeZone = timezoneForCoordinates(latitude, longitude); } catch { setGeoState('error'); setMessage('Confira suas coordenadas e informe o fuso horário manualmente.'); return; }
      const next = { name: 'Sua localização', latitude, longitude, timeZone };
      setLocation(next); setDraft(next); setAccuracy(precision); setSource('device'); setGeoState('ready'); setMessage('Localização do dispositivo ativa.'); setOpen(false);
    }, error => {
      if (id !== requestId.current) return;
      setGeoState('error');
      setMessage(error.code === 1 ? 'Acesso à localização não autorizado. Libere no navegador ou informe suas coordenadas.' : 'Não foi possível obter a localização. Tente novamente ou informe suas coordenadas.');
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }, []);
  useEffect(() => {
    document.title = 'jhosephe — Observatório solar';
    if (!requested.current) { requested.current = true; requestLocation(); }
  }, [requestLocation]);
  const data = useMemo(() => location ? buildSolarSnapshot(now, location) : null, [now, location]);
  const zone = location?.timeZone ?? 'UTC';
  const nextSeconds = data?.nextEvent ? Math.max(0, Math.floor((data.nextEvent.time.getTime() - now.getTime()) / 1000)) : null;
  const remaining = nextSeconds == null ? '—' : `${pad(Math.floor(nextSeconds / 3600))}:${pad(Math.floor(nextSeconds % 3600 / 60))}:${pad(nextSeconds % 60)}`;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      new Intl.DateTimeFormat('pt-BR', { timeZone: draft.timeZone });
      buildSolarSnapshot(now, draft);
      requestId.current++; setLocation(draft); setSource('manual'); setAccuracy(null); setGeoState('ready'); setMessage('Localização definida manualmente.'); setOpen(false);
    } catch { setMessage('Confira as coordenadas e use um fuso válido, como America/Fortaleza.'); }
  };
  return <div className="solar-page">
    <a className="skip-link" href="#solar-main">Ir para o painel</a>
    <header className="solar-topbar">
      <a className="solar-brand" href="/" aria-label="jhosephe / solar, voltar ao início"><span className="solar-brand__symbol" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 8v8c0 4-2 6-6 6" stroke="currentColor" strokeWidth="1.4"/><circle cx="14" cy="4" r="1" fill="currentColor"/></svg></span><span>jhosephe<span className="solar-brand__suffix"> / solar</span></span></a>
      <span className="solar-label solar-topbar__edition">INSTRUMENTO 002</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button className="solar-location"><MapPin size={14} aria-hidden="true" /><span>{location?.name ?? 'Definir localização'}</span><Settings2 size={14} aria-hidden="true" /></Button></DialogTrigger>
        <DialogContent className="solar-settings">
          <span className="solar-label">PONTO DE OBSERVAÇÃO</span><DialogTitle className="dialog-title">De onde você vê o Sol?</DialogTitle>
          <DialogDescription className="dialog-description">Use o dispositivo ou informe coordenadas. O cálculo acontece aqui, sem enviar sua localização a um servidor.</DialogDescription>
          <Button onClick={requestLocation} disabled={geoState === 'pending'}><LocateFixed size={16} aria-hidden="true" /> Usar minha localização</Button>
          <form onSubmit={submit} className="solar-settings__form">
            <label>Nome do local<input value={draft.name} required maxLength={60} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
            <div className="solar-settings__coordinates"><label>Latitude<input type="number" min="-90" max="90" step="any" required value={Number.isFinite(draft.latitude) ? draft.latitude : ''} onChange={e => setDraft({ ...draft, latitude: e.target.valueAsNumber })} /></label><label>Longitude<input type="number" min="-180" max="180" step="any" required value={Number.isFinite(draft.longitude) ? draft.longitude : ''} onChange={e => setDraft({ ...draft, longitude: e.target.valueAsNumber })} /></label></div>
            <label>Fuso horário<input required value={draft.timeZone} onChange={e => setDraft({ ...draft, timeZone: e.target.value })} /></label>
            <Button type="submit" variant="primary">Aplicar localização <ArrowUpRight size={15} aria-hidden="true" /></Button>
          </form>
          <p className="solar-settings__message" role="status">{message}</p>
        </DialogContent>
      </Dialog>
    </header>
    <main id="solar-main">
      <div className="solar-heading"><div><span className="solar-label">OBSERVATÓRIO SOLAR</span><p>O tempo, pela luz.</p></div><div className="solar-live"><i aria-hidden="true" />{location ? 'EM TEMPO REAL' : 'AGUARDANDO LOCALIZAÇÃO'}<span>{location ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: zone }).format(now) : 'LOCALIZAÇÃO DO DISPOSITIVO'}</span></div></div>
      <Instrument data={data} now={now} zone={zone} />
      <div className="solar-console">
        <div className="solar-console__event"><span className="solar-label">{data?.nextEvent ? (data.nextEvent.kind === 'sunrise' ? 'ATÉ O PRÓXIMO NASCER' : 'ATÉ O PÔR DO SOL') : 'PRÓXIMO EVENTO'}</span><strong>{remaining}</strong></div>
        <div className="solar-console__separator" aria-hidden="true" />
        <div className="solar-console__day"><Sun size={20} strokeWidth={1.1} aria-hidden="true" /><div><span className="solar-label">MEIO-DIA SOLAR</span><strong>{formatTime(data?.solarNoon ?? null, zone)}</strong></div></div>
        <div className="solar-console__day"><Sunrise size={20} strokeWidth={1.1} aria-hidden="true" /><div><span className="solar-label">DURAÇÃO DO DIA</span><strong>{hourSpan(data?.dayLengthSeconds)}</strong></div></div>
      </div>
      <div className="solar-bottom">
        <div className="solar-location-status" aria-live="polite"><LocateFixed size={14} aria-hidden="true" /><span>{location ? `${source === 'device' ? 'Dispositivo' : 'Coordenadas manuais'} · ${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°${accuracy == null ? '' : ` · precisão ±${Math.ceil(accuracy)} m`}` : message}</span>{geoState === 'error' && <button type="button" onClick={() => setOpen(true)}>Configurar localização <ArrowUpRight size={14} aria-hidden="true" /></button>}</div>
        <DayPath now={now} location={location} data={data} />
      </div>
    </main>
    <footer className="solar-footer"><a href="/lab"><ArrowLeft size={13} aria-hidden="true" /> Laboratório</a><p>Atualização a cada segundo · posição calculada · horizonte livre · horários sujeitos às condições atmosféricas</p><span className="solar-label">J / 002</span></footer>
  </div>;
}

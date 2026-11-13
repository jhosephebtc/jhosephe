import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronDown, Clock3 } from 'lucide-react';
import { Button } from './button';
import { Calendar } from './calendar';
import { PickerPanel } from './picker-panel';
import { ShaderSurface } from './shader-surface';
import { surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export interface ObservatoryOption {
  name: string;
  zone: string;
  lat: number;
  lon: number;
}

export interface EphemerisSelection {
  location: string;
  date: string;
  time: string;
  target: string;
  latitude: number;
  longitude: number;
  zone: string;
}

const DEFAULT_OBSERVATORIES: ObservatoryOption[] = [
  { name: 'Fortaleza', zone: 'America/Fortaleza', lat: -3.7319, lon: -38.5267 },
  { name: 'Reykjavik', zone: 'Atlantic/Reykjavik', lat: 64.1466, lon: -21.9426 },
  { name: 'Mauna Kea', zone: 'Pacific/Honolulu', lat: 19.8207, lon: -155.4681 },
  { name: 'Atacama', zone: 'America/Santiago', lat: -23.8634, lon: -69.1328 },
  { name: 'Greenwich', zone: 'Europe/London', lat: 51.4769, lon: -0.0005 },
  { name: 'La Palma', zone: 'Atlantic/Canary', lat: 28.7636, lon: -17.8947 },
];

const TARGETS = [
  { name: 'Sun', glyph: '☉' },
  { name: 'Moon', glyph: '☽' },
  { name: 'Mercury', glyph: '☿' },
  { name: 'Venus', glyph: '♀' },
  { name: 'Mars', glyph: '♂' },
  { name: 'Jupiter', glyph: '♃' },
  { name: 'Saturn', glyph: '♄' },
] as const;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0');
  const minute = index % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

const parseIsoDate = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return new Date();
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const formatDisplayDate = (iso: string) => {
  const parsed = parseIsoDate(iso);
  if (!Number.isFinite(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
};

const localDateValue = (date = new Date()) =>
  [
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

/** Ephemeris observation picker styled with the layered review modal language. */
export function EphemerisPicker({
  onChange,
  observatories = DEFAULT_OBSERVATORIES,
  material = 'solid',
  label = 'Observation',
}: {
  onChange?: (selection: EphemerisSelection) => void;
  observatories?: ObservatoryOption[];
  material?: SurfaceMaterial;
  label?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState(observatories[0]?.name ?? 'Fortaleza');
  const [date, setDate] = useState(() => localDateValue());
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [target, setTarget] = useState('Sun');
  const [obsOpen, setObsOpen] = useState(false);
  const [obsQuery, setObsQuery] = useState('');
  const [dateOpen, setDateOpen] = useState(false);
  const [datePos, setDatePos] = useState<{ left: number; top: number }>({ left: 16, top: 80 });
  const [timeOpen, setTimeOpen] = useState(false);
  const [timeQuery, setTimeQuery] = useState('');
  const [status, setStatus] = useState('Current observation');

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const obsTriggerRef = useRef<HTMLButtonElement>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const datePopoverRef = useRef<HTMLDivElement>(null);
  const timeTriggerRef = useRef<HTMLButtonElement>(null);
  const targetsTrackRef = useRef<HTMLDivElement>(null);
  const targetBtnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [targetThumb, setTargetThumb] = useState({ x: 0, y: 0, w: 0, h: 0, ready: false });

  useLayoutEffect(() => {
    if (!open) return;
    const measureThumb = () => {
      const root = targetsTrackRef.current;
      const idx = Math.max(0, TARGETS.findIndex(item => item.name === target));
      const btn = targetBtnRefs.current[idx];
      if (!root || !btn) return;
      const rootBox = root.getBoundingClientRect();
      const btnBox = btn.getBoundingClientRect();
      setTargetThumb({
        x: btnBox.left - rootBox.left,
        y: btnBox.top - rootBox.top,
        w: btnBox.width,
        h: btnBox.height,
        ready: true,
      });
    };
    measureThumb();
    const root = targetsTrackRef.current;
    const ro = typeof ResizeObserver !== 'undefined' && root ? new ResizeObserver(measureThumb) : null;
    if (root && ro) ro.observe(root);
    window.addEventListener('resize', measureThumb);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measureThumb);
    };
  }, [open, target]);

  const finish = material === 'liquid-glass' ? 'glass' : material;
  const matAttr = surfaceMaterialAttr(material);

  const selected = observatories.find(item => item.name === location) ?? observatories[0];
  const selectedGlyph = TARGETS.find(item => item.name === target)?.glyph ?? '☉';
  const selectedDateObj = useMemo(() => parseIsoDate(date), [date]);

  const obsResults = useMemo(
    () =>
      observatories.filter(item =>
        `${item.name} ${item.zone}`.toLowerCase().includes(obsQuery.toLowerCase()),
      ),
    [observatories, obsQuery],
  );

  const timeResults = useMemo(() => {
    const q = timeQuery.trim();
    const list = q ? TIME_OPTIONS.filter(slot => slot.includes(q)) : TIME_OPTIONS;
    const validCustom = /^([01]?\d|2[0-3]):[0-5]\d$/.test(q);
    if (validCustom) {
      const normalized = q.length === 4 ? `0${q}` : q;
      return list.includes(normalized) ? list : [normalized, ...list];
    }
    return list;
  }, [timeQuery]);

  useEffect(() => {
    if (!dateOpen) return;
    const place = () => {
      const el = dateTriggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = Math.min(308, window.innerWidth - 24);
      const height = 340;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const top = spaceBelow >= height || spaceBelow >= rect.top - 12
        ? Math.min(rect.bottom + 8, window.innerHeight - height - 12)
        : Math.max(12, rect.top - height - 8);
      setDatePos({ left, top });
    };
    place();
    const onPointerDown = (event: MouseEvent) => {
      const node = event.target as Node;
      if (datePopoverRef.current?.contains(node) || dateTriggerRef.current?.contains(node)) return;
      setDateOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setDateOpen(false);
        dateTriggerRef.current?.focus();
      }
    };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [dateOpen]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = panelRef.current?.querySelector<HTMLElement>(
      'button:not(:disabled),input:not(:disabled),[href]',
    );
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
      setObsOpen(false);
      setDateOpen(false);
      setTimeOpen(false);
      triggerRef.current?.focus();
      if (previous && previous !== document.body) previous.focus?.();
    };
  }, [open]);

  const apply = () => {
    onChange?.({
      location: selected.name,
      date,
      time,
      target,
      latitude: selected.lat,
      longitude: selected.lon,
      zone: selected.zone,
    });
    setStatus(`${target} · ${selected.name}`);
    setOpen(false);
  };

  const resetToNow = () => {
    setDate(localDateValue());
    setTime(new Date().toTimeString().slice(0, 5));
  };

  const modal = open && (
    <div
      className={`jh-financial-order__backdrop${finish === 'liquid' ? ' is-liquid-stage' : finish === 'glass' ? ' is-glass-stage' : ''}`}
      data-jh-material={matAttr}
      onMouseDown={event => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      {finish === 'liquid' && (
        <div className="jh-financial-order__stage-light" aria-hidden="true">
          <ShaderSurface />
        </div>
      )}
      <div
        ref={panelRef}
        data-jh-material={matAttr}
        className={`jh-financial-order jh-ephemeris-dialog${finish === 'liquid' ? ' jh-menu--liquid' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
      >
        <header className="jh-financial-order__header">
          <div>
            <span className="jh-financial-order__eyebrow">Observation · Ephemeris</span>
            <h2 id={`${id}-title`}>Set the sky</h2>
            <p id={`${id}-description`}>Choose an observatory, local moment, and celestial target.</p>
          </div>
          <button
            className="jh-financial-order__close"
            type="button"
            aria-label="Close observation picker"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </header>

        <div className="jh-financial-order__body">
          <section className="jh-financial-order__asset">
            <span className="jh-ephemeris-picker__glyph jh-market-picker__ticker" aria-hidden="true">
              {selectedGlyph}
            </span>
            <div>
              <strong>{target} · {selected.name}</strong>
              <span>{selected.zone}</span>
            </div>
            <div>
              <strong>{date}</strong>
              <small>{time} local</small>
            </div>
          </section>

          <div className="jh-ephemeris-picker__obs-field">
            <span className="jh-financial-order__field-label" id={`${id}-obs-label`}>Observatory</span>
            <button
              ref={obsTriggerRef}
              type="button"
              className="jh-financial-order__type-trigger jh-input"
              aria-labelledby={`${id}-obs-label`}
              aria-haspopup="listbox"
              aria-expanded={obsOpen}
              onClick={() => setObsOpen(prev => !prev)}
            >
              <span>{selected.name} · {selected.zone}</span>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            <PickerPanel
              open={obsOpen}
              triggerRef={obsTriggerRef}
              material={matAttr}
              onClose={() => { setObsOpen(false); setObsQuery(''); }}
              search={obsQuery}
              onSearchChange={setObsQuery}
              searchPlaceholder="Search observatory or zone"
              label="Observatory options"
              className="jh-financial-order__type-panel"
              preferredHeight={240}
              footer={<p>Coordinates · Decimal degrees</p>}
            >
              <ul className="jh-financial-order__type-options" role="listbox" aria-label="Observatory options">
                {obsResults.map(item => (
                  <li key={item.name}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={location === item.name}
                      onClick={() => {
                        setLocation(item.name);
                        setObsOpen(false);
                        setObsQuery('');
                      }}
                    >
                      <strong>{item.name}</strong>
                      <small>{item.zone} · {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°</small>
                    </button>
                  </li>
                ))}
                {!obsResults.length && <li className="jh-currency-picker__empty">No matching observatories.</li>}
              </ul>
            </PickerPanel>
          </div>

          <div className="jh-financial-order__fields">
            <div className="jh-ephemeris-picker__field-group">
              <span className="jh-financial-order__field-label" id={`${id}-date-label`}>Date</span>
              <button
                ref={dateTriggerRef}
                type="button"
                className="jh-financial-order__type-trigger jh-ephemeris-picker__field-btn"
                aria-labelledby={`${id}-date-label`}
                aria-haspopup="dialog"
                aria-expanded={dateOpen}
                onClick={() => {
                  setTimeOpen(false);
                  setObsOpen(false);
                  setDateOpen(prev => !prev);
                }}
              >
                <span className="jh-ephemeris-picker__field-value">
                  <CalendarDays size={14} strokeWidth={1.7} aria-hidden="true" />
                  <span>{formatDisplayDate(date)}</span>
                </span>
                <ChevronDown size={14} strokeWidth={1.7} aria-hidden="true" />
              </button>
              {dateOpen && typeof document !== 'undefined'
                ? createPortal(
                    <div
                      ref={datePopoverRef}
                      data-jh-material={matAttr}
                      className="jh-picker-overlay jh-date-popover jh-ephemeris-date-popover"
                      role="dialog"
                      aria-label="Choose observation date"
                      style={{ position: 'fixed', left: datePos.left, top: datePos.top, zIndex: 1250 }}
                    >
                      <Calendar
                        mode="single"
                        selected={selectedDateObj}
                        defaultMonth={selectedDateObj}
                        autoFocus
                        onSelect={picked => {
                          if (picked) setDate(localDateValue(picked));
                          setDateOpen(false);
                          dateTriggerRef.current?.focus();
                        }}
                      />
                      <button
                        type="button"
                        className="jh-date-picker__clear"
                        onClick={() => {
                          setDate(localDateValue());
                          setDateOpen(false);
                          dateTriggerRef.current?.focus();
                        }}
                      >
                        Today
                      </button>
                    </div>,
                    document.body,
                  )
                : null}
            </div>

            <div className="jh-ephemeris-picker__field-group">
              <span className="jh-financial-order__field-label" id={`${id}-time-label`}>Local time</span>
              <button
                ref={timeTriggerRef}
                type="button"
                className="jh-financial-order__type-trigger jh-ephemeris-picker__field-btn"
                aria-labelledby={`${id}-time-label`}
                aria-haspopup="listbox"
                aria-expanded={timeOpen}
                onClick={() => {
                  setDateOpen(false);
                  setObsOpen(false);
                  setTimeOpen(prev => !prev);
                }}
              >
                <span className="jh-ephemeris-picker__field-value">
                  <Clock3 size={14} strokeWidth={1.7} aria-hidden="true" />
                  <span>{time}</span>
                </span>
                <ChevronDown size={14} strokeWidth={1.7} aria-hidden="true" />
              </button>
              <PickerPanel
                open={timeOpen}
                triggerRef={timeTriggerRef}
                material={matAttr}
                onClose={() => { setTimeOpen(false); setTimeQuery(''); }}
                search={timeQuery}
                onSearchChange={setTimeQuery}
                searchPlaceholder="Search or type HH:MM"
                label="Local time options"
                className="jh-financial-order__type-panel"
                preferredHeight={240}
                footer={<p>Local observatory clock · 24h</p>}
              >
                <ul className="jh-financial-order__type-options jh-ephemeris-picker__time-options" role="listbox" aria-label="Local time options">
                  {timeResults.map(slot => (
                    <li key={slot}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={time === slot}
                        onClick={() => {
                          setTime(slot);
                          setTimeOpen(false);
                          setTimeQuery('');
                        }}
                      >
                        <strong>{slot}</strong>
                        <small>{slot === time ? 'Current selection' : 'Local time'}</small>
                      </button>
                    </li>
                  ))}
                  {!timeResults.length && <li className="jh-currency-picker__empty">Enter HH:MM (00:00–23:59).</li>}
                </ul>
              </PickerPanel>
            </div>
          </div>

          <div className="jh-ephemeris-picker__targets-wrap">
            <span className="jh-financial-order__field-label">Celestial body</span>
            <div ref={targetsTrackRef} className="jh-ephemeris-picker__targets jh-segmented" role="group" aria-label="Celestial body">
              <span
                className="jh-segmented__thumb jh-ephemeris-picker__thumb"
                aria-hidden="true"
                data-ready={targetThumb.ready || undefined}
                style={{
                  width: `${targetThumb.w}px`,
                  height: `${targetThumb.h}px`,
                  transform: `translate3d(${targetThumb.x}px, ${targetThumb.y}px, 0)`,
                }}
              />
              {TARGETS.map((item, idx) => (
                <button
                  ref={el => { targetBtnRefs.current[idx] = el; }}
                  type="button"
                  key={item.name}
                  aria-pressed={target === item.name}
                  onClick={() => setTarget(item.name)}
                >
                  <span aria-hidden="true">{item.glyph}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="jh-financial-order__account">
            <div>
              <span>Observer coordinates</span>
              <strong>{selected.lat.toFixed(4)}°, {selected.lon.toFixed(4)}°</strong>
            </div>
            <span>
              Time zone
              <br />
              <b>{selected.zone}</b>
            </span>
          </div>

          <div className="jh-financial-order__summary">
            <span>Selected target</span>
            <strong>{selectedGlyph} {target}</strong>
            <small>Ready to bind to an external ephemeris feed or local sky model.</small>
          </div>
        </div>

        <footer className="jh-financial-order__footer">
          <button type="button" className="jh-financial-order__cancel" onClick={resetToNow}>
            Now
          </button>
          <Button variant="primary" onClick={apply}>
            Apply observation
          </Button>
        </footer>
      </div>
    </div>
  );

  return (
    <section className="jh-ephemeris-picker" data-jh-material={matAttr}>
      <span className="jh-ephemeris-picker__eyebrow">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        className="jh-ephemeris-picker__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="jh-ephemeris-picker__glyph" aria-hidden="true">{selectedGlyph}</span>
        <span>
          <strong>{target} · {selected.name}</strong>
          <small>{date} at {time} · {selected.zone}</small>
        </span>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {typeof document !== 'undefined' && modal ? createPortal(modal, document.body) : null}
      <span className="jh-visually-hidden" role="status">{status}</span>
    </section>
  );
}

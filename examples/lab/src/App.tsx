import './lab.css';
import { ThemeToggle } from './theme';
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, Check, CircleDashed, MoveRight, Sparkles } from 'lucide-react';
import { Accordion } from '../../../assets/ui/accordion';
import { AstrologyWheel } from '../../../assets/ui/astrology-wheel';
import { AstronomyInstrument } from '../../../assets/ui/astronomy-instrument';
import { AudioMeter } from '../../../assets/ui/audio-meter';
import { BarSlider } from '../../../assets/ui/bar-slider';
import { Button } from '../../../assets/ui/button';
import { CommandPalette } from '../../../assets/ui/command-palette';
import { Compass } from '../../../assets/ui/compass';
import { Slider, Switch } from '../../../assets/ui/controls';
import { DataTable, type DataTableColumn } from '../../../assets/ui/data-table';
import { DetentDial } from '../../../assets/ui/detent-dial';
import { Dial } from '../../../assets/ui/dial';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../../../assets/ui/dialog';
import { EphemerisPicker } from '../../../assets/ui/ephemeris-picker';
import { FinanceNavigation } from '../../../assets/ui/finance-navigation';
import { FinancialChart } from '../../../assets/ui/financial-chart';
import { InstrumentBars } from '../../../assets/ui/instrument';
import { LunarEphemeris } from '../../../assets/ui/lunar-ephemeris';
import { MetricCard } from '../../../assets/ui/metric-card';
import { SegmentedControl } from '../../../assets/ui/segmented-control';
import { ShaderSurface } from '../../../assets/ui/shader-surface';
import { SmoothShape } from '../../../assets/ui/smooth-shape';
import { SpectrumControl } from '../../../assets/ui/spectrum-control';
import { Tabs } from '../../../assets/ui/tabs';
import { TactileKey } from '../../../assets/ui/tactile-key';
import { TactileLever } from '../../../assets/ui/tactile-lever';
import { TideInstrument } from '../../../assets/ui/tide-instrument';
import { WeatherConditions } from '../../../assets/ui/weather-conditions';
import { WeatherInstrument } from '../../../assets/ui/weather-instrument';
import { WindInstrument } from '../../../assets/ui/wind-instrument';
import type { SurfaceMaterial } from '../../../assets/ui/weather-ephemeris';

function Wordmark() {
  return <a className="brand" href="/" aria-label="jhosephe, home">
    <span className="brand__mark" aria-hidden="true"><span /></span>
    <span>jhosephe<span className="brand__period">.</span></span>
  </a>;
}

function ControlDeck() {
  const [level, setLevel] = useState(64);
  const [ambient, setAmbient] = useState(true);
  return (
    <section className="deck" aria-labelledby="deck-heading">
      <div className="deck__topline"><span>Interaction study</span><span>01 / 03</span></div>
      <div className="deck__heading"><div><span className="eyebrow">Control / 01</span><h2 id="deck-heading">A precise response.</h2></div><span className="deck__number">J—01</span></div>
      <div className={ambient ? 'display display--ambient' : 'display'}>
        <div className="display__top"><span>Dynamic output</span><span><i /> System active</span></div>
        <div className="display__value"><output aria-live="off">{level}</output><span>%</span></div>
        <div className="display__meta"><span>Intensity</span><span>0 — 100</span></div>
        <InstrumentBars value={level} />
      </div>
      <div className="deck__control">
        <div className="deck__control-copy"><span className="eyebrow">Manual control</span><strong>Touch and adjust</strong><p>Drag the control or use the arrow keys.</p></div>
        <Dial value={level} onChange={setLevel} label="Adjust intensity" />
      </div>
      <div className="deck__slider">
        <div className="deck__label"><span id="intensity-label">Intensity</span><output>{level}%</output></div>
        <Slider labelId="intensity-label" value={[level]} max={100} step={1} onValueChange={values => setLevel(values[0])} />
      </div>
      <div className="deck__footer">
        <div className="switch-copy"><label htmlFor="ambient">Ambient light</label><span>A soft reflection on the surface</span></div>
        <Switch id="ambient" checked={ambient} onCheckedChange={setAmbient} aria-describedby="ambient-state" />
        <span className="sr-only" id="ambient-state">{ambient ? 'Enabled' : 'Disabled'}</span>
      </div>
      <Dialog>
        <DialogTrigger asChild><Button className="deck__action" variant="primary">Explore the control <ArrowUpRight size={15} aria-hidden="true" /></Button></DialogTrigger>
        <DialogContent>
          <span className="eyebrow">Study / 01</span>
          <DialogTitle className="dialog-title">The feeling is in the details.</DialogTitle>
          <DialogDescription className="dialog-description">The dial, slider, and keyboard control the same value. The display stays readable with reduced motion.</DialogDescription>
          <div className="dialog-readout"><span>Current intensity</span><strong>{level}%</strong></div>
          <DialogClose asChild><Button variant="primary">Got it <Check size={15} aria-hidden="true" /></Button></DialogClose>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function MaterialStudy() {
  const [smoothing, setSmoothing] = useState(60);
  return (
    <section id="materiais" className="materials" aria-labelledby="materials-heading">
      <div className="section-heading"><div><span className="eyebrow">02 / Surfaces</span><h2 id="materials-heading">Material, with intention.</h2></div><p>Three layers. One language.<br />Designed to work together.</p></div>
      <div className="material-grid">
        <article className="material-card">
          <div className="material-card__art mineral-art" aria-hidden="true"><div className="mineral-block"><span /></div></div>
          <div className="material-card__copy"><div><span>01 / Mineral</span><h3>A quiet foundation.</h3><p>Light surfaces for what matters.</p></div><ArrowUpRight size={17} aria-hidden="true" /></div>
        </article>
        <article className="material-card">
          <div className="material-card__art glass-art" aria-hidden="true"><ShaderSurface /><div className="glass-pill"><span className="glass-pill__light" /><span /><span /><span /></div></div>
          <div className="material-card__copy"><div><span>02 / Glass</span><h3>Layers of light.</h3><p>Transparency where it makes sense.</p></div><ArrowUpRight size={17} aria-hidden="true" /></div>
        </article>
        <article className="material-card">
          <div className="material-card__art relief-art" aria-hidden="true"><div className="relief-bed"><div className="relief-lens"><span /></div></div></div>
          <div className="material-card__copy"><div><span>03 / Relief</span><h3>Subtle depth.</h3><p>Light and volume shape the touch.</p></div><ArrowUpRight size={17} aria-hidden="true" /></div>
        </article>
      </div>
      <div className="corner-study">
        <div className="corner-study__copy"><span className="eyebrow">Form / 04</span><h3>The detail is in the curve.</h3><p>The radius stays the same as the corner transition changes.</p>
          <div className="corner-study__label"><span id="smoothing-label">Smoothing</span><output>{smoothing}%</output></div>
          <Slider labelId="smoothing-label" value={[smoothing]} min={0} max={100} step={1} onValueChange={values => setSmoothing(values[0])} />
        </div>
        <div className="corner-study__samples" aria-hidden="true">
          <div><span className="corner-study__shape"><SmoothShape className="corner-study__face" radius={28} smoothing={0} /></span><span>00% / Curve</span></div>
          <div><span className="corner-study__shape"><SmoothShape className="corner-study__face" radius={28} smoothing={smoothing / 100} /></span><span>{String(smoothing).padStart(2, '0')}% / Continuous</span></div>
        </div>
      </div>
    </section>
  );
}

type StationRow = {
  station: string;
  elevation: string;
  temp: string;
  wind: string;
  pressure: string;
  seeing: string;
};

const LAB_STATION_COLUMNS: DataTableColumn<StationRow>[] = [
  { key: 'station', label: 'Station', sortable: true },
  { key: 'elevation', label: 'Elevation', align: 'right', sortable: true, numeric: true },
  { key: 'temp', label: 'Temp', align: 'right', sortable: true, numeric: true },
  { key: 'wind', label: 'Wind', align: 'right', sortable: true, numeric: true },
  { key: 'pressure', label: 'Pressure', align: 'right', sortable: true, numeric: true },
  { key: 'seeing', label: 'Seeing', align: 'right', sortable: true },
];

const LAB_STATION_ROWS: StationRow[] = [
  { station: 'Fortaleza', elevation: '16 m', temp: '27.6 °C', wind: '22.4 km/h', pressure: '1014 hPa', seeing: '0.94"' },
  { station: 'Atacama', elevation: '5050 m', temp: '14.2 °C', wind: '11.8 km/h', pressure: '556 hPa', seeing: '0.42"' },
  { station: 'Mauna Kea', elevation: '4205 m', temp: '4.5 °C', wind: '31.0 km/h', pressure: '618 hPa', seeing: '0.48"' },
  { station: 'La Palma', elevation: '2396 m', temp: '16.8 °C', wind: '18.5 km/h', pressure: '768 hPa', seeing: '0.56"' },
  { station: 'Reykjavik', elevation: '52 m', temp: '6.1 °C', wind: '26.3 km/h', pressure: '1004 hPa', seeing: '0.88"' },
  { station: 'Greenwich', elevation: '47 m', temp: '13.4 °C', wind: '14.1 km/h', pressure: '1017 hPa', seeing: '1.12"' },
];

function TactileStudy() {
  const [material, setMaterial] = useState<SurfaceMaterial>('solid');
  const [outputLevel, setOutputLevel] = useState(68);
  const [detent, setDetent] = useState(1);
  const [pulseHeld, setPulseHeld] = useState(true);
  const [muted, setMuted] = useState(false);
  const [hue, setHue] = useState(214);
  const [saturation, setSaturation] = useState(28);
  const [lightness, setLightness] = useState(72);

  const accentColor = `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%)`;
  const signalSeries = useMemo(
    () => [
      { label: '01', value: Math.round((outputLevel * 0.72 + 12) * 10) / 10 },
      { label: '02', value: Math.round((outputLevel * 0.8 + 9) * 10) / 10 },
      { label: '03', value: Math.round((outputLevel * 0.76 + 14) * 10) / 10 },
      { label: '04', value: Math.round((outputLevel * 0.88 + 8) * 10) / 10 },
      { label: '05', value: Math.round((outputLevel * 0.94 + 5) * 10) / 10 },
      { label: '06', value: Math.round((outputLevel * 0.91 + 7) * 10) / 10 },
      { label: '07', value: outputLevel },
    ],
    [outputLevel],
  );

  return (
    <section className="tactile-study" id="controls" aria-labelledby="tactile-study-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">03 / Tactile &amp; Optical</span>
          <h2 id="tactile-study-title">Every touch calibrated.</h2>
        </div>
        <div className="tactile-study__material">
          <SegmentedControl
            label="Study finish"
            value={material}
            onValueChange={next => setMaterial(next as SurfaceMaterial)}
            options={[
              { value: 'solid', label: 'Solid' },
              { value: 'liquid-glass', label: 'Glass' },
              { value: 'liquid', label: 'Liquid' },
            ]}
          />
        </div>
      </div>

      <div className={`tactile-study__stage${material !== 'solid' ? ' is-layered' : ''}`} data-jh-material={material}>
        {material !== 'solid' && (
          <div className="tactile-study__backdrop" aria-hidden="true">
            <ShaderSurface />
          </div>
        )}
        <div className="tactile-study__grid">
          <div className="tactile-study__panel">
            <div className="tactile-study__sliders">
              <BarSlider
                label="Calibrated output"
                value={outputLevel}
                onValueChange={setOutputLevel}
                accentColor={accentColor}
                glowIntensity={muted ? 18 : 68}
              />
              <div className="tactile-study__row">
                <TactileLever
                  label="Vertical damper"
                  value={outputLevel}
                  onValueChange={setOutputLevel}
                  unit="%"
                  accentColor={accentColor}
                  glowIntensity={muted ? 18 : 68}
                />
                <DetentDial
                  label="Response profile"
                  value={detent}
                  onValueChange={setDetent}
                  options={[
                    { value: 'quiet', label: 'Quiet' },
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'expressive', label: 'Expressive' },
                  ]}
                />
              </div>
            </div>
            <div className="tactile-study__keys">
              <TactileKey pressed={pulseHeld} onPressedChange={setPulseHeld} material={material}>
                <span>{pulseHeld ? 'Signal armed' : 'Standby'}</span>
              </TactileKey>
              <TactileKey pressed={muted} onPressedChange={setMuted} size="compact" material={material}>
                <span>{muted ? 'Glow low' : 'Glow active'}</span>
              </TactileKey>
            </div>
          </div>

          <div className="tactile-study__panel tactile-study__panel--stack">
            <MetricCard
              label="Tactile telemetry"
              value={outputLevel}
              unit="%"
              delta={['Quiet', 'Balanced', 'Expressive'][detent] ?? 'Balanced'}
              deltaDirection="neutral"
              caption="Linked to bar slider, lever, and detent dial"
              series={signalSeries}
              material={material}
            />
            <SpectrumControl
              label="Optical tint"
              hue={hue}
              saturation={saturation}
              lightness={lightness}
              onHueChange={setHue}
              onSaturationChange={setSaturation}
              onLightnessChange={setLightness}
            />
            <Accordion
              label="System notes"
              defaultValue="surface"
              material={material}
              items={[
                { value: 'surface', title: 'Material continuity', content: 'Switch between Solid, Glass, and Liquid to compare optical depth on the same hardware controls.' },
                { value: 'motion', title: 'Coupled range semantics', content: 'Bar slider and vertical lever write to the same numeric state without stepping on each other.' },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function InstrumentWorkbench() {
  const [heading, setHeading] = useState(142);
  return (
    <div className="instrument-study__workbench">
      <Tabs
        label="Additional laboratory instruments"
        defaultValue="sky"
        items={[
          {
            value: 'sky',
            label: 'Sky & Ephemeris',
            badge: '3',
            content: (
              <div className="instrument-workbench__grid instrument-workbench__grid--three">
                <LunarEphemeris location="Fortaleza" latitude={-3.7319} longitude={-38.5267} />
                <Compass heading={heading} onHeadingChange={setHeading} label="Observatory azimuth" />
                <div className="instrument-workbench__picker-card">
                  <span className="eyebrow">Coordinate target</span>
                  <strong>Switch reference observatory</strong>
                  <p>Pick a station, date, and celestial body inside the layered observation modal.</p>
                  <EphemerisPicker label="Observatory target" />
                </div>
              </div>
            ),
          },
          {
            value: 'weather',
            label: 'Atmosphere & Tide',
            badge: '4',
            content: (
              <div className="instrument-workbench__grid instrument-workbench__grid--two">
                <WeatherConditions location="Fortaleza" />
                <WindInstrument location="Mucuripe Coast" direction={heading} onDirectionChange={setHeading} />
                <WeatherInstrument temperature={27.6} windSpeed={22.4} windDirection={heading} humidity={64} pressure={1014} />
                <TideInstrument station="Mucuripe Harbor" />
              </div>
            ),
          },
          {
            value: 'telemetry',
            label: 'Data & Audio',
            badge: '3',
            content: (
              <div className="instrument-workbench__telemetry">
                <DataTable
                  caption="Observatory telemetry"
                  columns={LAB_STATION_COLUMNS}
                  rows={LAB_STATION_ROWS}
                  rowKey={row => row.station}
                  initialSortKey="station"
                />
                <div className="instrument-workbench__side">
                  <AudioMeter label="Acoustic input" barCount={28} />
                  <div className="instrument-workbench__picker-card">
                    <span className="eyebrow">Command interface</span>
                    <strong>Keyboard runner</strong>
                    <p>Open the grouped command palette to trigger actions without leaving context.</p>
                    <CommandPalette triggerLabel="Open commands" hotkey={false} />
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export function App() {
  return (
    <div className="site" id="inicio">
      <a className="skip-link" href="#conteudo">Skip to content</a>
      <header className="topbar"><Wordmark /><div className="topbar__middle">Interface laboratory</div><a className="topbar__link" href="/solar">Solar panel <ArrowUpRight size={14} aria-hidden="true" /></a><a className="topbar__link" href="#materiais">Explore materials <ArrowDown size={14} aria-hidden="true" /></a><ThemeToggle /></header>
      <main id="conteudo">
        <div className="hero-grid">
          <section className="intro" aria-labelledby="title">
            <div className="intro__top"><span className="intro__chip"><span /> Design system</span><span className="eyebrow">Edition 001</span></div>
            <div className="intro__body">
              <div className="intro__kicker"><span className="eyebrow">Form · Function · Feeling</span><span className="intro__line" /></div>
              <h1 id="title">Matter<br /><em>responds.</em></h1>
              <p>A language for interfaces that feel as natural as the objects we touch.</p>
              <a className="intro__link" href="#materiais">Discover the materials <MoveRight size={17} aria-hidden="true" /></a>
            </div>
            <div className="intro__bottom"><div><CircleDashed size={17} aria-hidden="true" /><span>Made to<br />be felt</span></div><span>Visual study<br />2026 — 01</span></div>
          </section>
          <ControlDeck />
        </div>
        <MaterialStudy />
        <TactileStudy />
        <section className="instrument-study" id="instruments" aria-labelledby="instrument-study-title">
          <div className="instrument-study__heading"><div><span className="eyebrow">Instruments / 04</span><h2 id="instrument-study-title">Signals with a sense of place.</h2></div><a className="intro__link" href="/components">Browse the component collection <MoveRight size={17} aria-hidden="true" /></a></div>
          <FinanceNavigation layout="header" />
          <div className="instrument-study__grid">
            <div className="instrument-study__market"><FinancialChart symbol="NOVA" company="Nova Systems" /></div>
            <div className="instrument-study__sky"><AstronomyInstrument latitude={-3.7319} longitude={-38.5267} location="Fortaleza" /><AstrologyWheel /></div>
          </div>
          <InstrumentWorkbench />
        </section>
        <section className="button-study" aria-labelledby="button-study-title">
          <div><span className="eyebrow">Material / 05</span><h2 id="button-study-title">Glass that responds.</h2><p>A gentle touch. A precise reflection.</p></div>
          <div className="button-study__actions"><a className="jh-button jh-button--glass jh-button--primary" href="/solar"><SmoothShape className="jh-button__face" radius={16} /><span className="jh-button__content">Open solar panel <ArrowUpRight size={15} aria-hidden="true" /></span></a></div>
        </section>
        <section className="closing"><Sparkles size={18} aria-hidden="true" /><p>An interface is a feeling, too.</p><span>jhosephe / Interaction lab</span></section>
      </main>
      <footer className="footer"><Wordmark /><span>Designed with intention.</span><a href="#inicio">Back to top ↑</a></footer>
    </div>
  );
}

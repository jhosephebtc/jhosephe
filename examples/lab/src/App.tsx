import './lab.css';
import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Check, CircleDashed, MoveRight, Sparkles } from 'lucide-react';
import { Button } from '../../../assets/ui/button';
import { Dial } from '../../../assets/ui/dial';
import { Slider, Switch } from '../../../assets/ui/controls';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../../../assets/ui/dialog';
import { InstrumentBars } from '../../../assets/ui/instrument';
import { ShaderSurface } from '../../../assets/ui/shader-surface';
import { SmoothShape } from '../../../assets/ui/smooth-shape';
import { FinancialChart } from '../../../assets/ui/financial-chart';
import { AstronomyInstrument } from '../../../assets/ui/astronomy-instrument';
import { AstrologyWheel } from '../../../assets/ui/astrology-wheel';
import { FinanceNavigation } from '../../../assets/ui/finance-navigation';

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

export function App() {
  return (
    <div className="site" id="inicio">
      <a className="skip-link" href="#conteudo">Skip to content</a>
      <header className="topbar"><Wordmark /><div className="topbar__middle">Interface laboratory</div><a className="topbar__link" href="/solar">Solar panel <ArrowUpRight size={14} aria-hidden="true" /></a><a className="topbar__link" href="#materiais">Explore materials <ArrowDown size={14} aria-hidden="true" /></a></header>
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
        <section className="instrument-study" id="instruments" aria-labelledby="instrument-study-title">
          <div className="instrument-study__heading"><div><span className="eyebrow">Instruments / 06</span><h2 id="instrument-study-title">Signals with a sense of place.</h2></div><a className="intro__link" href="/components">Browse the component collection <MoveRight size={17} aria-hidden="true" /></a></div>
          <FinanceNavigation layout="header" />
          <div className="instrument-study__grid">
            <div className="instrument-study__market"><FinancialChart symbol="NOVA" company="Nova Systems" /></div>
            <div className="instrument-study__sky"><AstronomyInstrument latitude={-3.7319} longitude={-38.5267} location="Fortaleza" /><AstrologyWheel /></div>
          </div>
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

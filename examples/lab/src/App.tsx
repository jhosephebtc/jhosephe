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

function Wordmark() {
  return <a className="brand" href="/" aria-label="jhosephe, início">
    <span className="brand__mark" aria-hidden="true"><span /></span>
    <span>jhosephe<span className="brand__period">.</span></span>
  </a>;
}

function ControlDeck() {
  const [level, setLevel] = useState(64);
  const [ambient, setAmbient] = useState(true);
  return (
    <section className="deck" aria-labelledby="deck-heading">
      <div className="deck__topline"><span>ESTUDO DE INTERAÇÃO</span><span>01 / 03</span></div>
      <div className="deck__heading"><div><span className="eyebrow">CONTROLE / 01</span><h2 id="deck-heading">Uma resposta precisa.</h2></div><span className="deck__number">J—01</span></div>
      <div className={ambient ? 'display display--ambient' : 'display'}>
        <div className="display__top"><span>SAÍDA DINÂMICA</span><span><i /> SISTEMA ATIVO</span></div>
        <div className="display__value"><output aria-live="off">{level}</output><span>%</span></div>
        <div className="display__meta"><span>Intensidade</span><span>0 — 100</span></div>
        <InstrumentBars value={level} />
      </div>
      <div className="deck__control">
        <div className="deck__control-copy"><span className="eyebrow">AJUSTE MANUAL</span><strong>Toque e ajuste</strong><p>Arraste o controle ou use as setas do teclado.</p></div>
        <Dial value={level} onChange={setLevel} label="Ajustar intensidade" />
      </div>
      <div className="deck__slider">
        <div className="deck__label"><span id="intensity-label">Intensidade</span><output>{level}%</output></div>
        <Slider labelId="intensity-label" value={[level]} max={100} step={1} onValueChange={values => setLevel(values[0])} />
      </div>
      <div className="deck__footer">
        <div className="switch-copy"><label htmlFor="ambient">Luz ambiente</label><span>Reflexo suave na superfície</span></div>
        <Switch id="ambient" checked={ambient} onCheckedChange={setAmbient} aria-describedby="ambient-state" />
        <span className="sr-only" id="ambient-state">{ambient ? 'Ativada' : 'Desativada'}</span>
      </div>
      <Dialog>
        <DialogTrigger asChild><Button className="deck__action" variant="primary">Explorar o controle <ArrowUpRight size={15} aria-hidden="true" /></Button></DialogTrigger>
        <DialogContent>
          <span className="eyebrow">ESTUDO / 01</span>
          <DialogTitle className="dialog-title">A sensação está nos detalhes.</DialogTitle>
          <DialogDescription className="dialog-description">O mesmo valor responde ao dial, ao slider e ao teclado. A apresentação permanece legível com movimento reduzido.</DialogDescription>
          <div className="dialog-readout"><span>INTENSIDADE ATUAL</span><strong>{level}%</strong></div>
          <DialogClose asChild><Button variant="primary">Entendi <Check size={15} aria-hidden="true" /></Button></DialogClose>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function MaterialStudy() {
  const [smoothing, setSmoothing] = useState(60);
  return (
    <section id="materiais" className="materials" aria-labelledby="materials-heading">
      <div className="section-heading"><div><span className="eyebrow">02 / SUPERFÍCIES</span><h2 id="materials-heading">Material, com intenção.</h2></div><p>Três camadas. Uma linguagem.<br />Projetadas para trabalhar juntas.</p></div>
      <div className="material-grid">
        <article className="material-card">
          <div className="material-card__art mineral-art" aria-hidden="true"><div className="mineral-block"><span /></div></div>
          <div className="material-card__copy"><div><span>01 / MINERAL</span><h3>Calma na base.</h3><p>Superfícies claras para o que importa.</p></div><ArrowUpRight size={17} aria-hidden="true" /></div>
        </article>
        <article className="material-card">
          <div className="material-card__art glass-art" aria-hidden="true"><ShaderSurface /><div className="glass-pill"><span className="glass-pill__light" /><span /><span /><span /></div></div>
          <div className="material-card__copy"><div><span>02 / VIDRO</span><h3>Luz em camadas.</h3><p>Transparência apenas onde faz sentido.</p></div><ArrowUpRight size={17} aria-hidden="true" /></div>
        </article>
        <article className="material-card">
          <div className="material-card__art relief-art" aria-hidden="true"><div className="relief-bed"><div className="relief-lens"><span /></div></div></div>
          <div className="material-card__copy"><div><span>03 / RELEVO</span><h3>Profundidade sutil.</h3><p>Luz e volume dão forma ao toque.</p></div><ArrowUpRight size={17} aria-hidden="true" /></div>
        </article>
      </div>
      <div className="corner-study">
        <div className="corner-study__copy"><span className="eyebrow">FORMA / 04</span><h3>O detalhe está na curva.</h3><p>O raio permanece igual enquanto a transição do canto muda.</p>
          <div className="corner-study__label"><span id="smoothing-label">Suavização</span><output>{smoothing}%</output></div>
          <Slider labelId="smoothing-label" value={[smoothing]} min={0} max={100} step={1} onValueChange={values => setSmoothing(values[0])} />
        </div>
        <div className="corner-study__samples" aria-hidden="true">
          <div><span className="corner-study__shape"><SmoothShape className="corner-study__face" radius={28} smoothing={0} /></span><span>00% / CURVA</span></div>
          <div><span className="corner-study__shape"><SmoothShape className="corner-study__face" radius={28} smoothing={smoothing / 100} /></span><span>{String(smoothing).padStart(2, '0')}% / CONTÍNUA</span></div>
        </div>
      </div>
    </section>
  );
}

export function App() {
  return (
    <div className="site" id="inicio">
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
      <header className="topbar"><Wordmark /><div className="topbar__middle">LABORATÓRIO DE INTERFACES</div><a className="topbar__link" href="/solar">Painel solar <ArrowUpRight size={14} aria-hidden="true" /></a><a className="topbar__link" href="#materiais">Explorar materiais <ArrowDown size={14} aria-hidden="true" /></a></header>
      <main id="conteudo">
        <div className="hero-grid">
          <section className="intro" aria-labelledby="title">
            <div className="intro__top"><span className="intro__chip"><span /> DESIGN SYSTEM</span><span className="eyebrow">EDIÇÃO 001</span></div>
            <div className="intro__body">
              <div className="intro__kicker"><span className="eyebrow">FORMA · FUNÇÃO · SENSAÇÃO</span><span className="intro__line" /></div>
              <h1 id="title">A matéria<br /><em>responde.</em></h1>
              <p>Uma linguagem para interfaces que parecem tão naturais quanto os objetos que tocamos.</p>
              <a className="intro__link" href="#materiais">Conheça os materiais <MoveRight size={17} aria-hidden="true" /></a>
            </div>
            <div className="intro__bottom"><div><CircleDashed size={17} aria-hidden="true" /><span>FEITO PARA<br />SER SENTIDO</span></div><span>ESTUDO VISUAL<br />2026 — 01</span></div>
          </section>
          <ControlDeck />
        </div>
        <MaterialStudy />
        <section className="button-study" aria-labelledby="button-study-title">
          <div><span className="eyebrow">MATERIAL / 05</span><h2 id="button-study-title">Vidro que responde.</h2><p>Um toque suave. Um reflexo preciso.</p></div>
          <div className="button-study__actions"><a className="jh-button jh-button--glass jh-button--primary" href="/solar"><SmoothShape className="jh-button__face" radius={16} /><span className="jh-button__content">Abrir painel solar <ArrowUpRight size={15} aria-hidden="true" /></span></a></div>
        </section>
        <section className="closing"><Sparkles size={18} aria-hidden="true" /><p>Uma interface é também uma sensação.</p><span>JHOSEPHE / INTERACTION LAB</span></section>
      </main>
      <footer className="footer"><Wordmark /><span>DESENHADO COM INTENÇÃO.</span><a href="#inicio">VOLTAR AO TOPO ↑</a></footer>
    </div>
  );
}

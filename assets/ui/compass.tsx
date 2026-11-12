import { useId, type CSSProperties } from 'react';
import { Slider } from './controls';

export function Compass({ heading, onHeadingChange, label = 'Heading' }: {
  heading: number; onHeadingChange: (heading: number) => void; label?: string;
}) {
  const id = useId();
  const value = ((Math.round(heading) % 360) + 360) % 360;
  return <section className="jh-compass" aria-label="Compass instrument">
    <span id={`${id}-label`} className="jh-visually-hidden">{label}</span>
    <div className="jh-compass__dial" style={{ '--jh-compass-turn': `${value}deg` } as CSSProperties}>
      <svg className="jh-compass__scale" viewBox="0 0 140 140" aria-hidden="true">
        <g transform="translate(70 70)">{Array.from({ length: 36 }, (_, index) => (
          <path key={index} d={index % 3 === 0 ? 'M0 -58v7' : 'M0 -59v4'} transform={`rotate(${index * 10})`} />
        ))}</g>
      </svg>
      <span className="jh-compass__bed" aria-hidden="true">
        <span className="jh-compass__knob">
          <span className="jh-compass__top">
            <span className="jh-compass__cardinal jh-compass__cardinal--north">N</span>
            <span className="jh-compass__cardinal jh-compass__cardinal--east">E</span>
            <span className="jh-compass__cardinal jh-compass__cardinal--south">S</span>
            <span className="jh-compass__cardinal jh-compass__cardinal--west">W</span>
            <span className="jh-compass__needle"><i /><b /><em /></span>
          </span>
        </span>
      </span>
    </div>
    <div className="jh-compass__readout"><span>{label}</span><output>{String(value).padStart(3, '0')}°</output></div>
    <Slider labelId={`${id}-label`} className="jh-compass__slider" min={0} max={359} step={1} value={[value]} onValueChange={values => onHeadingChange(values[0])} />
  </section>;
}

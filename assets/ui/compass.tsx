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
      <span className="jh-compass__cardinal jh-compass__cardinal--north">N</span><span className="jh-compass__cardinal jh-compass__cardinal--east">E</span><span className="jh-compass__cardinal jh-compass__cardinal--south">S</span><span className="jh-compass__cardinal jh-compass__cardinal--west">W</span>
      <span className="jh-compass__needle" aria-hidden="true"><i /><b /></span>
    </div>
    <div className="jh-compass__readout"><span>{label}</span><output>{String(value).padStart(3, '0')}°</output></div>
    <Slider labelId={`${id}-label`} className="jh-compass__slider" min={0} max={359} step={1} value={[value]} onValueChange={values => onHeadingChange(values[0])} />
  </section>;
}

import { useId, type CSSProperties } from 'react';
import { Slider } from './controls';
import { clockwiseArcPath, instrumentAccentStyle } from './utils';

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export function Compass({
  heading,
  onHeadingChange,
  label = 'Heading',
  accentColor,
}: {
  heading: number;
  onHeadingChange: (heading: number) => void;
  label?: string;
  accentColor?: string;
}) {
  const id = useId();
  const value = ((Math.round(heading) % 360) + 360) % 360;
  const cardinal = CARDINALS[Math.round(value / 45) % 8];

  return (
    <section
      className="jh-compass"
      aria-label="Compass instrument"
      style={instrumentAccentStyle(accentColor)}
    >
      <span id={`${id}-label`} className="jh-visually-hidden">{label}</span>
      <header className="jh-compass__header">
        <div>
          <span className="jh-compass__eyebrow">Magnetic bearing</span>
          <strong className="jh-compass__title">Compass</strong>
        </div>
        <span className="jh-compass__cardinal-pill">{cardinal}</span>
      </header>
      <div className="jh-compass__well">
        <div className="jh-compass__dial" style={{ '--jh-compass-turn': `${value}deg` } as CSSProperties}>
          <svg className="jh-compass__scale" viewBox="0 0 140 140" aria-hidden="true">
            <g transform="translate(70 70)">
              {Array.from({ length: 36 }, (_, index) => (
                <path key={index} d={index % 3 === 0 ? 'M0 -58v7' : 'M0 -59v4'} transform={`rotate(${index * 10})`} />
              ))}
            </g>
            {value > 0 && <path className="jh-compass__arc" d={clockwiseArcPath(70, 70, 59, value)} />}
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
      </div>
      <div className="jh-compass__readout">
        <span>{label}</span>
        <output>{cardinal} · {String(value).padStart(3, '0')}°</output>
      </div>
      <Slider labelId={`${id}-label`} className="jh-compass__slider" min={0} max={359} step={1} value={[value]} onValueChange={values => onHeadingChange(values[0])} />
    </section>
  );
}

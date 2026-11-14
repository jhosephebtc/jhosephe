import { useId, useState } from 'react';
import { Slider } from './controls';
import { SegmentedControl } from './segmented-control';
import { clockwiseArcPath, instrumentAccentStyle } from './utils';
import {
  beaufortFromKmh,
  cardinalDirection,
  clamp,
  convertWindSpeed,
  normalizeDegrees,
  surfaceMaterialAttr,
  type SurfaceMaterial,
  type WindUnit,
} from './weather-ephemeris';

/** Tactile wind vector and Beaufort instrument structured for Google Weather API wind fields. */
export function WindInstrument({
  location = 'Coastal Station 04',
  speed = 22.4,
  gust = 34.0,
  direction = 135,
  unit: controlledUnit,
  onUnitChange,
  onDirectionChange,
  material = 'solid',
  accentColor,
}: {
  location?: string;
  speed?: number;
  gust?: number;
  direction?: number;
  unit?: WindUnit;
  onUnitChange?: (unit: WindUnit) => void;
  onDirectionChange?: (degrees: number) => void;
  material?: SurfaceMaterial;
  accentColor?: string;
}) {
  const id = useId();
  const [internalUnit, setInternalUnit] = useState<WindUnit>('km/h');
  const [localDirection, setLocalDirection] = useState(direction);
  const unit = controlledUnit ?? internalUnit;
  const currentDirection = normalizeDegrees(onDirectionChange ? direction : localDirection);
  const cardinal = cardinalDirection(currentDirection);
  const beaufort = beaufortFromKmh(speed);
  const sustained = convertWindSpeed(speed, unit);
  const peakGust = convertWindSpeed(gust, unit);
  const matAttr = surfaceMaterialAttr(material);

  const setUnit = (next: WindUnit) => {
    setInternalUnit(next);
    onUnitChange?.(next);
  };

  const updateDirection = (next: number) => {
    const wrapped = normalizeDegrees(Math.round(next));
    setLocalDirection(wrapped);
    onDirectionChange?.(wrapped);
  };

  return (
    <section
      className="jh-wind-instrument"
      data-jh-material={matAttr}
      aria-labelledby={`${id}-title`}
      style={instrumentAccentStyle(accentColor)}
    >
      <header className="jh-wind-instrument__header">
        <div>
          <span className="jh-wind-instrument__eyebrow">Wind telemetry · Bft {beaufort.force}</span>
          <h2 id={`${id}-title`}>{location}</h2>
          <p>{beaufort.label} · From {cardinal} ({Math.round(currentDirection)}°)</p>
        </div>
        <div className="jh-wind-instrument__unit">
          <SegmentedControl
            label="Wind speed unit"
            value={unit}
            onValueChange={val => setUnit(val as WindUnit)}
            options={[
              { value: 'km/h', label: 'km/h' },
              { value: 'kt', label: 'kt' },
              { value: 'm/s', label: 'm/s' },
            ]}
          />
        </div>
      </header>

      <div className="jh-wind-instrument__stage">
        <div className="jh-wind-instrument__dial-wrap">
          <svg
            className="jh-wind-instrument__rose"
            viewBox="0 0 180 180"
            role="img"
            aria-label={`Wind direction ${Math.round(currentDirection)} degrees ${cardinal}`}
          >
            <circle cx="90" cy="90" r="84" className="jh-wind-instrument__bezel" />
            <circle cx="90" cy="90" r="78" className="jh-wind-instrument__bezel-edge" />
            <circle cx="90" cy="90" r="72" className="jh-wind-instrument__well" />
            <circle cx="90" cy="90" r="56" className="jh-wind-instrument__ring" />
            {beaufort.force > 0 && (
              <path
                className="jh-wind-instrument__beaufort-arc"
                d={clockwiseArcPath(90, 90, 56, (clamp(beaufort.force, 0, 12) / 12) * 360)}
              />
            )}
            <g transform="translate(90 90)" className="jh-wind-instrument__ticks">
              {Array.from({ length: 36 }, (_, index) => (
                <path
                  key={index}
                  d={index % 3 === 0 ? 'M0 -68v8' : 'M0 -68v4'}
                  transform={`rotate(${index * 10})`}
                  opacity={index % 3 === 0 ? 0.65 : 0.35}
                />
              ))}
            </g>
            <text x="90" y="32" textAnchor="middle">N</text>
            <text x="148" y="93" textAnchor="middle">E</text>
            <text x="90" y="154" textAnchor="middle">S</text>
            <text x="32" y="93" textAnchor="middle">W</text>
            <g transform={`rotate(${currentDirection} 90 90)`} className="jh-wind-instrument__vector">
              <path d="M90 36 L96 58 L90 54 L84 58 Z" className="jh-wind-instrument__head" />
              <line x1="90" y1="54" x2="90" y2="128" className="jh-wind-instrument__shaft" />
              <circle cx="90" cy="128" r="3" className="jh-wind-instrument__tail" />
            </g>
            <circle cx="90" cy="90" r="24" className="jh-wind-instrument__hub" />
            <text x="90" y="88" textAnchor="middle" className="jh-wind-instrument__hub-deg">
              {Math.round(currentDirection)}°
            </text>
            <text x="90" y="101" textAnchor="middle" className="jh-wind-instrument__hub-card">
              {cardinal}
            </text>
          </svg>
        </div>

        <div className="jh-wind-instrument__readouts">
          <div className="jh-wind-instrument__tile">
            <span>Sustained</span>
            <strong>{sustained.toFixed(1)} <small>{unit}</small></strong>
          </div>
          <div className="jh-wind-instrument__tile">
            <span>Peak gust</span>
            <strong>{peakGust.toFixed(1)} <small>{unit}</small></strong>
          </div>
          <div className="jh-wind-instrument__tile">
            <span>Vector bearing</span>
            <strong>{Math.round(currentDirection)}° <small>{cardinal}</small></strong>
          </div>
          <div className="jh-wind-instrument__beaufort">
            <div>
              <span>Beaufort scale</span>
              <strong>Force {beaufort.force} / 12</strong>
            </div>
            <div className="jh-wind-instrument__scale-track" aria-hidden="true">
              {Array.from({ length: 12 }, (_, idx) => (
                <span key={idx} data-active={idx < clamp(beaufort.force, 0, 12) || undefined} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="jh-wind-instrument__footer">
        <div className="jh-wind-instrument__bearing-control">
          <span id={`${id}-bearing-label`}>Bearing preview</span>
          <Slider
            labelId={`${id}-bearing-label`}
            className="jh-scrubber-slider"
            min={0}
            max={359}
            step={1}
            value={[Math.round(currentDirection)]}
            thumbThickness={14}
            thumbHeight={24}
            thumbRadius={7}
            onValueChange={([deg]) => updateDirection(deg)}
          />
          <output>{Math.round(currentDirection)}°</output>
        </div>
      </footer>
    </section>
  );
}

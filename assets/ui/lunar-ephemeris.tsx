import { useEffect, useId, useMemo, useState } from 'react';
import { Slider } from './controls';
import { instrumentAccentStyle } from './utils';
import {
  computeLunarEphemeris,
  surfaceMaterialAttr,
  type SurfaceMaterial,
} from './weather-ephemeris';

const SYNODIC_CYCLE_DAYS = 29.530588;

/** Lunar phase, illumination, and orbital angle instrument ready for ephemeris API payloads. */
export function LunarEphemeris({
  location = 'Fortaleza',
  latitude = -3.7319,
  longitude = -38.5267,
  date,
  illumination: suppliedIllum,
  phaseAngle: suppliedAngle,
  ageDays: suppliedAge,
  phaseName: suppliedName,
  altitude: suppliedAltitude,
  azimuth: suppliedAzimuth,
  moonrise: suppliedRise,
  moonset: suppliedSet,
  distanceKm: suppliedDistance,
  material = 'solid',
  accentColor,
}: {
  location?: string;
  latitude?: number;
  longitude?: number;
  date?: Date;
  illumination?: number;
  phaseAngle?: number;
  ageDays?: number;
  phaseName?: string;
  altitude?: number;
  azimuth?: number;
  moonrise?: string;
  moonset?: string;
  distanceKm?: number;
  material?: SurfaceMaterial;
  accentColor?: string;
}) {
  const id = useId();
  const [dayOffset, setDayOffset] = useState(0);
  const baseDate = useMemo(() => date ?? new Date(), [date]);
  const targetDate = useMemo(
    () => new Date(baseDate.getTime() + dayOffset * 86400000),
    [baseDate, dayOffset],
  );

  const computed = useMemo(
    () => computeLunarEphemeris(targetDate, latitude, longitude),
    [targetDate, latitude, longitude],
  );

  const useSupplied = dayOffset === 0;
  const phaseAngle = useSupplied && suppliedAngle !== undefined ? suppliedAngle : computed.phaseAngle;
  const illumination = useSupplied && suppliedIllum !== undefined ? suppliedIllum : computed.illumination;
  const ageDays = useSupplied && suppliedAge !== undefined ? suppliedAge : computed.ageDays;
  const phaseName = useSupplied && suppliedName !== undefined ? suppliedName : computed.phaseName;
  const altitude = useSupplied && suppliedAltitude !== undefined ? suppliedAltitude : computed.altitude;
  const azimuth = useSupplied && suppliedAzimuth !== undefined ? suppliedAzimuth : computed.azimuth;
  const moonrise = useSupplied && suppliedRise !== undefined ? suppliedRise : computed.moonrise;
  const moonset = useSupplied && suppliedSet !== undefined ? suppliedSet : computed.moonset;
  const distanceKm = useSupplied && suppliedDistance !== undefined ? suppliedDistance : computed.distanceKm;

  // Build monochrome lit lunar crescent/gibbous path inside r=38 disc centered at (70, 70).
  const svgId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  const discClipId = `${svgId}-lunar-clip`;
  const nightGradId = `${svgId}-lunar-night`;
  const litGradId = `${svgId}-lunar-lit`;
  const domeGradId = `${svgId}-lunar-dome`;
  const bezelGradId = `${svgId}-lunar-bezel`;

  const synodicTicks = 28;
  const activeTickCount = Math.round((ageDays / SYNODIC_CYCLE_DAYS) * synodicTicks);
  const ageAngleDeg = (ageDays / SYNODIC_CYCLE_DAYS) * 360;

  // Bright-limb position tilt (equatorial parallax + ecliptic tilt over the 28-day cycle)
  const phaseRad = (phaseAngle * Math.PI) / 180;
  const latFactor = Math.max(0.25, Math.cos((latitude * Math.PI) / 180));
  const limbTiltDeg = Number(
    (Math.sin(phaseRad) * 24 * latFactor + Math.cos(phaseRad * 0.5) * 14).toFixed(1),
  );
  // Clockwise dial direction (deg from 12 o'clock) from which sunlight illuminates the bright limb
  const waxing = phaseAngle <= 180;
  const lightDialDeg = ((waxing ? 90 : 270) + limbTiltDeg + 360) % 360;
  const lightDialRad = ((lightDialDeg - 90) * Math.PI) / 180;
  const litHighlightX = (50 + Math.cos(lightDialRad) * 24).toFixed(1);
  const litHighlightY = (50 + Math.sin(lightDialRad) * 24).toFixed(1);
  const nightHighlightX = (50 + Math.cos(lightDialRad) * 16).toFixed(1);
  const nightHighlightY = (50 + Math.sin(lightDialRad) * 16).toFixed(1);

  const litPath = useMemo(() => {
    const r = 38;
    const cx = 70;
    const cy = 70;
    const rad = (phaseAngle * Math.PI) / 180;
    const rx = Math.abs(Math.cos(rad)) * r;
    const isWaxing = phaseAngle <= 180;
    // Outer limb sweep: right half when waxing, left half when waning.
    const outerSweep = isWaxing ? 1 : 0;
    // Terminator sweep depends on crescent (<90 / >270) vs gibbous (90..270).
    const isGibbous = phaseAngle > 90 && phaseAngle < 270;
    const termSweep = isWaxing ? (isGibbous ? 1 : 0) : isGibbous ? 0 : 1;
    return `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r} A ${rx.toFixed(2)} ${r} 0 0 ${termSweep} ${cx} ${cy - r} Z`;
  }, [phaseAngle]);

  const [scrubbing, setScrubbing] = useState(false);

  useEffect(() => {
    if (!scrubbing) return;
    const stop = () => setScrubbing(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [scrubbing]);

  const matAttr = surfaceMaterialAttr(material);

  return (
    <section
      className="jh-lunar-ephemeris"
      data-jh-material={matAttr}
      data-dragging={scrubbing ? 'true' : undefined}
      aria-labelledby={`${id}-title`}
      style={instrumentAccentStyle(accentColor)}
    >
      <header className="jh-lunar-ephemeris__header">
        <div>
          <span className="jh-lunar-ephemeris__eyebrow">Lunar ephemeris · Day {ageDays.toFixed(1)} · Light {Math.round(lightDialDeg)}°</span>
          <h2 id={`${id}-title`}>{phaseName}</h2>
          <p>{location} · {targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <span className="jh-lunar-ephemeris__pill"><i className="jh-lunar-ephemeris__pill-dot" aria-hidden="true" />{Math.round(illumination)}% lit</span>
      </header>

      <div className="jh-lunar-ephemeris__stage">
        <div className="jh-lunar-ephemeris__disc-well">
          <svg
            viewBox="0 0 140 140"
            role="img"
            aria-label={`${phaseName}, ${Math.round(illumination)} percent illuminated, phase angle ${Math.round(phaseAngle)} degrees, sunlight angle ${Math.round(lightDialDeg)} degrees`}
          >
            <defs>
              <clipPath id={discClipId}>
                <circle cx="70" cy="70" r="38" />
              </clipPath>
              <mask id={`${discClipId}-scale`} maskUnits="userSpaceOnUse" x="0" y="0" width="140" height="140">
                <rect width="140" height="140" fill="black" />
                <circle cx="70" cy="70" r="66.5" fill="white" />
                <circle cx="70" cy="70" r="54.2" fill="black" />
              </mask>
              <filter id={`${discClipId}-soft`} x="-22%" y="-22%" width="144%" height="144%">
                <feGaussianBlur stdDeviation="2.1" />
              </filter>
              <linearGradient id={bezelGradId} x1="20%" y1="10%" x2="80%" y2="90%">
                <stop offset="0%" style={{ stopColor: 'var(--jh-lunar-bezel-1, #fdfdfd)' }} />
                <stop offset="52%" style={{ stopColor: 'var(--jh-lunar-bezel-2, #e8e8e8)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--jh-lunar-bezel-3, #f5f5f5)' }} />
              </linearGradient>
              <radialGradient id={nightGradId} cx={`${nightHighlightX}%`} cy={`${nightHighlightY}%`} r="76%">
                <stop offset="0%" style={{ stopColor: 'var(--jh-lunar-night-1, #dcdcdc)' }} />
                <stop offset="68%" style={{ stopColor: 'var(--jh-lunar-night-2, #cacaca)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--jh-lunar-night-3, #bcbcbc)' }} />
              </radialGradient>
              <radialGradient id={litGradId} cx={`${litHighlightX}%`} cy={`${litHighlightY}%`} r="78%">
                <stop offset="0%" style={{ stopColor: 'var(--jh-lunar-lit-1, #ffffff)' }} />
                <stop offset="58%" style={{ stopColor: 'var(--jh-lunar-lit-2, #f4f4f4)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--jh-lunar-lit-3, #e1e1e1)' }} />
              </radialGradient>
              <radialGradient id={domeGradId} cx={`${litHighlightX}%`} cy={`${litHighlightY}%`} r="66%">
                <stop offset="0%" style={{ stopColor: 'var(--jh-lunar-dome-hi, #ffffff)' }} stopOpacity="0.54" />
                <stop offset="46%" style={{ stopColor: 'var(--jh-lunar-dome-hi, #ffffff)' }} stopOpacity="0.12" />
                <stop offset="84%" stopColor="#000000" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.14" />
              </radialGradient>
            </defs>

            {/* Recessed orbital scale channel + 28-day synodic dial scale */}
            <circle cx="70" cy="70" r="61" fill="none" strokeWidth="11.5" className="jh-lunar-ephemeris__trough" />
            <g transform="translate(70 70)" mask={`url(#${discClipId}-scale)`}>
              {Array.from({ length: synodicTicks }, (_, i) => {
                const major = i % 7 === 0;
                const active = i <= activeTickCount;
                return (
                  <path
                    key={i}
                    className={active ? 'jh-lunar-ephemeris__tick is-active' : 'jh-lunar-ephemeris__tick'}
                    d={`M0 -${major ? 60 : 58}v-${major ? 5 : 3}`}
                    transform={`rotate(${(i * 360) / synodicTicks})`}
                  />
                );
              })}
            </g>

            {/* Machined bezel & recessed seat */}
            <circle cx="70" cy="70" r="53" className="jh-lunar-ephemeris__bed" />
            <circle cx="70" cy="70" r="46" fill={`url(#${bezelGradId})`} className="jh-lunar-ephemeris__bezel" />
            <circle cx="70" cy="70" r="40" className="jh-lunar-ephemeris__seat" />

            {/* Subtle light-incidence ray axis sheltered inside bezel lip */}
            <g transform={`translate(70 70) rotate(${lightDialDeg.toFixed(1)})`}>
              <line x1="0" y1="-55" x2="0" y2="-40" className="jh-lunar-ephemeris__light-ray" />
              <circle cx="0" cy="-56.5" r="2.2" className="jh-lunar-ephemeris__light-source" />
            </g>

            {/* Smooth illuminated Moon sphere inside disc clip */}
            <g clipPath={`url(#${discClipId})`}>
              <circle cx="70" cy="70" r="38" fill={`url(#${nightGradId})`} className="jh-lunar-ephemeris__night" />
              <path
                d={litPath}
                fill={`url(#${litGradId})`}
                transform={`rotate(${limbTiltDeg} 70 70)`}
                filter={`url(#${discClipId}-soft)`}
                className="jh-lunar-ephemeris__lit-penumbra"
              />
              <path
                d={litPath}
                fill={`url(#${litGradId})`}
                transform={`rotate(${limbTiltDeg} 70 70)`}
                className="jh-lunar-ephemeris__lit"
              />
              {/* Spherical dome specular & limb shading aligned with sunlight angle */}
              <circle cx="70" cy="70" r="38" fill={`url(#${domeGradId})`} className="jh-lunar-ephemeris__dome" />
            </g>

            {/* Crisp lunar rim & orbital age indicator pip */}
            <circle cx="70" cy="70" r="38" className="jh-lunar-ephemeris__rim" />
            <g transform={`translate(70 70) rotate(${ageAngleDeg.toFixed(1)})`}>
              <circle cx="0" cy="-49.5" r="2.1" className="jh-lunar-ephemeris__age-pip" />
            </g>
          </svg>
        </div>

        <div className="jh-lunar-ephemeris__readouts">
          <div><span>Illumination</span><strong>{illumination.toFixed(1)}%</strong></div>
          <div><span>Phase angle</span><strong>{Math.round(phaseAngle)}°</strong></div>
          <div><span>Altitude</span><strong>{altitude.toFixed(1)}°</strong></div>
          <div><span>Azimuth</span><strong>{Math.round(azimuth)}°</strong></div>
          <div><span>Moonrise</span><strong>{moonrise}</strong></div>
          <div><span>Moonset</span><strong>{moonset}</strong></div>
        </div>
      </div>

      <div className="jh-lunar-ephemeris__summary">
        <span>Earth–Moon distance</span>
        <strong>{new Intl.NumberFormat('en-US').format(distanceKm)} km</strong>
        <small>Synodic cycle 29.53 d · Drag day offset across 28 days</small>
      </div>

      <footer className="jh-lunar-ephemeris__footer">
        <div className="jh-lunar-ephemeris__scrubber">
          <span id={`${id}-lunar-offset-label`}>Day offset</span>
          <Slider
            labelId={`${id}-lunar-offset-label`}
            className="jh-scrubber-slider"
            min={0}
            max={28}
            step={1}
            value={[dayOffset]}
            thumbThickness={14}
            thumbHeight={24}
            thumbRadius={7}
            onDraggingChange={setScrubbing}
            onValueChange={([offset]) => setDayOffset(offset)}
          />
          <output>{dayOffset === 0 ? 'Today' : `+${dayOffset}d`}</output>
        </div>
      </footer>
    </section>
  );
}

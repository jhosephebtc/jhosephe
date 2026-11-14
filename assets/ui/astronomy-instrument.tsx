import { useEffect, useId, useMemo, useState } from 'react';
import { Button } from './button';
import { Slider } from './controls';
import { instrumentAccentStyle } from './utils';
import { clamp, surfaceMaterialAttr, type SurfaceMaterial } from './weather-ephemeris';

export type SolarPosition = {
  altitude: number;
  azimuth: number;
  sunrise: number | null;
  sunset: number | null;
  solarNoon: number;
};

const rad = (value: number) => (value * Math.PI) / 180;
const deg = (value: number) => (value * 180) / Math.PI;

function solarPosition(date: Date, latitude: number, longitude: number): SolarPosition {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const gamma = ((2 * Math.PI) / 365) * (day - 1 + (hour - 12) / 24);
  const equation =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const zone = -date.getTimezoneOffset() / 60;
  const trueSolarMinutes = (hour * 60 + equation + 4 * longitude - 60 * zone + 1440) % 1440;
  const hourAngle = rad(trueSolarMinutes / 4 - 180);
  const lat = rad(latitude);
  const sinAltitude = Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle);
  const altitude = deg(Math.asin(clamp(sinAltitude, -1, 1)));
  const zenith = Math.acos(clamp(sinAltitude, -1, 1));
  const cosAzimuth =
    (Math.sin(lat) * Math.cos(zenith) - Math.sin(declination)) /
    Math.max(0.00001, Math.cos(lat) * Math.sin(zenith));
  const azimuth =
    (hourAngle > 0
      ? 360 - deg(Math.acos(clamp(cosAzimuth, -1, 1)))
      : deg(Math.acos(clamp(cosAzimuth, -1, 1))) + 360) % 360;
  const cosHour = Math.cos(rad(90.833)) / (Math.cos(lat) * Math.cos(declination)) - Math.tan(lat) * Math.tan(declination);
  const sunriseAngle = cosHour <= -1 ? 180 : cosHour >= 1 ? null : deg(Math.acos(cosHour));
  const solarNoon = 720 - 4 * (longitude - 15 * zone) - equation;
  return {
    altitude,
    azimuth,
    sunrise: sunriseAngle === null ? null : solarNoon - 4 * sunriseAngle,
    sunset: sunriseAngle === null ? null : solarNoon + 4 * sunriseAngle,
    solarNoon,
  };
}

const clock = (minutes: number | null) => {
  if (minutes === null) return '—';
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const daylightDuration = (sunrise: number | null, sunset: number | null) => {
  if (sunrise === null || sunset === null) return '—';
  const span = Math.max(0, Math.round(sunset - sunrise));
  return `${Math.floor(span / 60)}h ${String(span % 60).padStart(2, '0')}m`;
};

/** Solar ephemeris instrument aligned with the layered review modal language. */
export function AstronomyInstrument({
  latitude = -3.7319,
  longitude = -38.5267,
  location = 'Fortaleza',
  date,
  solarData,
  material = 'solid',
  accentColor,
}: {
  latitude?: number;
  longitude?: number;
  location?: string;
  date?: Date;
  solarData?: Partial<SolarPosition>;
  material?: SurfaceMaterial;
  accentColor?: string;
}) {
  const id = useId();
  const [now, setNow] = useState(() => new Date());
  const [scrubMinutes, setScrubMinutes] = useState<number | null>(null);
  const [usingLocation, setUsingLocation] = useState(false);
  const [deviceCoordinates, setDeviceCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (date || scrubMinutes !== null) return;
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, [date, scrubMinutes]);

  const baseMoment = date ?? now;
  const moment = useMemo(() => {
    if (scrubMinutes === null) return baseMoment;
    const next = new Date(baseMoment);
    next.setHours(Math.floor(scrubMinutes / 60), scrubMinutes % 60, 0, 0);
    return next;
  }, [baseMoment, scrubMinutes]);
  const currentMinutes = moment.getHours() * 60 + moment.getMinutes();

  const observerLatitude = deviceCoordinates?.latitude ?? latitude;
  const observerLongitude = deviceCoordinates?.longitude ?? longitude;
  const observerLocation = deviceCoordinates ? 'Your location' : location;

  const computed = useMemo(
    () => solarPosition(moment, observerLatitude, observerLongitude),
    [moment, observerLatitude, observerLongitude],
  );
  const solar: SolarPosition = { ...computed, ...solarData };

  const progress =
    solar.sunrise !== null && solar.sunset !== null
      ? clamp((currentMinutes - solar.sunrise) / (solar.sunset - solar.sunrise), 0, 1)
      : 0.5;
  const x = 24 + progress * 352;
  const y =
    (1 - progress) * (1 - progress) * 118 +
    2 * (1 - progress) * progress * -64 +
    progress * progress * 118;
  const qx = 24 + progress * (200 - 24);
  const qy = 118 + progress * (-64 - 118);
  const traversedArc = `M24 118 Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;

  const phaseLabel =
    solar.altitude > 0 ? 'Above horizon' : solar.altitude > -6 ? 'Civil twilight' : 'Below horizon';

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Location is not available in this browser.');
      return;
    }
    setLocationError('');
    setUsingLocation(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setDeviceCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationError('');
        setUsingLocation(false);
      },
      () => {
        setLocationError('Location permission was unavailable. Showing the selected place.');
        setUsingLocation(false);
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  const matAttr = surfaceMaterialAttr(material);

  return (
    <section
      className="jh-astronomy"
      data-jh-material={matAttr}
      aria-label={`Solar ephemeris for ${observerLocation}`}
      style={instrumentAccentStyle(accentColor)}
    >
      <header className="jh-astronomy__header">
        <div>
          <span className="jh-astronomy__eyebrow">
            Solar ephemeris · {scrubMinutes !== null ? `Scrub ${clock(scrubMinutes)}` : 'Live'}
          </span>
          <h2>{observerLocation}</h2>
          <p>{observerLatitude.toFixed(2)}°, {observerLongitude.toFixed(2)}° · {phaseLabel}</p>
        </div>
        <Button size="small" onClick={requestLocation} loading={usingLocation} loadingLabel="Locating…">
          Use device location
        </Button>
      </header>

      {locationError && <p className="jh-astronomy__location-error" role="status">{locationError}</p>}

      <div className="jh-astronomy__sky">
        <svg
          viewBox="0 0 400 154"
          role="img"
          aria-label={`Sun altitude ${Math.round(solar.altitude)} degrees, azimuth ${Math.round(solar.azimuth)} degrees`}
        >
          <path className="jh-astronomy__arc-bed" d="M24 118 Q200 -64 376 118" />
          {progress > 0.005 && <path className="jh-astronomy__arc" d={traversedArc} />}
          <path className="jh-astronomy__horizon" d="M18 119H382" />
          {Array.from({ length: 25 }, (_, index) => (
            <path
              key={index}
              className="jh-astronomy__tick"
              d={index % 4 === 0 ? 'M0 0v10' : 'M0 0v5'}
              transform={`translate(${24 + index * 14.67} 124)`}
            />
          ))}
          <path className="jh-astronomy__guide" d={`M${x.toFixed(1)} ${y.toFixed(1)}V118`} />
          <circle cx={x} cy={y} r="13" className="jh-astronomy__sun-halo" />
          <circle cx={x} cy={y} r="5" className="jh-astronomy__sun" />
          <text x="20" y="147">East</text>
          <text x="200" y="147" textAnchor="middle">South</text>
          <text x="380" y="147" textAnchor="end">West</text>
        </svg>
        <div className="jh-astronomy__scrubber">
          <span id={`${id}-solar-time-label`}>Time of day</span>
          <Slider
            labelId={`${id}-solar-time-label`}
            className="jh-scrubber-slider"
            min={0}
            max={1439}
            step={5}
            value={[currentMinutes]}
            thumbThickness={14}
            thumbHeight={24}
            thumbRadius={7}
            onValueChange={([minutes]) => setScrubMinutes(minutes)}
          />
          <output>{clock(currentMinutes)}</output>
          <Button
            size="small"
            variant="secondary"
            disabled={scrubMinutes === null}
            onClick={() => setScrubMinutes(null)}
          >
            Live
          </Button>
        </div>
      </div>

      <div className="jh-astronomy__readouts">
        <div><span>Sunrise</span><strong>{clock(solar.sunrise)}</strong></div>
        <div><span>Solar noon</span><strong>{clock(solar.solarNoon)}</strong></div>
        <div><span>Sunset</span><strong>{clock(solar.sunset)}</strong></div>
        <div><span>Altitude</span><strong>{solar.altitude.toFixed(1)}°</strong></div>
        <div><span>Azimuth</span><strong>{Math.round(solar.azimuth)}°</strong></div>
      </div>

      <div className="jh-astronomy__summary">
        <span>Daylight window</span>
        <strong>{daylightDuration(solar.sunrise, solar.sunset)}</strong>
        <small>Local solar elevation and horizon arc · {solarData ? 'Connected ephemeris' : 'Approximate model'}</small>
      </div>

      <footer className="jh-astronomy__footer">
        <span>{moment.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} local time</span>
        <span>{phaseLabel}</span>
      </footer>
    </section>
  );
}

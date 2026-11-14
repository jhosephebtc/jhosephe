import { clockwiseArcPath, instrumentAccentStyle } from './utils';

export function WeatherInstrument({
  temperature = 22,
  windSpeed = 14,
  windDirection = 238,
  humidity = 56,
  pressure = 1013,
  label = 'Weather conditions',
  accentColor,
}: {
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  humidity?: number;
  pressure?: number;
  label?: string;
  accentColor?: string;
}) {
  const direction = ((windDirection % 360) + 360) % 360;
  const dewPoint = temperature - (100 - Math.max(0, Math.min(100, humidity))) / 5;

  return (
    <section
      className="jh-weather"
      aria-label={label}
      style={instrumentAccentStyle(accentColor)}
    >
      <div className="jh-weather__header">
        <div>
          <span className="jh-weather__eyebrow">Atmospheric sensor · Barometer</span>
          <strong className="jh-weather__title">{label}</strong>
        </div>
        <output className="jh-weather__temp">{temperature.toFixed(1)}°C</output>
      </div>
      <div className="jh-weather__main">
        <div className="jh-weather__well">
          <svg className="jh-weather__rose" viewBox="0 0 140 140" role="img" aria-label={`Wind direction ${Math.round(direction)} degrees`}>
            <circle cx="70" cy="70" r="66" className="jh-weather__bezel" />
            <circle cx="70" cy="70" r="62" className="jh-weather__bezel-edge" />
            <circle cx="70" cy="70" r="59" className="jh-weather__rim" />
            <circle cx="70" cy="70" r="55" className="jh-weather__face" />
            {direction > 0 && <path className="jh-weather__arc" d={clockwiseArcPath(70, 70, 55, direction)} />}
            <g transform="translate(70 70)" className="jh-weather__ticks">
              {Array.from({ length: 24 }, (_, i) => (
                <path key={i} d={i % 2 === 0 ? 'M0 -51v7' : 'M0 -52v4'} transform={`rotate(${i * 15})`} />
              ))}
            </g>
            <text x="70" y="25" textAnchor="middle">N</text>
            <text x="115" y="74" textAnchor="middle">E</text>
            <text x="70" y="122" textAnchor="middle">S</text>
            <text x="25" y="74" textAnchor="middle">W</text>
            <g transform={`rotate(${direction} 70 70)`}>
              <path d="M70 33 76 70 70 65 64 70Z" className="jh-weather__needle" />
              <circle cx="70" cy="70" r="4" className="jh-weather__hub" />
            </g>
          </svg>
        </div>
        <div className="jh-weather__readings">
          <div><span>Wind</span><strong>{windSpeed.toFixed(1)} <small>km/h</small></strong></div>
          <div><span>Humidity</span><strong>{Math.round(humidity)}<small>%</small></strong></div>
          <div><span>Pressure</span><strong>{Math.round(pressure)} <small>hPa</small></strong></div>
          <div><span>Dew point</span><strong>{dewPoint.toFixed(1)} <small>°C</small></strong></div>
        </div>
      </div>
    </section>
  );
}

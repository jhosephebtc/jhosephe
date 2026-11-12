export function WeatherInstrument({ temperature = 22, windSpeed = 14, windDirection = 238, humidity = 56, pressure = 1013, label = 'Weather conditions' }: {
  temperature?: number; windSpeed?: number; windDirection?: number; humidity?: number; pressure?: number; label?: string;
}) {
  const direction = ((windDirection % 360) + 360) % 360;
  return <section className="jh-weather" aria-label={label}>
    <div className="jh-weather__header"><span>Conditions</span><output>{temperature.toFixed(1)}°C</output></div>
    <div className="jh-weather__main">
      <svg className="jh-weather__rose" viewBox="0 0 140 140" role="img" aria-label={`Wind direction ${Math.round(direction)} degrees`}>
        <circle cx="70" cy="70" r="66" className="jh-weather__bezel" />
        <circle cx="70" cy="70" r="62" className="jh-weather__bezel-edge" />
        <circle cx="70" cy="70" r="59" className="jh-weather__rim" />
        <circle cx="70" cy="70" r="55" className="jh-weather__face" />
        <g transform="translate(70 70)" className="jh-weather__ticks">{Array.from({ length: 24 }, (_, i) => <path key={i} d={i % 2 === 0 ? 'M0 -51v7' : 'M0 -52v4'} transform={`rotate(${i * 15})`} />)}</g>
        <text x="70" y="25" textAnchor="middle">N</text><text x="115" y="74" textAnchor="middle">E</text><text x="70" y="122" textAnchor="middle">S</text><text x="25" y="74" textAnchor="middle">W</text>
        <g transform={`rotate(${direction} 70 70)`}><path d="M70 35 76 70 70 65 64 70Z" className="jh-weather__needle" /><circle cx="70" cy="70" r="4" className="jh-weather__hub" /></g>
      </svg>
      <div className="jh-weather__readings">
        <div><span>Wind</span><strong>{windSpeed.toFixed(1)} <small>km/h</small></strong></div>
        <div><span>Humidity</span><strong>{Math.round(humidity)}<small>%</small></strong></div>
        <div><span>Pressure</span><strong>{Math.round(pressure)} <small>hPa</small></strong></div>
      </div>
    </div>
  </section>;
}

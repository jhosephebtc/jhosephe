import { useId, type CSSProperties } from 'react';
import { Slider } from './controls';

export function SpectrumControl({ hue, saturation, lightness, onHueChange, onSaturationChange, onLightnessChange, label = 'Color controls' }: {
  hue: number; saturation: number; lightness: number; onHueChange: (value: number) => void; onSaturationChange: (value: number) => void; onLightnessChange: (value: number) => void; label?: string;
}) {
  const id = useId();
  const color = `hsl(${hue} ${saturation}% ${lightness}%)`;
  return <section className="jh-spectrum" aria-label={label}>
    <div className="jh-spectrum__sample" style={{ background: color }}><span>{color.toLowerCase()}</span></div>
    <div className="jh-spectrum__field"><div><span id={`${id}-hue`}>Hue</span><output>{Math.round(hue)}°</output></div><Slider labelId={`${id}-hue`} className="jh-spectrum__hue" min={0} max={360} step={1} value={[hue]} onValueChange={values => onHueChange(values[0])} /></div>
    <div className="jh-spectrum__field"><div><span id={`${id}-saturation`}>Saturation</span><output>{Math.round(saturation)}%</output></div><Slider labelId={`${id}-saturation`} className="jh-spectrum__saturation" min={0} max={100} step={1} value={[saturation]} onValueChange={values => onSaturationChange(values[0])} style={{ '--jh-spectrum-color': color } as CSSProperties} /></div>
    <div className="jh-spectrum__field"><div><span id={`${id}-lightness`}>Lightness</span><output>{Math.round(lightness)}%</output></div><Slider labelId={`${id}-lightness`} className="jh-spectrum__lightness" min={8} max={92} step={1} value={[lightness]} onValueChange={values => onLightnessChange(values[0])} style={{ '--jh-spectrum-color': color } as CSSProperties} /></div>
  </section>;
}

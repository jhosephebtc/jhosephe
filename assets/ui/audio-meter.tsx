import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Button } from './button';

export type AudioMeterOrientation = 'horizontal' | 'vertical';
export type AudioMeterColorScale = 'accent' | 'heat' | 'pastel';

/** Animated matrix of square dB segments. Microphone access starts only after an explicit click. */
export function AudioMeter({ label = 'Audio level', orientation = 'horizontal', barCount = 32, colorScale = 'accent', accentColor = 'oklch(72% 0.018 250)' }: {
  label?: string; orientation?: AudioMeterOrientation; barCount?: number; colorScale?: AudioMeterColorScale; accentColor?: string;
}) {
  const count = Math.max(8, Math.min(64, Math.round(barCount)));
  const cellCount = 12;
  const columns = orientation === 'horizontal' ? count : cellCount;
  const rows = orientation === 'horizontal' ? cellCount : count;
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: count }, () => .12));
  const [mode, setMode] = useState<'demo' | 'microphone'>('demo');
  const [status, setStatus] = useState('Demo pulse');
  const capture = useRef<{ stream: MediaStream; context: AudioContext; analyser: AnalyserNode; frame: number } | null>(null);

  const releaseCapture = () => {
    const current = capture.current;
    if (!current) return;
    cancelAnimationFrame(current.frame);
    current.stream.getTracks().forEach(track => track.stop());
    void current.context.close();
    capture.current = null;
  };

  useEffect(() => {
    if (mode !== 'demo') return;
    let frame = 0;
    let lastUpdate = 0;
    const animate = (time: number) => {
      if (time - lastUpdate > 48) {
        const phase = time / 270;
        const pulse = Math.pow(Math.max(0, Math.sin(phase)), 7);
        setLevels(Array.from({ length: count }, (_, index) => {
          const ripple = Math.max(0, Math.sin(phase * .63 + index * .39));
          const edge = .45 + .55 * Math.sin((index / count) * Math.PI);
          return Math.min(1, .015 + edge * (.025 + ripple * .07 + pulse * .66));
        }));
        lastUpdate = time;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [mode, count]);

  useEffect(() => () => releaseCapture(), []);

  const startMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Microphone access is not available in this browser');
      return;
    }
    releaseCapture();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      await context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      context.createMediaStreamSource(stream).connect(analyser);
      const session = { stream, context, analyser, frame: 0 };
      capture.current = session;
      setMode('microphone');
      setStatus('Microphone on');
      const bins = new Uint8Array(analyser.frequencyBinCount);
      const sample = () => {
        if (capture.current !== session) return;
        analyser.getByteFrequencyData(bins);
        const next = Array.from({ length: count }, (_, index) => {
          const start = Math.floor((index / count) * bins.length * .72);
          const end = Math.max(start + 1, Math.floor(((index + 1) / count) * bins.length * .72));
          let sum = 0;
          for (let bin = start; bin < end; bin++) sum += bins[bin];
          return Math.min(1, Math.max(.035, ((sum / (end - start)) / 255) * 1.65));
        });
        setLevels(next);
        session.frame = requestAnimationFrame(sample);
      };
      sample();
    } catch {
      releaseCapture();
      setMode('demo');
      setStatus('Microphone permission was not granted');
    }
  };

  const amplitude = Math.max(.001, Math.sqrt(levels.reduce((total, level) => total + level * level, 0) / levels.length));
  const decibels = Math.max(-60, Math.min(0, Math.round(20 * Math.log10(amplitude))));
  const colorFor = (position: number) => {
    if (colorScale === 'accent') return accentColor;
    if (colorScale === 'heat') return `oklch(70% 0.19 ${Math.round(220 - position * 190)})`;
    return `oklch(82% 0.105 ${Math.round(275 - position * 115)})`;
  };
  return <section className="jh-audio-meter" data-orientation={orientation} aria-label={label}>
    <div className="jh-audio-meter__heading"><span>{label}</span><output>{decibels} <small>dBFS</small></output></div>
    <div className="jh-audio-meter__segments" data-orientation={orientation} data-scale={colorScale} style={{ gridTemplateColumns: `repeat(${columns}, 3px)`, gridTemplateRows: `repeat(${rows}, 3px)` } as CSSProperties} role="img" aria-label={`${label}, ${decibels} decibels full scale`}>
      {levels.flatMap((level, band) => Array.from({ length: cellCount }, (_, cell) => {
        const active = cell < Math.ceil(level * cellCount);
        const position = cellCount <= 1 ? 1 : cell / (cellCount - 1);
        const gridColumn = orientation === 'horizontal' ? band + 1 : cell + 1;
        const gridRow = orientation === 'horizontal' ? cellCount - cell : count - band;
        return <span key={`${band}-${cell}`} data-active={active} data-band={band} style={{ gridColumn, gridRow, '--jh-audio-cell-color': colorFor(position) } as CSSProperties} />;
      }))}
    </div>
    <div className="jh-audio-meter__actions">
      <Button
        type="button"
        size="small"
        variant="secondary"
        className={mode === 'demo' ? 'is-active' : undefined}
        aria-pressed={mode === 'demo'}
        onClick={() => { releaseCapture(); setMode('demo'); setStatus('Demo pulse'); }}
      >
        Demo pulse
      </Button>
      {mode === 'microphone' ? (
        <Button
          type="button"
          size="small"
          variant="secondary"
          className="is-active"
          aria-pressed={true}
          onClick={() => { releaseCapture(); setMode('demo'); setStatus('Demo pulse'); }}
        >
          Stop microphone
        </Button>
      ) : (
        <Button
          type="button"
          size="small"
          variant="secondary"
          aria-pressed={false}
          onClick={() => void startMicrophone()}
        >
          Use microphone
        </Button>
      )}
    </div>
    <span className="jh-visually-hidden" role="status">{status}</span>
  </section>;
}

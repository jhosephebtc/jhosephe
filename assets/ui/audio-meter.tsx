import { useEffect, useRef, useState } from 'react';

export type AudioMeterOrientation = 'horizontal' | 'vertical';

/** Animated retro level bars. Microphone access starts only after an explicit click. */
export function AudioMeter({ label = 'Audio level', orientation = 'horizontal', barCount = 32 }: {
  label?: string; orientation?: AudioMeterOrientation; barCount?: number;
}) {
  const count = Math.max(8, Math.min(64, Math.round(barCount)));
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
          return Math.min(1, .06 + edge * (.16 + ripple * .25 + pulse * .68));
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

  const width = orientation === 'horizontal' ? 320 : 72;
  const height = orientation === 'horizontal' ? 80 : 196;
  const gap = orientation === 'horizontal' ? width / count : height / count;
  return <section className="jh-audio-meter" data-orientation={orientation} aria-label={label}>
    <div className="jh-audio-meter__heading"><span>{label}</span><output>{Math.round(Math.max(...levels) * 100)}%</output></div>
    <svg className="jh-audio-meter__bars" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}, ${Math.round(Math.max(...levels) * 100)} percent`}>
      {levels.map((level, index) => orientation === 'horizontal'
        ? <rect key={index} x={index * gap + gap * .34} y={(height - level * 56) / 2} width={Math.max(1.4, gap * .27)} height={level * 56} rx="1" data-active={level > .24 || undefined} />
        : <rect key={index} x={(width - level * 54) / 2} y={index * gap + gap * .32} width={level * 54} height={Math.max(1.4, gap * .34)} rx="1" data-active={level > .24 || undefined} />)}
    </svg>
    <div className="jh-audio-meter__actions">
      <button type="button" aria-pressed={mode === 'demo'} onClick={() => { releaseCapture(); setMode('demo'); setStatus('Demo pulse'); }}>Demo pulse</button>
      {mode === 'microphone'
        ? <button type="button" onClick={() => { releaseCapture(); setMode('demo'); setStatus('Demo pulse'); }}>Stop microphone</button>
        : <button type="button" onClick={() => void startMicrophone()}>Use microphone</button>}
    </div>
    <span className="jh-visually-hidden" role="status">{status}</span>
  </section>;
}

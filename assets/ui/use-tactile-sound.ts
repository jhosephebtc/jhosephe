import { useCallback, useRef } from 'react';

type TactileSound = 'press' | 'tick';

/** Creates a tiny mechanical cue only after a user gesture. No audio file or autoplay. */
export function useTactileSound(enabled = false, minimumInterval = 32) {
  const contextRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef(0);
  const play = useCallback((kind: TactileSound = 'press') => {
    if (!enabled || typeof window === 'undefined') return;
    const now = performance.now();
    if (now - lastPlayedRef.current < minimumInterval) return;
    lastPlayedRef.current = now;
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return;
    const context = contextRef.current ?? new AudioContextConstructor();
    contextRef.current = context;
    if (context.state === 'suspended') void context.resume();
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    const startAt = context.currentTime;
    const duration = kind === 'tick' ? 0.012 : 0.018;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(kind === 'tick' ? 740 : 520, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'tick' ? 430 : 260, startAt + duration);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, startAt);
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(kind === 'tick' ? 0.012 : 0.018, startAt + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.002);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }, [enabled, minimumInterval]);
  return play;
}

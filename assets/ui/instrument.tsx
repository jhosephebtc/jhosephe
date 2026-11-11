/** The visible text outside this SVG carries the value. */
export function InstrumentBars({ value }: { value: number }) {
  const normalized = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const bars = Array.from({ length: 33 }, (_, index) => index);
  return (
    <svg className="jh-instrument" viewBox="0 0 330 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="jh-instrument__baseline" d="M0 64 H330" />
      {bars.map(index => {
        const active = (index + 1) / bars.length <= normalized / 100;
        const height = index % 4 === 0 ? 27 : 16;
        return <rect key={index} x={index * 10} y={60 - height} width="3" height={height} rx="1.5" className={active ? 'jh-instrument__bar is-active' : 'jh-instrument__bar'} />;
      })}
      <path className="jh-instrument__line" d="M0 12 H70 M260 12 H330" />
    </svg>
  );
}

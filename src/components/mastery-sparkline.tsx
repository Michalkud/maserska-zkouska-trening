type Props = {
  values: (number | null)[];
  max?: number;
  width?: number;
  height?: number;
  ariaLabel?: string;
};

export function MasterySparkline({
  values,
  max = 5,
  width = 84,
  height = 24,
  ariaLabel,
}: Props) {
  const n = values.length;
  const filledCount = values.reduce<number>(
    (acc, v) => acc + (v === null ? 0 : 1),
    0,
  );

  if (filledCount === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel ?? "Zatím žádná data"}
        className="shrink-0 text-muted-foreground"
      >
        <line
          x1={2}
          y1={height / 2}
          x2={width - 2}
          y2={height / 2}
          stroke="currentColor"
          strokeOpacity={0.25}
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  const pad = 2;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const toX = (i: number) =>
    n === 1 ? width / 2 : pad + (i / (n - 1)) * innerW;
  const toY = (v: number) => pad + (1 - Math.min(v, max) / max) * innerH;

  const segments: string[] = [];
  let current: string[] = [];
  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (v === null) {
      if (current.length >= 2) segments.push(current.join(" "));
      current = [];
    } else {
      const prefix = current.length === 0 ? "M" : "L";
      current.push(`${prefix}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`);
    }
  }
  if (current.length >= 2) segments.push(current.join(" "));

  const lastIdx = values.reduce<number>(
    (acc, v, i) => (v === null ? acc : i),
    -1,
  );
  const last = lastIdx >= 0 ? values[lastIdx] : null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? `Průměrná známka za posledních ${n} dní`}
      className="shrink-0 text-primary"
    >
      {segments.map((d, idx) => (
        <path
          key={idx}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {filledCount === 1 && lastIdx >= 0 && last !== null && (
        <circle cx={toX(lastIdx)} cy={toY(last)} r={1.5} fill="currentColor" />
      )}
      {filledCount > 1 && lastIdx >= 0 && last !== null && (
        <circle cx={toX(lastIdx)} cy={toY(last)} r={1.75} fill="currentColor" />
      )}
    </svg>
  );
}

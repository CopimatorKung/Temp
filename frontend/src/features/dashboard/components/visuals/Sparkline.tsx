type SparklineProps = {
  points: number[];
  height?: number;
  compact?: boolean;
  label: string;
};

export function Sparkline({ points, height = 80, compact = false, label }: SparklineProps) {
  const width = 240;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(max - min, 1);
  const step = width / Math.max(points.length - 1, 1);
  const mapped = points.map((point, index) => {
    const x = index * step;
    const y = height - ((point - min) / range) * (height - 12) - 6;
    return `${x},${y}`;
  });

  return (
    <svg className="block h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} preserveAspectRatio="none">
      {!compact && (
        <>
          <line x1="0" x2={width} y1={height - 6} y2={height - 6} stroke="hsl(var(--border))" />
          <line x1="0" x2={width} y1="6" y2="6" stroke="hsl(var(--border))" strokeDasharray="4 4" />
        </>
      )}
      <polyline points={mapped.join(' ')} fill="none" stroke="hsl(var(--primary))" strokeWidth={compact ? 3 : 4} strokeLinecap="round" strokeLinejoin="round" />
      {mapped.map((pair, index) => {
        const [x, y] = pair.split(',').map(Number);
        return <circle key={`${pair}-${index}`} cx={x} cy={y} r={compact ? 2 : 3} fill="hsl(var(--primary))" />;
      })}
    </svg>
  );
}

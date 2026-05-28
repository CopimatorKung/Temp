import { useId } from 'react';

type SparklineProps = {
  points: number[];
  height?: number;
  compact?: boolean;
  label: string;
  // full-chart options
  showAxes?: boolean;
  xLabels?: string[];
  yUnit?: string;
  yDomain?: [number, number];
};

export function Sparkline({
  points,
  height = 80,
  compact = false,
  label,
  showAxes = false,
  xLabels,
  yUnit = '',
  yDomain,
}: SparklineProps) {
  if (showAxes) {
    return (
      <FullChart
        points={points}
        label={label}
        xLabels={xLabels}
        yUnit={yUnit}
        yDomain={yDomain}
      />
    );
  }
  return (
    <CompactSparkline
      points={points}
      height={height}
      compact={compact}
      label={label}
    />
  );
}

// ─── Full chart with Y/X axes, grid lines, area fill ─────────────────────────
// Wide viewBox (5:1 ratio) so the SVG auto-sizes height from its width

const CW = 560;
const CH = 112;
const PL = 44;   // left pad for Y labels
const PR = 50;   // right pad (room for last-value badge)
const PT = 8;    // top pad
const PB = 22;   // bottom pad for X labels
const PW = CW - PL - PR;   // 466
const PH = CH - PT - PB;   // 82

function toXY(
  i: number,
  count: number,
  value: number,
  yMin: number,
  yMax: number,
) {
  const yRange = Math.max(yMax - yMin, 1);
  const x = PL + (i / Math.max(count - 1, 1)) * PW;
  const y = PT + (1 - (value - yMin) / yRange) * PH;
  return [x, y] as const;
}

function FullChart({
  points,
  label,
  xLabels,
  yUnit = '',
  yDomain,
}: {
  points: number[];
  label: string;
  xLabels?: string[];
  yUnit?: string;
  yDomain?: [number, number];
}) {
  const id = useId().replace(/:/g, '');
  const gradId = `fg-${id}`;

  const dataMin = Math.min(...points);
  const dataMax = Math.max(...points);
  const yMin = yDomain ? yDomain[0] : dataMin;
  const yMax = yDomain ? yDomain[1] : dataMax;
  const yRange = Math.max(yMax - yMin, 1);

  // 5 evenly-spaced Y ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => yMin + t * yRange);

  const coords = points.map((p, i) => toXY(i, points.length, p, yMin, yMax));
  const polyline = coords.map(([x, y]) => `${x},${y}`).join(' ');

  const firstX = coords[0]?.[0] ?? PL;
  const lastX = coords[coords.length - 1]?.[0] ?? PL + PW;
  const bottomY = PT + PH;
  const area = `${firstX},${bottomY} ${polyline} ${lastX},${bottomY}`;

  const lastVal = points[points.length - 1];
  const [lx, ly] = coords[coords.length - 1] ?? [0, 0];

  return (
    <svg
      className="block w-full"
      style={{ height: 'auto' }}
      viewBox={`0 0 ${CW} ${CH}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.20" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines + Y-axis labels */}
      {yTicks.map((tick, i) => {
        const y = PT + (1 - (tick - yMin) / yRange) * PH;
        const raw = tick;
        const formatted =
          Math.abs(raw) >= 1000
            ? `${(raw / 1000).toFixed(0)}k`
            : Number.isInteger(raw)
              ? raw.toString()
              : raw.toFixed(1);
        return (
          <g key={i}>
            <line
              x1={PL}
              x2={PL + PW}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={0.8}
              strokeDasharray={i === 0 ? undefined : '4 3'}
            />
            <text
              x={PL - 5}
              y={y + 3.5}
              textAnchor="end"
              fontSize="8"
              fill="hsl(var(--muted-foreground))"
              fontFamily="inherit"
            >
              {formatted}{yUnit}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <polygon points={area} fill={`url(#${gradId})`} />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="hsl(var(--primary))" />
      ))}

      {/* Last value badge */}
      <rect
        x={lx + 5}
        y={ly - 9}
        width={34}
        height={14}
        rx="3"
        fill="hsl(var(--primary))"
      />
      <text
        x={lx + 22}
        y={ly + 1.5}
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="hsl(var(--primary-foreground))"
        fontFamily="inherit"
      >
        {lastVal}{yUnit}
      </text>

      {/* X-axis labels */}
      {xLabels &&
        coords.map(([x], i) => {
          const lbl = xLabels[i];
          if (!lbl) return null;
          if (xLabels.length > 6 && i % 2 !== 0 && i !== xLabels.length - 1) return null;
          return (
            <text
              key={i}
              x={x}
              y={CH - 4}
              textAnchor="middle"
              fontSize="8"
              fill="hsl(var(--muted-foreground))"
              fontFamily="inherit"
            >
              {lbl}
            </text>
          );
        })}
    </svg>
  );
}

// ─── Compact sparkline with area fill ─────────────────────────────────────────

function CompactSparkline({
  points,
  height = 52,
  compact,
  label,
}: {
  points: number[];
  height: number;
  compact: boolean;
  label: string;
}) {
  const id = useId().replace(/:/g, '');
  const gradId = `cg-${id}`;
  const width = 240;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(max - min, 1);
  const step = width / Math.max(points.length - 1, 1);

  const mapped = points.map((p, index) => {
    const x = index * step;
    const y = height - ((p - min) / range) * (height - 12) - 6;
    return `${x},${y}`;
  });

  const firstX = 0;
  const lastX = (points.length - 1) * step;
  const bottomY = height - 6;
  const area = `${firstX},${bottomY} ${mapped.join(' ')} ${lastX},${bottomY}`;

  return (
    <svg
      className="block h-full w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {!compact && (
        <>
          <line x1="0" x2={width} y1={height - 6} y2={height - 6} stroke="hsl(var(--border))" strokeWidth="1" />
          <line x1="0" x2={width} y1="6" y2="6" stroke="hsl(var(--border))" strokeDasharray="4 4" strokeWidth="0.8" />
        </>
      )}

      {/* Area fill */}
      <polygon points={area} fill={`url(#${gradId})`} />

      {/* Line */}
      <polyline
        points={mapped.join(' ')}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={compact ? 2.5 : 3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {mapped.map((pair, index) => {
        const [x, y] = pair.split(',').map(Number);
        return (
          <circle key={index} cx={x} cy={y} r={compact ? 2 : 3} fill="hsl(var(--primary))" />
        );
      })}
    </svg>
  );
}

import { competencyLabels } from '../constants';
import type { CompetencyKey, Persona } from '../types';

export function PersonaAvatar({ persona, className = '' }: { persona: Persona; className?: string }) {
  return (
    <div
      className={[
        'inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary/20',
        'bg-[radial-gradient(circle_at_35%_25%,hsl(var(--card)),hsl(var(--secondary))_42%,hsl(var(--primary)/0.18))]',
        'text-xl font-semibold text-primary shadow-sm',
        className,
      ].join(' ')}
    >
      {persona.avatar}
    </div>
  );
}

export function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ height: size, width: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-label={`Score ${score}`}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="9"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className={size <= 132 ? 'text-3xl font-semibold text-foreground' : 'text-4xl font-semibold text-foreground'}>
            {score}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Total score</p>
        </div>
      </div>
    </div>
  );
}

export function RadarChart({
  current,
  previous,
  className = '',
  height = 256,
}: {
  current: Record<CompetencyKey, number>;
  previous?: Record<CompetencyKey, number>;
  className?: string;
  height?: number;
}) {
  const center = 100;
  const maxRadius = 76;
  const angleFor = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / competencyLabels.length;
  const pointFor = (value: number, index: number) => {
    const angle = angleFor(index);
    const radius = (value / 100) * maxRadius;
    return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
  };
  const polygon = (scores: Record<CompetencyKey, number>) =>
    competencyLabels.map((label, index) => pointFor(scores[label], index)).join(' ');

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{ height, width: '100%' }}
      role="img"
      aria-label="Senario competency radar chart"
    >
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={competencyLabels.map((_, index) => pointFor(level * 100, index)).join(' ')}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
      ))}
      {competencyLabels.map((label, index) => {
        const angle = angleFor(index);
        const x = center + Math.cos(angle) * 92;
        const y = center + Math.sin(angle) * 92;

        return (
          <g key={label}>
            <line x1={center} y1={center} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth="1" />
            <text
              x={x}
              y={y}
              textAnchor={x < center - 6 ? 'end' : x > center + 6 ? 'start' : 'middle'}
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-semibold"
            >
              {label}
            </text>
          </g>
        );
      })}
      {previous ? (
        <polygon points={polygon(previous)} fill="hsl(var(--accent) / 0.16)" stroke="hsl(var(--accent))" strokeWidth="2" />
      ) : null}
      <polygon points={polygon(current)} fill="hsl(var(--primary) / 0.22)" stroke="hsl(var(--primary))" strokeWidth="3" />
      {competencyLabels.map((label, index) => {
        const [x, y] = pointFor(current[label], index).split(',').map(Number);
        return <circle key={label} cx={x} cy={y} r="3" fill="hsl(var(--primary))" />;
      })}
    </svg>
  );
}

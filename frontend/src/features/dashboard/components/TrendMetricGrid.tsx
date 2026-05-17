import type { IconType } from 'react-icons';
import { Card, CardContent } from '../../../components/ui/Card';
import { trendMetrics } from '../dashboard-data';
import { Sparkline } from './visuals/Sparkline';

export function TrendMetricGrid() {
  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {trendMetrics.map((metric) => (
        <TrendMetricCard key={metric.label} {...metric} />
      ))}
    </section>
  );
}

function TrendMetricCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
  points,
}: {
  label: string;
  value: string;
  change: string;
  icon: IconType;
  tone: string;
  points: number[];
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-success/12 text-success'
      : tone === 'warning'
        ? 'bg-warning/15 text-warning'
        : 'bg-primary/10 text-primary';

  return (
    <Card>
      <CardContent className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className={['flex h-10 w-10 items-center justify-center rounded-lg', toneClass].join(' ')}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          </div>
          <span className={tone === 'warning' ? 'text-xs text-warning' : 'text-xs text-success'}>{change}</span>
        </div>
        <div className="mt-4">
          <Sparkline points={points} height={52} compact label={`${label} trend`} />
        </div>
      </CardContent>
    </Card>
  );
}

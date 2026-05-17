import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent } from '../../../components/ui/Card';
import { badges, tracks } from '../mock-data';

export function TrackOverviewMetrics() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <TrackMetric label="Active tracks" value={tracks.length.toString()} />
      <TrackMetric label="Avg completion" value="68%" tone="warning" />
      <TrackMetric label="Badges earned" value={badges.filter((badge) => badge.status === 'earned').length.toString()} tone="success" />
      <TrackMetric label="Linked Senarios" value="5" />
    </div>
  );
}

export function TrackMetric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' }) {
  const dot = tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : 'bg-primary';

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <span className={['mt-1 h-2.5 w-2.5 rounded-full', dot].join(' ')} />
      </CardContent>
    </Card>
  );
}

export function TrackProgressBar({ value, label, compact = false }: { value: number; label: string; compact?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
        <span>{label}</span>
        {!compact ? <span>{value}%</span> : null}
      </div>
      <div className={['mt-2 overflow-hidden rounded-full bg-muted', compact ? 'h-1.5' : 'h-2'].join(' ')}>
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export function TrackStatusBadge({ progress, threshold }: { progress: number; threshold: number }) {
  const earned = progress >= threshold;
  return <Badge tone={earned ? 'success' : 'warning'}>{earned ? 'badge ready' : `${threshold}% target`}</Badge>;
}

import type { IconType } from 'react-icons';
import { Card, CardContent } from '../../../../components/ui/Card';

type ExecutiveMetricCardProps = {
  label: string;
  value: string;
  change: string;
  helper: string;
  icon: IconType;
};

export function ExecutiveMetricCard({ label, value, change, helper, icon: Icon }: ExecutiveMetricCardProps) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="min-w-0 text-sm font-semibold leading-5">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-success">{change}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

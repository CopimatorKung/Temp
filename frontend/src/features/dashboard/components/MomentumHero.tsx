import { FiTrendingUp } from 'react-icons/fi';
import { Card, CardContent } from '../../../components/ui/Card';
import { executiveMetrics } from '../dashboard-data';
import { ExecutiveMetricCard } from './cards/ExecutiveMetricCard';
import { Sparkline } from './visuals/Sparkline';

const momentumPoints = [18, 28, 34, 44, 55, 60, 66, 78];
const momentumXLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];

export function MomentumHero() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid min-w-0 gap-4 p-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(360px,1.15fr)] 2xl:grid-cols-[minmax(340px,0.82fr)_minmax(360px,0.95fr)_minmax(420px,0.95fr)]">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[52px_1fr]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <FiTrendingUp className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Team Momentum</p>
            <h2 className="mt-1 text-lg font-semibold">Your team is improving</h2>
            <p className="mt-1 text-sm text-success">+18% more deals won vs last 30 days</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground xl:max-w-md 2xl:max-w-xl">
              Focus on objection handling and product knowledge this week. Revenue risk is concentrated in promotion
              terms and competitor migration talk tracks.
            </p>
          </div>
        </div>
        <div className="min-w-0 self-center rounded-lg bg-background/45 p-2">
          <Sparkline
            points={momentumPoints}
            height={96}
            label="Team readiness trend"
            showAxes
            xLabels={momentumXLabels}
            yUnit="%"
          />
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3 xl:col-span-2 2xl:col-span-1">
          {executiveMetrics.map((metric) => (
            <ExecutiveMetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { recentImprovements } from '../dashboard-data';

export function RecentImprovementsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Team Improvements</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {recentImprovements.map((item) => (
          <div key={item.title} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <span className="whitespace-nowrap text-sm font-semibold text-success">{item.points}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

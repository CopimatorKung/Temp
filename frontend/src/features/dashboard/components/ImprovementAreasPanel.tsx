import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { improvementAreas } from '../dashboard-data';

export function ImprovementAreasPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Improvement Areas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {improvementAreas.map((area) => (
          <div key={area.label} className="grid grid-cols-[1fr_minmax(80px,1.2fr)_36px_48px] items-center gap-3 text-sm">
            <span className="font-medium">{area.label}</span>
            <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary transition-all" style={{ width: `${area.value}%` }} />
            </div>
            <span className="text-right text-xs font-semibold text-foreground">{area.value}%</span>
            <span className="text-right text-xs text-success">{area.change}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

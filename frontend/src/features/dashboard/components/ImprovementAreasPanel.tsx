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
          <div key={area.label} className="grid grid-cols-[150px_1fr_auto] items-center gap-3 text-sm">
            <span className="font-medium">{area.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${area.value}%` }} />
            </span>
            <span className="text-success">{area.change}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { onboardingTracks } from '../dashboard-data';

export function OnboardingProgressPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-28 w-28 place-items-center rounded-full border-[10px] border-success/70 bg-card text-center">
            <div>
              <p className="text-2xl font-semibold">67%</p>
              <p className="text-[11px] text-muted-foreground">Avg. Progress</p>
            </div>
          </div>
          <div className="grid flex-1 gap-2 rounded-lg border border-border p-3 text-sm">
            <div className="flex justify-between">
              <span>Completed</span>
              <strong>18</strong>
            </div>
            <div className="flex justify-between">
              <span>In Progress</span>
              <strong>9</strong>
            </div>
            <div className="flex justify-between">
              <span>Not Started</span>
              <strong>5</strong>
            </div>
          </div>
        </div>
        {onboardingTracks.map((track) => (
          <div key={track.label} className="grid grid-cols-[140px_1fr_auto] items-center gap-3 text-xs">
            <span className="font-medium">{track.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-success" style={{ width: `${track.value}%` }} />
            </span>
            <span>{track.value}%</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

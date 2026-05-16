import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatMs } from '../../lib/format';
import type { ScorecardResult } from '../../features/audio-submissions/types';

export function EvidenceDrawer({ scorecard, selectedItemId }: { scorecard?: ScorecardResult; selectedItemId?: string }) {
  const item = scorecard?.sections.flatMap((section) => section.items).find((entry) => entry.id === selectedItemId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence</CardTitle>
      </CardHeader>
      <CardContent>
        {!item ? (
          <p className="text-sm text-muted-foreground">เลือก score item เพื่อดู evidence</p>
        ) : (
          <div className="grid gap-3">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={item.status === 'passed' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'}>
                  {item.status}
                </Badge>
                <Badge tone="muted">{item.severity}</Badge>
                <span className="text-xs text-muted-foreground">
                  {item.score}/{item.maxScore}
                </span>
              </div>
              <p className="text-sm font-semibold">{item.label}</p>
            </div>
            {item.evidence.length === 0 ? (
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                ไม่พบ evidence ใน transcript สำหรับข้อนี้
              </div>
            ) : (
              item.evidence.map((evidence) => (
                <div key={`${item.id}-${evidence.utteranceId}`} className="rounded-lg border border-border bg-white p-3">
                  <p className="text-xs text-muted-foreground">
                    {evidence.speaker} · {formatMs(evidence.startMs)} - {formatMs(evidence.endMs)}
                  </p>
                  <p className="mt-2 text-sm leading-6">{evidence.text}</p>
                </div>
              ))
            )}
            {item.recommendation && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs font-semibold text-muted-foreground">Recommendation</p>
                <p className="mt-1 text-sm leading-6">{item.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { FiAlertTriangle, FiCheckCircle, FiClipboard } from 'react-icons/fi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { scoreTone } from '../../lib/format';
import type { ScorecardResult } from '../../features/audio-submissions/types';

type ScorecardSummaryProps = {
  scorecard?: ScorecardResult;
  selectedItemId?: string;
  onSelectItem: (itemId: string) => void;
  onOverride: () => void;
};

export function ScorecardSummary({ scorecard, selectedItemId, onSelectItem, onOverride }: ScorecardSummaryProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Quality Scorecard</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">มาตรฐานเปลี่ยนตาม topic, customer segment และ product</p>
        </div>
        {scorecard && <Badge tone={scoreTone(scorecard.totalScore)}>{scorecard.totalScore}/100</Badge>}
      </CardHeader>
      <CardContent>
        {!scorecard ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <FiClipboard className="h-5 w-5" />
            ยังไม่มีผลคะแนน
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">{scorecard.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                status: {scorecard.status} · risk: {scorecard.riskLevel} · override: {scorecard.review.overrideCount}
              </p>
            </div>
            <div className="grid gap-3">
              {scorecard.sections.map((section) => (
                <div key={section.id} className="rounded-lg border border-border bg-white">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">{section.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {section.score}/{section.maxScore}
                    </p>
                  </div>
                  <div className="grid gap-2 p-3">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onSelectItem(item.id)}
                        className={[
                          'rounded-lg border p-3 text-left transition',
                          selectedItemId === item.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{item.label}</p>
                            {item.recommendation && (
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.recommendation}</p>
                            )}
                          </div>
                          {item.status === 'passed' ? (
                            <FiCheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <FiAlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="secondary" onClick={onOverride}>
              Apply Manager Override
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { FiArrowRight } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { knowledgeGaps } from '../dashboard-data';

export function KnowledgeGapsPanel() {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Knowledge Gaps</CardTitle>
        <button className="text-xs font-semibold text-primary">View all</button>
      </CardHeader>
      <CardContent className="grid gap-3">
        {knowledgeGaps.map((gap) => (
          <div key={gap.topic} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{gap.topic}</p>
              <p className="mt-1 text-xs text-muted-foreground">{gap.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-destructive">{gap.failRate}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {gap.affected} reps · {gap.revenue}
              </p>
            </div>
          </div>
        ))}
        <button className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View all knowledge gaps
          <FiArrowRight className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}

import { FiZap } from 'react-icons/fi';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function AiInsightBanner() {
  return (
    <Card className="border-primary/20 bg-primary/8">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <FiZap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Insight</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reps who practice objection handling 3+ times per week close 22% more deals.
            </p>
          </div>
        </div>
        <Button variant="secondary">View Coaching Recommendations</Button>
      </CardContent>
    </Card>
  );
}

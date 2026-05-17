import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { lostDealReasons } from '../dashboard-data';

export function LostDealsPanel() {
  const gradient = `conic-gradient(${lostDealReasons
    .reduce<{ color: string; start: number; end: number }[]>((segments, item, index) => {
      const start = index === 0 ? 0 : segments[index - 1].end;
      const end = start + item.value;
      return [...segments, { color: item.color, start, end }];
    }, [])
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(', ')})`;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Why Deals Are Lost</CardTitle>
      </CardHeader>
      <CardContent className="grid min-w-0 gap-4 md:grid-cols-[150px_minmax(0,1fr)] xl:grid-cols-[130px_minmax(0,1fr)] 2xl:grid-cols-[150px_minmax(0,1fr)]">
        <div className="relative mx-auto h-36 w-36 rounded-full xl:h-32 xl:w-32 2xl:h-36 2xl:w-36" style={{ background: gradient }}>
          <div className="absolute inset-8 grid place-items-center rounded-full bg-card text-center">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">143</p>
              <p className="text-xs text-muted-foreground">Lost Deals</p>
            </div>
          </div>
        </div>
        <div className="grid min-w-0 content-center gap-3">
          {lostDealReasons.map((reason) => (
            <div key={reason.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: reason.color }} />
                <span className="min-w-0 truncate">{reason.label}</span>
              </span>
              <span className="font-semibold">{reason.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

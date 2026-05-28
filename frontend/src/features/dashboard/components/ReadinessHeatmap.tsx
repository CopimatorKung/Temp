import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { readinessHeatmap } from '../dashboard-data';

const columns = [
  ['product', 'Product Knowledge'],
  ['discovery', 'Discovery'],
  ['objection', 'Objection Handling'],
  ['pricing', 'Pricing & Terms'],
  ['compliance', 'Compliance'],
  ['executive', 'Executive Pitch'],
  ['overall', 'Overall'],
] as const;

export function ReadinessHeatmap() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Team Readiness Heatmap</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">ภาพรวมช่องว่างความพร้อมของแต่ละทีมและทักษะ</p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm xl:min-w-0">
          <thead className="bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-3 font-semibold">Team</th>
              {columns.map(([, label]) => (
                <th key={label} className="px-2 py-3 text-center text-[11px] font-semibold leading-4">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {readinessHeatmap.map((row) => (
              <tr key={row.team} className="border-t border-border">
                <td className="whitespace-nowrap px-3 py-3 font-medium">{row.team}</td>
                {columns.map(([key]) => (
                  <td key={key} className="px-1.5 py-2 text-center">
                    <span className={['block rounded-md px-1.5 py-2 font-semibold', heatTone(row[key])].join(' ')}>
                      {row[key]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function heatTone(value: number) {
  if (value >= 80) return 'bg-success/18 text-success';
  if (value >= 60) return 'bg-accent/18 text-foreground';
  if (value >= 50) return 'bg-warning/18 text-warning';
  return 'bg-destructive/14 text-destructive';
}

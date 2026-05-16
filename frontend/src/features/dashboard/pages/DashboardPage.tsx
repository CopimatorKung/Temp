import { FiAlertTriangle, FiArrowUpRight, FiCheckCircle, FiClock, FiFileText, FiMic, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { routes } from '../../../app/routes';

const metrics = [
  {
    label: 'Reviews Completed',
    value: '128',
    change: '+18%',
    icon: FiFileText,
    tone: 'primary',
  },
  {
    label: 'Avg Quality Score',
    value: '82',
    change: '+6 pts',
    icon: FiCheckCircle,
    tone: 'success',
  },
  {
    label: 'Needs Manager Review',
    value: '19',
    change: '7 critical',
    icon: FiAlertTriangle,
    tone: 'warning',
  },
  {
    label: 'Time To Readiness',
    value: '21d',
    change: '-5 days',
    icon: FiClock,
    tone: 'accent',
  },
];

const scoreBands = [
  { label: 'Opening', value: 91 },
  { label: 'Discovery', value: 64 },
  { label: 'Promotion Terms', value: 58 },
  { label: 'Pitch Quality', value: 84 },
  { label: 'Professionalism', value: 96 },
];

const teamRows = [
  { name: 'Somchai K.', status: 'Needs review', score: 70, roleplay: 4, readiness: 'In progress' },
  { name: 'Pim L.', status: 'Passed', score: 88, roleplay: 8, readiness: 'Ready' },
  { name: 'Narin T.', status: 'Coaching', score: 62, roleplay: 3, readiness: 'Needs retraining' },
  { name: 'May S.', status: 'Passed', score: 91, roleplay: 7, readiness: 'Ready' },
];

const playbookGaps = [
  'Promotion Q2 expiry condition',
  'Competitor price objection',
  'Implementation timeline for SME',
];

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-5 py-5 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Sales Enablement Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">ภาพรวมคุณภาพการขายและ onboarding</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              ติดตาม call/content quality, readiness, training activity และช่องว่างของ Playbook จาก workflow mock ของ MVP
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={routes.audioNew}>
              <Button>
                New Review
                <FiArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="secondary">
              <FiMic className="h-4 w-4" />
              Voice Senario
            </Button>
          </div>
        </div>
      </header>

      <main className="grid gap-5 p-5 lg:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Scorecard Performance</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">จุดแข็งและจุดอ่อนจาก quality review ล่าสุด</p>
              </div>
              <Badge tone="muted">Last 30 days</Badge>
            </CardHeader>
            <CardContent className="grid gap-4">
              {scoreBands.map((band) => (
                <div key={band.label} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{band.label}</span>
                    <span className="text-muted-foreground">{band.value}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${band.value}%` }}
                      aria-label={`${band.label} ${band.value}%`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Playbook Gaps</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">คำถามที่ควรเพิ่มเป็น Playbook Section</p>
            </CardHeader>
            <CardContent className="grid gap-3">
              {playbookGaps.map((gap, index) => (
                <div key={gap} className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{gap}</p>
                    <p className="mt-1 text-xs text-muted-foreground">ต้องมี owner, tag และ effective date ถ้าเป็น promotion</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Team Readiness</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">ใช้สำหรับ manager ติดตามคนที่พร้อมขายและคนที่ต้อง coach ต่อ</p>
              </div>
              <Badge tone="success">4 sales</Badge>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Sales</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Score</th>
                    <th className="px-5 py-3 font-semibold">Senarios</th>
                    <th className="px-5 py-3 font-semibold">Readiness</th>
                  </tr>
                </thead>
                <tbody>
                  {teamRows.map((row) => (
                    <tr key={row.name} className="border-t border-border bg-card">
                      <td className="px-5 py-4 font-medium">{row.name}</td>
                      <td className="px-5 py-4">
                        <Badge tone={row.status === 'Passed' ? 'success' : row.status === 'Needs review' ? 'warning' : 'danger'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">{row.score}</td>
                      <td className="px-5 py-4">{row.roleplay}</td>
                      <td className="px-5 py-4 text-muted-foreground">{row.readiness}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="border-primary-foreground/14">
              <CardTitle>Manager Focus</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12">
                  <FiUsers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">3 people need coaching</p>
                  <p className="mt-1 text-xs text-primary-foreground/72">Discovery และ promotion terms เป็น pain หลัก</p>
                </div>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm font-medium">Next action</p>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/78">
                  Review calls ที่มี critical issue แล้ว assign recording review training ให้ sales ก่อนรับ lead ใหม่
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof FiFileText;
  tone: string;
}) {
  const toneClass =
    tone === 'success'
      ? 'bg-success/12 text-success'
      : tone === 'warning'
        ? 'bg-warning/15 text-warning'
        : tone === 'accent'
          ? 'bg-accent/12 text-accent'
          : 'bg-primary/10 text-primary';

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
          <p className="mt-1 text-xs font-medium text-accent">{change}</p>
        </div>
        <div className={['flex h-12 w-12 items-center justify-center rounded-lg', toneClass].join(' ')}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

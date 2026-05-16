import type { IconType } from 'react-icons';
import { FiArrowUpRight } from 'react-icons/fi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

type Stat = {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
};

type Panel = {
  title: string;
  description: string;
  items: string[];
};

type MockPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconType;
  primaryAction: string;
  stats: Stat[];
  panels: Panel[];
};

export function MockPage({ eyebrow, title, description, icon: Icon, primaryAction, stats, panels }: MockPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-5 py-5 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <Button>
            <Icon className="h-4 w-4" />
            {primaryAction}
          </Button>
        </div>
      </header>

      <main className="grid gap-5 p-5 lg:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                  </div>
                  <Badge tone={stat.tone ?? 'default'}>mock</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {panels.map((panel) => (
            <Card key={panel.title}>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{panel.title}</CardTitle>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{panel.description}</p>
                </div>
                <FiArrowUpRight className="mt-1 h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="grid gap-3">
                {panel.items.map((item) => (
                  <div key={item} className="rounded-lg border border-border bg-white p-3 text-sm leading-6">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}

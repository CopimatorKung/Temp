import { FiAward, FiCheckCircle, FiShield, FiUser } from 'react-icons/fi';
import { routes } from '../../../app/routes';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';

const profileStats = [
  { label: 'Role', value: 'Manager' },
  { label: 'Team', value: 'Revenue Enablement' },
  { label: 'Region', value: 'Thailand' },
  { label: 'Highest badge', value: 'Voice Architect' },
];

export function ProfilePage() {
  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <header className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Profile</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              PK
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Pim K.</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manager · Voice Architect badge · Pitchsmith workspace</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>
              <span className="inline-flex items-center gap-1">
                <FiAward className="h-3.5 w-3.5" />
                Voice Architect
              </span>
            </Badge>
            <Badge tone="muted">mock profile</Badge>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {profileStats.map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">ข้อมูล mock สำหรับตั้งค่า user profile ที่ใช้แสดงใน sidebar และ workflow review</p>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Display name">
              <Input defaultValue="Pim K." />
            </Field>
            <Field label="Email">
              <Input defaultValue="pim.k@pitchsmith.local" type="email" />
            </Field>
            <Field label="Role">
              <Select defaultValue="manager">
                <option value="sales">Sales</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
            <Field label="Team">
              <Input defaultValue="Revenue Enablement" />
            </Field>
            <Field label="Language">
              <Select defaultValue="th">
                <option value="th">Thai</option>
                <option value="en">English</option>
              </Select>
            </Field>
            <Field label="Timezone">
              <Select defaultValue="asia-bangkok">
                <option value="asia-bangkok">Asia/Bangkok</option>
                <option value="utc">UTC</option>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Button type="button">
                <FiCheckCircle className="h-4 w-4" />
                Save profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Account access</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">สิทธิ์ที่ mock จาก role และ team scope</p>
            </CardHeader>
            <CardContent className="grid gap-3 p-5">
              {['Review team quality score', 'Manage training sessions', 'View knowledge favorites'].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-border bg-background/70 p-3">
                  <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-3 p-5">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-secondary text-primary">
                <FiUser className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">Profile source</p>
              <p className="text-sm leading-6 text-muted-foreground">
                หน้า mock นี้จะ map กับ user service ภายหลัง และควร sync ชื่อ/avatar/role/highest badge กลับไปที่ sidebar badge
              </p>
              <a className="text-sm font-semibold text-primary hover:underline" href={routes.settings}>
                Back to settings
              </a>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

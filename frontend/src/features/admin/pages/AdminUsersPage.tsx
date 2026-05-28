import { useState } from 'react';
import {
  FiBell,
  FiCheck,
  FiChevronRight,
  FiDatabase,
  FiEdit2,
  FiLock,
  FiMoreVertical,
  FiMoon,
  FiPackage,
  FiSettings,
  FiSun,
  FiTag,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import { applyTheme, getStoredTheme, type ThemeMode } from '../../../lib/theme';

type SettingsView = 'index' | 'theme' | 'users-roles' | 'security' | 'knowledge-sync' | 'notifications' | 'track-categories' | 'solutions';

type AdminUsersPageProps = {
  view?: SettingsView;
};

const settingsItems = [
  {
    title: 'Theme',
    description: 'เลือกรูปแบบสีสว่างหรือสีเข้มสำหรับหน้าจอทั้งระบบ',
    icon: FiSun,
    href: routes.settingsTheme,
    status: 'active',
  },
  {
    title: 'Track Categories',
    description: 'จัดกลุ่ม onboarding track เช่น foundation, solution specialist และ enterprise',
    icon: FiTag,
    href: routes.settingsTrackCategories,
    status: 'preview',
  },
  {
    title: 'Solutions',
    description: 'ตั้งค่าสินค้าหลักสำหรับคัดกรองหลักสูตรและมอบหมายเส้นทางการเรียนรู้',
    icon: FiPackage,
    href: routes.settingsSolutions,
    status: 'preview',
  },
  {
    title: 'Users & Roles',
    description: 'จัดการผู้ใช้งาน บทบาท และขอบเขตทีมในระบบ',
    icon: FiUsers,
    href: routes.settingsUsersRoles,
    status: 'preview',
  },
  {
    title: 'Security',
    description: 'กำหนดนโยบายความปลอดภัยและการเข้าถึงระบบ',
    icon: FiLock,
    href: routes.settingsSecurity,
    status: 'preview',
  },
  {
    title: 'Knowledge Sync',
    description: 'ตั้งค่าระบบค้นหาและ AI สำหรับฐานความรู้',
    icon: FiDatabase,
    href: routes.settingsKnowledgeSync,
    status: 'preview',
  },
  {
    title: 'Notifications',
    description: 'ตั้งค่าการแจ้งเตือนสำหรับการตรวจสอบ การฝึกอบรม และการอัพโหลดไฟล์',
    icon: FiBell,
    href: routes.settingsNotifications,
    status: 'preview',
  },
];

const managedTrackCategories = [
  {
    id: 'foundation',
    name: 'Foundation',
    description: 'Core onboarding and company standard',
    assignedTracks: ['Chatbot Mastery'],
    status: 'published',
  },
  {
    id: 'solution-specialist',
    name: 'Solution Specialist',
    description: 'Product-specific enablement path',
    assignedTracks: ['Chatbot Mastery', 'Voicebot Architect'],
    status: 'published',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Cross-solution and complex deal readiness',
    assignedTracks: ['Enterprise Closer'],
    status: 'draft',
  },
];

const managedSolutions = [
  { id: 'chatbot', name: 'Chatbot', owner: 'Product', assignedTracks: ['Chatbot Mastery'], status: 'active' },
  { id: 'voicebot', name: 'Voicebot', owner: 'Product', assignedTracks: ['Voicebot Architect'], status: 'active' },
  { id: 'digital-human', name: 'Digital Human', owner: 'Solution', assignedTracks: ['Enterprise Closer'], status: 'active' },
  { id: 'cms', name: 'CMS', owner: 'Product', assignedTracks: [], status: 'draft' },
  { id: 'docsearch', name: 'DocSearch', owner: 'AI Platform', assignedTracks: [], status: 'active' },
];

const managedUsers = [
  {
    id: 'user-pim',
    name: 'Pimnara K.',
    email: 'pim@example.com',
    role: 'manager',
    team: 'SME Team',
    status: 'active',
    lastActive: 'today 09:48',
    badge: 'Voice Architect',
  },
  {
    id: 'user-nara',
    name: 'Nara S.',
    email: 'nara@example.com',
    role: 'admin',
    team: 'Enablement Ops',
    status: 'active',
    lastActive: '2026-05-16',
    badge: 'Playbook Owner',
  },
  {
    id: 'user-may',
    name: 'May T.',
    email: 'may@example.com',
    role: 'sales',
    team: 'Inside Sales',
    status: 'active',
    lastActive: 'today 08:20',
    badge: 'SME Ready',
  },
  {
    id: 'user-korn',
    name: 'Korn W.',
    email: 'korn@example.com',
    role: 'sales',
    team: 'New Hires',
    status: 'inactive',
    lastActive: '2026-04-30',
    badge: 'No badge',
  },
  {
    id: 'user-beam',
    name: 'Beam P.',
    email: 'beam@example.com',
    role: 'manager',
    team: 'Enterprise Team',
    status: 'inactive',
    lastActive: '2026-05-01',
    badge: 'Executive Coach',
  },
] as const;

const securityPolicies = [
  { label: 'Session TTL', value: '8 hours', description: 'access token/session lifetime for web app' },
  { label: 'Idle timeout', value: '30 min', description: 'auto logout after no activity' },
  { label: 'Password policy', value: '12 chars', description: 'minimum length with mixed character classes' },
  { label: 'Audit retention', value: '180 days', description: 'keep admin/security audit events' },
] as const;

const accessPolicies = [
  { role: 'sales', scope: 'own records only', permissions: ['quality.submit', 'training.practice', 'onboarding.view'] },
  { role: 'manager', scope: 'team scope', permissions: ['quality.review', 'training.review', 'onboarding.manage'] },
  { role: 'admin', scope: 'workspace scope', permissions: ['settings.manage', 'playbook.manage', 'user.manage'] },
] as const;

const syncProviders = [
  { provider: 'Turso BM25', key: 'turso_bm25', status: 'ready', sources: 42, latency: '28 ms', lastSync: 'today 09:10' },
  { provider: 'Kotaemon', key: 'kotaemon', status: 'ready', sources: 42, latency: '180 ms', lastSync: 'today 09:05' },
  { provider: 'LEANN', key: 'leann', status: 'ready', sources: 42, latency: '64 ms', lastSync: 'today 09:05' },
] as const;

const syncJobs = [
  { id: 'sync-001', source: 'Q2 SME Revenue Playbook', provider: 'hybrid', status: 'completed', changed: 4, finishedAt: 'today 09:05' },
  { id: 'sync-002', source: 'Competitor Handling', provider: 'kotaemon_leann', status: 'completed', changed: 2, finishedAt: '2026-05-16' },
  { id: 'sync-003', source: 'Pricing matrix import', provider: 'turso_bm25', status: 'queued', changed: 1, finishedAt: 'pending' },
] as const;

const notificationChannels = [
  { channel: 'In-app', key: 'in_app', status: 'enabled', target: 'all users', latency: 'instant' },
  { channel: 'Email', key: 'email', status: 'enabled', target: 'manager/admin', latency: '5 min digest' },
  { channel: 'Webhook', key: 'webhook', status: 'disabled', target: 'external tools', latency: 'near real-time' },
] as const;

const notificationRules = [
  { event: 'Quality review needs manager', audience: 'manager', channel: 'In-app + Email', severity: 'high', status: 'enabled' },
  { event: 'Recording batch completed', audience: 'sales', channel: 'In-app', severity: 'medium', status: 'enabled' },
  { event: 'Onboarding track unlocked', audience: 'sales + manager', channel: 'In-app', severity: 'medium', status: 'enabled' },
  { event: 'Knowledge sync failed', audience: 'admin', channel: 'In-app + Email', severity: 'critical', status: 'enabled' },
  { event: 'Playbook promotion expiring', audience: 'owner', channel: 'Email digest', severity: 'medium', status: 'enabled' },
] as const;

const themeModes = [
  {
    id: 'light',
    title: 'Light',
    description: 'โหมดสว่างสำหรับใช้งานทั่วไปในที่ที่มีแสงสว่างเพียงพอ',
    icon: FiSun,
    sample: ['bg-card', 'bg-secondary', 'bg-primary'],
  },
  {
    id: 'dark',
    title: 'Dark',
    description: 'โหมดมืดสำหรับใช้งานในที่แสงน้อยหรือทำงานนาน',
    icon: FiMoon,
    sample: ['bg-foreground', 'bg-primary', 'bg-success'],
  },
] as const;

export function AdminUsersPage({ view = 'index' }: AdminUsersPageProps) {
  if (view === 'theme') {
    return <ThemeSettingsPage />;
  }

  if (view === 'users-roles') {
    return <UsersRolesSettingsPage />;
  }

  if (view === 'security') {
    return <SecuritySettingsPage />;
  }

  if (view === 'knowledge-sync') {
    return <KnowledgeSyncSettingsPage />;
  }

  if (view === 'notifications') {
    return <NotificationsSettingsPage />;
  }

  if (view === 'track-categories') {
    return <TrackCategoriesSettingsPage />;
  }

  if (view === 'solutions') {
    return <SolutionsSettingsPage />;
  }

  return <SettingsIndexPage />;
}

function UsersRolesSettingsPage() {
  const [editingUser, setEditingUser] = useState<(typeof managedUsers)[number] | null>(null);
  const [deletingUser, setDeletingUser] = useState<(typeof managedUsers)[number] | null>(null);
  const activeUsers = managedUsers.filter((user) => user.status === 'active').length;
  const inactiveUsers = managedUsers.length - activeUsers;

  return (
    <SettingsManagementPage
      eyebrow="Settings · Users & Roles"
      title="Users & Roles"
      description="จัดการผู้ใช้งาน บทบาท ทีม และสถานะใช้งานในระบบ"
      actionLabel="New user"
      icon={FiUsers}
      onCreate={() => setEditingUser(managedUsers[0])}
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total users" value={`${managedUsers.length}`} />
        <MetricCard label="Active" value={`${activeUsers}`} tone="success" />
        <MetricCard label="Inactive" value={`${inactiveUsers}`} tone="muted" />
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>User management</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">รายชื่อผู้ใช้งานพร้อมบทบาท ทีม สถานะ และปุ่มแก้ไข/ลบ</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Team scope</th>
                  <th className="px-4 py-3">Badge</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last active</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {managedUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary ring-2 ring-background">
                          {getInitials(user.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-foreground">{user.name}</span>
                          <span className="mt-1 block truncate text-xs text-muted-foreground">{user.email}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={user.role === 'admin' ? 'warning' : user.role === 'manager' ? 'default' : 'muted'}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.team}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.badge}</td>
                    <td className="px-4 py-3">
                      <Badge tone={user.status === 'active' ? 'success' : 'muted'}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.lastActive}</td>
                    <td className="px-4 py-3 text-right">
                      <RowActionMenu onEdit={() => setEditingUser(user)} onDelete={() => setDeletingUser(user)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingUser && <UserEditModal user={editingUser} onClose={() => setEditingUser(null)} />}
      {deletingUser && (
        <ConfirmDeleteModal
          title="Delete user?"
          description={`ลบ user "${deletingUser.name}" ออกจาก workspace หรือไม่ หากผู้ใช้มีประวัติการฝึกอบรม แนะนำให้ปิดใช้งานแทนการลบถาวร`}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </SettingsManagementPage>
  );
}

function SecuritySettingsPage() {
  return (
    <SettingsManagementPage
      eyebrow="Settings · Security"
      title="Security"
      description="กำหนดนโยบายความปลอดภัย การเข้าถึง และการบันทึกกิจกรรมในระบบ"
      actionLabel="Save policy"
      icon={FiLock}
      onCreate={() => undefined}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {securityPolicies.map((policy) => (
          <MetricCard key={policy.label} label={policy.label} value={policy.value} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Access policy</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">ตารางสิทธิ์การใช้งานตามบทบาทของ Sales, Manager และ Admin</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Scope</th>
                    <th className="px-4 py-3">Permissions</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {accessPolicies.map((policy) => (
                    <tr key={policy.role}>
                      <td className="px-4 py-3">
                        <Badge tone={policy.role === 'admin' ? 'warning' : policy.role === 'manager' ? 'default' : 'muted'}>{policy.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{policy.scope}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {policy.permissions.map((permission) => (
                            <Badge key={permission} tone="muted">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="success">active</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Session controls</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">กำหนด security policy สำหรับองค์กร</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Session TTL">
              <Select defaultValue="8h">
                <option value="4h">4 hours</option>
                <option value="8h">8 hours</option>
                <option value="24h">24 hours</option>
              </Select>
            </Field>
            <Field label="Idle timeout">
              <Select defaultValue="30m">
                <option value="15m">15 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="60m">60 minutes</option>
              </Select>
            </Field>
            <Field label="Failed login lockout">
              <Select defaultValue="5">
                <option value="3">3 attempts</option>
                <option value="5">5 attempts</option>
                <option value="10">10 attempts</option>
              </Select>
            </Field>
            <Field label="Audit retention">
              <Input defaultValue="180 days" />
            </Field>
          </CardContent>
        </Card>
      </section>
    </SettingsManagementPage>
  );
}

function KnowledgeSyncSettingsPage() {
  return (
    <SettingsManagementPage
      eyebrow="Settings · Knowledge Sync"
      title="Knowledge Sync"
      description="ตั้งค่าระบบค้นหาและ AI ที่ใช้ตอบคำถามจากฐานความรู้"
      actionLabel="Run sync"
      icon={FiDatabase}
      onCreate={() => undefined}
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Indexed sources" value="42" tone="success" />
        <MetricCard label="Pending jobs" value="1" />
        <MetricCard label="Failed jobs" value="0" tone="muted" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Provider status</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">ระบบจะซิงค์หน้าความรู้ที่เผยแพร่แล้วเข้าสู่เครื่องมือค้นหาโดยอัตโนมัติ</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Sources</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Last sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {syncProviders.map((provider) => (
                    <tr key={provider.key}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{provider.provider}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{provider.key}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={provider.status === 'ready' ? 'success' : 'warning'}>{provider.status}</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{provider.sources}</td>
                      <td className="px-4 py-3 text-muted-foreground">{provider.latency}</td>
                      <td className="px-4 py-3 text-muted-foreground">{provider.lastSync}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Sync policy</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">เลือกวิธีการค้นหาข้อมูลสำหรับฟีเจอร์ Ask และการฝึกซ้อม</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Default retrieval">
              <Select defaultValue="hybrid">
                <option value="turso_bm25">Turso BM25</option>
                <option value="kotaemon_leann">Kotaemon + LEANN</option>
                <option value="hybrid">Hybrid</option>
              </Select>
            </Field>
            <Field label="Sync trigger">
              <Select defaultValue="publish">
                <option value="publish">On page publish</option>
                <option value="manual">Manual only</option>
                <option value="schedule">Scheduled batch</option>
              </Select>
            </Field>
            <Field label="Kotaemon endpoint">
              <Input defaultValue="http://kotaemon.local:7860" />
            </Field>
            <Field label="LEANN index">
              <Input defaultValue="pitchsmith-knowledge-local" />
            </Field>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Recent sync jobs</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">รายการงานซิงค์และผลลัพธ์ที่ใช้อ้างอิงในคำตอบของ AI</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Changed</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Finished</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {syncJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{job.source}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{job.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{job.provider}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{job.changed}</td>
                    <td className="px-4 py-3">
                      <Badge tone={job.status === 'completed' ? 'success' : 'warning'}>{job.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{job.finishedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SettingsManagementPage>
  );
}

function NotificationsSettingsPage() {
  return (
    <SettingsManagementPage
      eyebrow="Settings · Notifications"
      title="Notifications"
      description="ควบคุม alert สำหรับ quality review, onboarding, playbook expiry และ knowledge sync"
      actionLabel="Save rules"
      icon={FiBell}
      onCreate={() => undefined}
    >
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Enabled rules" value={`${notificationRules.filter((rule) => rule.status === 'enabled').length}`} tone="success" />
        <MetricCard label="Channels" value={`${notificationChannels.length}`} />
        <MetricCard label="Critical alerts" value={`${notificationRules.filter((rule) => rule.severity === 'critical').length}`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Notification rules</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">กำหนดเหตุการณ์ กลุ่มผู้รับ ช่องทาง และระดับความสำคัญของการแจ้งเตือน</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Audience</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {notificationRules.map((rule) => (
                    <tr key={rule.event}>
                      <td className="px-4 py-3 font-semibold text-foreground">{rule.event}</td>
                      <td className="px-4 py-3 text-muted-foreground">{rule.audience}</td>
                      <td className="px-4 py-3 text-muted-foreground">{rule.channel}</td>
                      <td className="px-4 py-3">
                        <Badge tone={rule.severity === 'critical' ? 'warning' : rule.severity === 'high' ? 'default' : 'muted'}>{rule.severity}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="success">{rule.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Delivery policy</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">ตั้งค่าการส่งแจ้งเตือนแบบสรุป ช่วงเวลาเงียบ และการส่งซ้ำ</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Default digest">
              <Select defaultValue="5m">
                <option value="instant">Instant</option>
                <option value="5m">5 minute digest</option>
                <option value="daily">Daily digest</option>
              </Select>
            </Field>
            <Field label="Quiet hours">
              <Input defaultValue="20:00-08:00 Asia/Bangkok" />
            </Field>
            <Field label="Retry attempts">
              <Select defaultValue="3">
                <option value="1">1 retry</option>
                <option value="3">3 retries</option>
                <option value="5">5 retries</option>
              </Select>
            </Field>
            <Field label="Webhook URL">
              <Input defaultValue="https://example.com/pitchsmith/webhook" />
            </Field>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">ช่องทางการส่งการแจ้งเตือนที่ระบบรองรับ</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {notificationChannels.map((channel) => (
            <div key={channel.key} className="rounded-lg border border-border bg-background/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{channel.channel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{channel.key}</p>
                </div>
                <Badge tone={channel.status === 'enabled' ? 'success' : 'muted'}>{channel.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{channel.target}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{channel.latency}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </SettingsManagementPage>
  );
}

function SettingsIndexPage() {
  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <header className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">ตั้งค่าระบบ Pitchsmith</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          เลือกหมวด setting เพื่อจัดการ theme, role, security, knowledge sync และ notification ของ platform
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settingsItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="group grid min-w-0 gap-4 rounded-lg border border-border bg-card p-5 shadow-panel transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <Badge tone={item.status === 'active' ? 'success' : item.status === 'preview' ? 'default' : 'muted'}>{item.status}</Badge>
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Open
              <FiChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}

function TrackCategoriesSettingsPage() {
  const [editingCategory, setEditingCategory] = useState<(typeof managedTrackCategories)[number] | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<(typeof managedTrackCategories)[number] | null>(null);

  return (
    <SettingsManagementPage
      eyebrow="Settings · Track Categories"
      title="Track Categories"
      description="จัดหมวดหมู่ onboarding track เพื่อให้ filter, reporting และ assignment เห็นภาพชัดขึ้น"
      actionLabel="New category"
      icon={FiTag}
      onCreate={() => setEditingCategory(managedTrackCategories[0])}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Category management</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">แต่ละ category แสดง track ที่ assign อยู่ และมี row action สำหรับ edit/delete</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Assigned tracks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {managedTrackCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{category.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{category.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{category.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {category.assignedTracks.length > 0 ? (
                          category.assignedTracks.map((track) => (
                            <Badge key={track} tone="muted">
                              {track}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No track assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={category.status === 'published' ? 'success' : 'muted'}>{category.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowActionMenu onEdit={() => setEditingCategory(category)} onDelete={() => setDeletingCategory(category)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingCategory && (
        <CategoryEditModal category={editingCategory} onClose={() => setEditingCategory(null)} />
      )}
      {deletingCategory && (
        <ConfirmDeleteModal
          title="Delete track category?"
          description={`ลบ category "${deletingCategory.name}" ออกจาก workspace หรือไม่ หากยังมีหลักสูตรที่ผูกกับหมวดหมู่นี้อยู่ ระบบจะไม่อนุญาตให้ลบ`}
          onClose={() => setDeletingCategory(null)}
        />
      )}
    </SettingsManagementPage>
  );
}

function SolutionsSettingsPage() {
  const [editingSolution, setEditingSolution] = useState<(typeof managedSolutions)[number] | null>(null);
  const [deletingSolution, setDeletingSolution] = useState<(typeof managedSolutions)[number] | null>(null);

  return (
    <SettingsManagementPage
      eyebrow="Settings · Solutions"
      title="Solutions"
      description="ตั้งค่า solution catalog ที่ใช้ filter track, assign category และทำ reporting readiness"
      actionLabel="New solution"
      icon={FiPackage}
      onCreate={() => setEditingSolution(managedSolutions[0])}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Solution catalog</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">default solution: Chatbot, Voicebot, Digital Human, CMS และ DocSearch</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Solution</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Assigned tracks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {managedSolutions.map((solution) => (
                  <tr key={solution.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{solution.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{solution.id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{solution.owner}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {solution.assignedTracks.length > 0 ? (
                          solution.assignedTracks.map((track) => (
                            <Badge key={track} tone="muted">
                              {track}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No track assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={solution.status === 'active' ? 'success' : 'muted'}>{solution.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowActionMenu onEdit={() => setEditingSolution(solution)} onDelete={() => setDeletingSolution(solution)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingSolution && <SolutionEditModal solution={editingSolution} onClose={() => setEditingSolution(null)} />}
      {deletingSolution && (
        <ConfirmDeleteModal
          title="Delete solution?"
          description={`ลบ solution "${deletingSolution.name}" ออกจาก workspace หรือไม่ หากยังมีหลักสูตรที่ใช้สินค้านี้อยู่ กรุณาย้ายหลักสูตรไปยังสินค้าอื่นก่อน`}
          onClose={() => setDeletingSolution(null)}
        />
      )}
    </SettingsManagementPage>
  );
}

function SettingsManagementPage({
  eyebrow,
  title,
  description,
  actionLabel,
  icon: Icon,
  onCreate,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: typeof FiTag;
  onCreate: () => void;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <header className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-panel lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={routes.settings}>
            <Button type="button" variant="secondary">
              <FiSettings className="h-4 w-4" />
              All settings
            </Button>
          </Link>
          <Button type="button" onClick={onCreate}>
            <Icon className="h-4 w-4" />
            {actionLabel}
          </Button>
        </div>
      </header>
      {children}
    </main>
  );
}

function RowActionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex justify-end">
      <Button
        type="button"
        variant="ghost"
        className="h-9 w-9 p-0"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open row actions"
      >
        <FiMoreVertical className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-10 z-10 grid min-w-36 gap-1 rounded-lg border border-border bg-card p-1 shadow-panel">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-secondary"
          >
            <FiEdit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-destructive hover:bg-destructive/10"
          >
            <FiTrash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function UserEditModal({ user, onClose }: { user: (typeof managedUsers)[number]; onClose: () => void }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          className="grid w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <ModalHeader title="Edit user" eyebrow="Settings · Users & Roles" onClose={onClose} />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Full name">
              <Input defaultValue={user.name} />
            </Field>
            <Field label="Email">
              <Input defaultValue={user.email} />
            </Field>
            <Field label="Role">
              <Select defaultValue={user.role}>
                <option value="sales">sales</option>
                <option value="manager">manager</option>
                <option value="admin">admin</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select defaultValue={user.status}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </Select>
            </Field>
            <Field label="Team scope">
              <Input defaultValue={user.team} />
            </Field>
            <Field label="Highest badge">
              <Input defaultValue={user.badge} />
            </Field>
            <div className="rounded-lg border border-border bg-background/70 p-3 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">ข้อมูลอ้างอิง</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                ข้อมูลผู้ใช้นี้เชื่อมต่อกับโปรไฟล์ Sales ทีม สิทธิ์การใช้งาน และข้อมูลหน้าจอหลัก
              </p>
            </div>
          </div>
          <ModalFooter onClose={onClose} primaryLabel="Save user" />
        </div>
      </div>
    </Portal>
  );
}

function CategoryEditModal({ category, onClose }: { category: (typeof managedTrackCategories)[number]; onClose: () => void }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          className="grid w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <ModalHeader title="Edit track category" eyebrow="Settings" onClose={onClose} />
          <div className="grid gap-4 p-5">
            <Field label="Category name">
              <Input defaultValue={category.name} />
            </Field>
            <Field label="Description">
              <Input defaultValue={category.description} />
            </Field>
            <Field label="Status">
              <Select defaultValue={category.status}>
                <option value="published">published</option>
                <option value="draft">draft</option>
              </Select>
            </Field>
            <div className="rounded-lg border border-border bg-background/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Assigned tracks</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {category.assignedTracks.map((track) => (
                  <Badge key={track} tone="muted">
                    {track}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <ModalFooter onClose={onClose} primaryLabel="Save category" />
        </div>
      </div>
    </Portal>
  );
}

function SolutionEditModal({ solution, onClose }: { solution: (typeof managedSolutions)[number]; onClose: () => void }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          className="grid w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <ModalHeader title="Edit solution" eyebrow="Settings" onClose={onClose} />
          <div className="grid gap-4 p-5">
            <Field label="Solution name">
              <Input defaultValue={solution.name} />
            </Field>
            <Field label="Owner">
              <Input defaultValue={solution.owner} />
            </Field>
            <Field label="Status">
              <Select defaultValue={solution.status}>
                <option value="active">active</option>
                <option value="draft">draft</option>
              </Select>
            </Field>
            <div className="rounded-lg border border-border bg-background/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Assigned tracks</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {solution.assignedTracks.length > 0 ? (
                  solution.assignedTracks.map((track) => (
                    <Badge key={track} tone="muted">
                      {track}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No track assigned</span>
                )}
              </div>
            </div>
          </div>
          <ModalFooter onClose={onClose} primaryLabel="Save solution" />
        </div>
      </div>
    </Portal>
  );
}

function ConfirmDeleteModal({ title, description, onClose }: { title: string; description: string; onClose: () => void }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          className="grid w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <ModalHeader title={title} eyebrow="Confirm delete" onClose={onClose} />
          <div className="p-5">
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              No
            </Button>
            <Button type="button" variant="destructive" onClick={onClose}>
              Yes, delete
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function ModalHeader({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close modal">
        <FiX className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ModalFooter({ primaryLabel, onClose }: { primaryLabel: string; onClose: () => void }) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
      <Button type="button" variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button type="button" onClick={onClose}>
        <FiCheck className="h-4 w-4" />
        {primaryLabel}
      </Button>
    </div>
  );
}

function MetricCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'muted' }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        <span
          className={[
            'h-2.5 w-2.5 rounded-full',
            tone === 'success' ? 'bg-success' : tone === 'muted' ? 'bg-muted-foreground/40' : 'bg-primary',
          ].join(' ')}
        />
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ThemeSettingsPage() {
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(() => getStoredTheme());

  const selectTheme = (mode: ThemeMode) => {
    setSelectedMode(mode);
    applyTheme(mode);
  };

  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <header className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-panel lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Settings · Theme</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">Theme</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            เลือกรูปแบบสีสำหรับ Pitchsmith ที่ใช้ทั่วทั้งแอปพลิเคชัน
          </p>
        </div>
        <Link to={routes.settings}>
          <Button type="button" variant="secondary">
            <FiSettings className="h-4 w-4" />
            All settings
          </Button>
        </Link>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        {themeModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => selectTheme(mode.id)}
            className={[
              'grid min-w-0 gap-5 rounded-lg border bg-card p-5 text-left shadow-panel transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selectedMode === mode.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-secondary text-primary">
                <mode.icon className="h-6 w-6" />
              </span>
              {selectedMode === mode.id ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-success/24 bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
                  <FiCheck className="h-3.5 w-3.5" />
                  selected
                </span>
              ) : (
                <Badge tone="muted">available</Badge>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{mode.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{mode.description}</p>
            </div>
            <div className="grid gap-3 rounded-lg border border-border bg-background/70 p-4">
              <div className={['h-20 rounded-lg border border-border', mode.id === 'dark' ? 'bg-foreground' : 'bg-background'].join(' ')}>
                <div className="grid h-full grid-cols-3 gap-2 p-3">
                  {mode.sample.map((className) => (
                    <span key={`${mode.id}-${className}`} className={['rounded-md shadow-sm', className].join(' ')} />
                  ))}
                </div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground">
                {selectedMode === mode.id ? 'Currently applied across app' : 'Available token set'}
              </p>
            </div>
          </button>
        ))}
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Theme tokens</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">ตัวอย่างสีที่ใช้ในระบบ</p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Primary', 'bg-primary'],
            ['Secondary', 'bg-secondary'],
            ['Success', 'bg-success'],
            ['Card', 'bg-card'],
          ].map(([label, className]) => (
            <div key={label} className="rounded-lg border border-border bg-background/70 p-3">
              <div className={['h-10 rounded-md border border-border', className].join(' ')} />
              <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{className}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

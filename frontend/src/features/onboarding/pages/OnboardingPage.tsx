import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiEdit2,
  FiLayers,
  FiPlus,
  FiPlayCircle,
  FiTarget,
  FiX,
} from 'react-icons/fi';
import { buildPath } from '../../../app/routes';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Input, Select } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import {
  badgeAchievements,
  badges,
  solutionOptions,
  topicMeta,
  trackCategories,
  trackLevelLabels,
  tracks,
  type OnboardingTab,
  type OnboardingTrack,
  type TrackCategoryId,
  type TrackDetailTab,
  type TrackTopic,
} from '../mock-data';
import { TrackLibrary } from '../components/TrackLibrary';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { trackId, managementTrackId } = useParams<{ trackId?: string; managementTrackId?: string }>();
  const [activeTab, setActiveTab] = useState<OnboardingTab>('track');
  const activeTrack = tracks.find((track) => track.id === trackId || track.id === managementTrackId) ?? tracks[0];

  if (trackId) {
    return <TrackDetail track={activeTrack} onBack={() => navigate('/app/onboarding/me')} />;
  }

  if (managementTrackId) {
    return <TrackEditor track={activeTrack} onBack={() => navigate('/app/onboarding/me')} />;
  }

  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Onboarding Tracks</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">เลือก Specialty Track เพื่อปั้น Sales ให้พร้อมขาย</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              รวม topic จาก company solution, standard, course, external view, audio response และ Senario ไว้ใน track เดียว
              เมื่อ sales complete ตาม threshold จะได้รับ badge สำหรับ readiness
            </p>
          </div>
          <Button type="button" onClick={() => navigate(buildPath.onboardingTrack({ trackId: tracks[0].id }))}>
            <FiPlayCircle className="h-4 w-4" />
            Continue track
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card p-1">
        {[
          { id: 'track' as const, label: 'Track', icon: FiTarget },
          { id: 'management' as const, label: 'Track Management', icon: FiLayers },
          { id: 'badge' as const, label: 'Badge', icon: FiAward },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition',
              activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ].join(' ')}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'track' && <TrackLibrary onOpenTrack={(id) => navigate(buildPath.onboardingTrack({ trackId: id }))} />}
      {activeTab === 'management' && (
        <TrackManagement onEditTrack={(id) => navigate(buildPath.onboardingTrackManagement({ managementTrackId: id }))} />
      )}
      {activeTab === 'badge' && <BadgeLibrary onOpenTrack={(id) => navigate(buildPath.onboardingTrack({ trackId: id }))} />}
    </main>
  );
}

function TrackManagement({ onEditTrack }: { onEditTrack: (trackId: string) => void }) {
  const [newTrackOpen, setNewTrackOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Track Management</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">จัดการ track, topic, linked Senario และ badge threshold</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => setNewTrackOpen(true)}>
            <FiTarget className="h-4 w-4" />
            New track
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Track</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Solution</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Topics</th>
                  <th className="px-4 py-3">Scenario link</th>
                  <th className="px-4 py-3">Badge rule</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {tracks.map((track) => (
                  <tr key={track.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{track.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{track.specialty}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="muted">{getTrackCategoryLabel(track.categoryId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{track.solutionKey}</td>
                    <td className="px-4 py-3 text-muted-foreground">{trackLevelLabels[track.level]}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{track.topics.length}</td>
                    <td className="px-4 py-3 text-muted-foreground">{track.topics.filter((topic) => topic.type === 'scenario').length} Senario</td>
                    <td className="px-4 py-3 text-muted-foreground">{track.badgeThreshold}% complete</td>
                    <td className="px-4 py-3">
                      <Badge tone={track.status === 'published' ? 'success' : 'muted'}>{track.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button type="button" variant="secondary" onClick={() => onEditTrack(track.id)}>
                        <FiEdit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {newTrackOpen && <NewTrackModal onClose={() => setNewTrackOpen(false)} />}
    </>
  );
}

function NewTrackModal({ onClose }: { onClose: () => void }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-track-title"
          className="grid max-h-[92vh] w-full max-w-4xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Track Management</p>
              <h2 id="new-track-title" className="mt-1 text-xl font-semibold text-foreground">
                New track
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">สร้าง learning path จาก topics, Senario และ badge rule ก่อน publish ให้ sales team</p>
            </div>
            <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close new track modal">
              <FiX className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid min-h-0 gap-5 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid min-w-0 gap-4">
              <section className="grid gap-4 rounded-lg border border-border bg-background/60 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Track name">
                    <Input defaultValue="SME Sales Foundation" />
                  </Field>
                  <Field label="Status">
                    <Select defaultValue="draft">
                      <option value="draft">draft</option>
                      <option value="published">published</option>
                    </Select>
                  </Field>
                  <Field label="Company solution">
                    <Select defaultValue="Chatbot">
                      {solutionOptions.map((solution) => (
                        <option key={solution} value={solution}>
                          {solution}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Specialty">
                    <Input defaultValue="SME onboarding and pitch readiness" />
                  </Field>
                  <Field label="Track category">
                    <Select defaultValue="foundation">
                      {trackCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Level">
                    <Select defaultValue="beginner">
                      {Object.entries(trackLevelLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    className="min-h-24 rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                    defaultValue="รวม product knowledge, sales standard, audio response และ Senario เพื่อให้ sales พร้อมคุยกับร้านค้า SME"
                  />
                </Field>
              </section>

              <section className="grid gap-4 rounded-lg border border-border bg-background/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">Starter topics</h3>
                    <p className="mt-1 text-sm text-muted-foreground">mock topic แรก ๆ ที่ระบบจะสร้างให้ใน track</p>
                  </div>
                  <Button type="button" variant="secondary" className="h-9">
                    <FiPlus className="h-4 w-4" />
                    Add topic
                  </Button>
                </div>

                {[
                  { title: 'อ่าน Q2 SME Revenue Playbook', type: 'knowledge', source: 'Knowledge / Sales Playbooks' },
                  { title: 'ตอบ audio prompt เรื่อง budget truth', type: 'audio_response', source: 'AI audio prompt' },
                  { title: 'จบ Senario: Q2 Promotion Discovery', type: 'scenario', source: 'Senario / vr-001' },
                ].map((topic, index) => (
                  <div key={topic.title} className="grid gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-[auto_minmax(0,1fr)_180px] md:items-center">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{index + 1}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{topic.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{topic.source}</p>
                    </div>
                    <Select defaultValue={topic.type}>
                      <option value="knowledge">knowledge</option>
                      <option value="external">external</option>
                      <option value="audio_response">audio_response</option>
                      <option value="scenario">scenario</option>
                    </Select>
                  </div>
                ))}
              </section>
            </div>

            <aside className="grid min-w-0 content-start gap-4">
              <section className="grid gap-3 rounded-lg border border-border bg-background/60 p-4">
                <h3 className="font-semibold text-foreground">Badge rule</h3>
                <Field label="Threshold">
                  <Input defaultValue="80" />
                </Field>
                <Field label="Award badge">
                  <Input defaultValue="SME Ready" />
                </Field>
                <p className="text-xs leading-5 text-muted-foreground">
                  Badge จะ unlock เมื่อ sales complete topics ตาม threshold และ linked Senario ผ่าน score ที่กำหนด
                </p>
              </section>

              <section className="grid gap-3 rounded-lg border border-border bg-background/60 p-4">
                <h3 className="font-semibold text-foreground">Preview</h3>
                <div className="grid gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-success/30 bg-success/12 text-success">
                    <FiAward className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">SME Sales Foundation</p>
                    <p className="mt-1 text-xs text-muted-foreground">3 starter topics · 1 linked Senario</p>
                  </div>
                  <ProgressBar value={0} label="0% complete" />
                </div>
              </section>
            </aside>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={onClose}>
              <FiCheckCircle className="h-4 w-4" />
              Create draft track
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function BadgeLibrary({ onOpenTrack }: { onOpenTrack: (trackId: string) => void }) {
  const [newBadgeOpen, setNewBadgeOpen] = useState(false);
  const assignedTrackCount = new Set(badges.map((badge) => badge.trackId)).size;

  return (
    <>
      <section className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Badge templates" value={badges.length.toString()} />
          <Metric label="Assigned tracks" value={assignedTrackCount.toString()} />
          <Metric label="Earned badges" value={badges.filter((badge) => badge.status === 'earned').length.toString()} tone="success" />
          <Metric label="Default expiry" value="6 mo" tone="warning" />
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Badge Management</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">สร้าง badge, assign เข้า track และกำหนด rule สำหรับ unlock readiness</p>
            </div>
            <Button type="button" onClick={() => setNewBadgeOpen(true)}>
              <FiPlus className="h-4 w-4" />
              New badge
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Badge</th>
                    <th className="px-4 py-3">Assigned track</th>
                    <th className="px-4 py-3">Unlock rule</th>
                    <th className="px-4 py-3">Validity</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {badges.map((badge) => {
                    const track = tracks.find((item) => item.id === badge.trackId) ?? tracks[0];
                    const earned = badge.status === 'earned';

                    return (
                      <tr key={badge.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={[
                                'grid h-10 w-10 place-items-center rounded-full border',
                                earned ? 'border-success/30 bg-success/12 text-success' : 'border-border bg-muted text-muted-foreground',
                              ].join(' ')}
                            >
                              <FiAward className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{badge.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">template id: {badge.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{track.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{track.solution}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{badge.requirement}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{badge.expiresInMonths} months</td>
                        <td className="px-4 py-3">
                          <ProgressBar value={badge.progress} label={`${badge.progress}% / ${track.badgeThreshold}%`} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={earned ? 'success' : 'muted'}>{earned ? 'earned' : 'locked'}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button type="button" variant="secondary" onClick={() => onOpenTrack(track.id)}>
                            Open track
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {badges.map((badge) => {
            const track = tracks.find((item) => item.id === badge.trackId) ?? tracks[0];
            const earned = badge.status === 'earned';

            return (
              <Card key={badge.id} className="overflow-hidden">
                <CardContent className="grid gap-4">
                  <div className={['mx-auto grid h-24 w-24 place-items-center rounded-full border shadow-sm', earned ? 'border-success/30 bg-success/12 text-success' : 'border-border bg-muted text-muted-foreground'].join(' ')}>
                    <FiAward className="h-10 w-10" />
                  </div>
                  <div className="text-center">
                    <Badge tone={earned ? 'success' : 'muted'}>{earned ? 'earned' : 'locked'}</Badge>
                    <h2 className="mt-3 text-xl font-semibold text-foreground">{badge.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{badge.requirement}</p>
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">assigned to {track.title} · expires in {badge.expiresInMonths} months</p>
                  </div>
                  <ProgressBar value={badge.progress} label={`${badge.progress}% / ${track.badgeThreshold}% required`} />
                  <Button type="button" variant={earned ? 'secondary' : 'primary'} onClick={() => onOpenTrack(track.id)}>
                    Open track
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </section>

      {newBadgeOpen && <NewBadgeModal onClose={() => setNewBadgeOpen(false)} />}
    </>
  );
}

function NewBadgeModal({ onClose }: { onClose: () => void }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-badge-title"
          className="grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Badge Management</p>
              <h2 id="new-badge-title" className="mt-1 text-xl font-semibold text-foreground">
                New badge
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">สร้าง badge template แล้ว assign เข้า track เพื่อใช้ unlock readiness ของ sales</p>
            </div>
            <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close new badge modal">
              <FiX className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-5 overflow-y-auto p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
            <section className="grid min-w-0 gap-4 rounded-lg border border-border bg-background/60 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Badge name">
                  <Input defaultValue="SME Pitch Certified" />
                </Field>
                <Field label="Assign to track">
                  <Select defaultValue={tracks[0].id}>
                    {tracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.title}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Unlock threshold">
                  <Input defaultValue="80" />
                </Field>
                <Field label="Expires after">
                  <Select defaultValue="6">
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                  </Select>
                </Field>
              </div>
              <Field label="Requirement">
                <textarea
                  className="min-h-24 rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  defaultValue="Complete 80% of track topics and pass linked Senario score threshold."
                />
              </Field>
            </section>

            <aside className="grid min-w-0 content-start gap-4">
              <section className="grid justify-items-center gap-3 rounded-lg border border-border bg-background/60 p-4 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full border border-success/30 bg-success/12 text-success">
                  <FiAward className="h-9 w-9" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">SME Pitch Certified</p>
                  <p className="mt-1 text-xs text-muted-foreground">Assigned to Chatbot Mastery</p>
                </div>
                <Badge tone="warning">expires in 6 months</Badge>
              </section>
              <section className="rounded-lg border border-border bg-background/60 p-4">
                <h3 className="font-semibold text-foreground">Rule preview</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Badge จะออกให้เมื่อ track progress ถึง threshold และ expiry date จะถูก set อัตโนมัติ 6 เดือนหลัง issued date
                </p>
              </section>
            </aside>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={onClose}>
              <FiCheckCircle className="h-4 w-4" />
              Create badge
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function TrackDetail({ track, onBack }: { track: OnboardingTrack; onBack: () => void }) {
  const [activeDetailTab, setActiveDetailTab] = useState<TrackDetailTab>('topics');
  const completedCount = track.topics.filter((topic) => topic.status === 'completed').length;
  const scenarioCount = track.topics.filter((topic) => topic.type === 'scenario').length;
  const achievements = badgeAchievements.filter((achievement) => achievement.trackId === track.id);
  const activeAchievements = achievements.filter((achievement) => achievement.status === 'active').length;
  const expiringAchievements = achievements.filter((achievement) => achievement.status === 'expiring').length;
  const earned = track.progress >= track.badgeThreshold;

  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          ← Back to Onboard
        </button>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Track Detail</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">{track.title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{track.description}</p>
          </div>
          <Badge tone={earned ? 'success' : 'warning'}>{earned ? 'badge unlocked' : `${track.badgeThreshold}% to badge`}</Badge>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-1">
        {[
          { id: 'topics' as const, label: 'Topics', icon: FiBookOpen },
          { id: 'achievement' as const, label: 'Achievement', icon: FiAward },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveDetailTab(tab.id)}
            className={[
              'inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition',
              activeDetailTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            ].join(' ')}
          >
            <tab.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="grid min-w-0 gap-5">
          {activeDetailTab === 'topics' ? (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Topics in track</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">complete topic จาก knowledge, external, audio response และ Senario เพื่อรับ badge</p>
              </CardHeader>
              <CardContent className="grid gap-3">
                {track.topics.map((topic, index) => (
                  <TopicCard key={topic.id} topic={topic} index={index + 1} />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Achievement</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  รายชื่อ sales ที่ได้รับ badge จาก track นี้ โดย badge มีอายุ 6 เดือนและต้อง re-certify หลังหมดอายุ
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <SmallStat label="Issued badges" value={achievements.length.toString()} />
                  <SmallStat label="Active" value={activeAchievements.toString()} />
                  <SmallStat label="Expiring soon" value={expiringAchievements.toString()} />
                  <SmallStat label="Validity" value="6 months" />
                </div>

                {achievements.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                      <thead className="bg-muted text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3">Sales</th>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Issued</th>
                          <th className="px-4 py-3">Expires</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {achievements.map((achievement) => (
                          <tr key={achievement.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                                  {achievement.userName
                                    .split(' ')
                                    .map((part) => part[0])
                                    .join('')
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">{achievement.userName}</p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{achievement.role}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-foreground">{achievement.progress}/100</td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(achievement.issuedAt)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{formatDate(achievement.expiresAt)}</td>
                            <td className="px-4 py-3">
                              <Badge tone={achievement.status === 'active' ? 'success' : achievement.status === 'expiring' ? 'warning' : 'danger'}>
                                {achievement.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center">
                    <div>
                      <FiAward className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-3 font-semibold text-foreground">ยังไม่มีคนได้รับ badge นี้</p>
                      <p className="mt-1 text-sm text-muted-foreground">เมื่อ sales complete ตาม threshold รายชื่อจะขึ้นใน achievement tab</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="grid min-w-0 gap-5">
          <Card>
            <CardContent className="grid gap-4">
              <ProgressBar value={track.progress} label={`${track.progress}% complete`} />
              <div className="grid grid-cols-2 gap-3">
                <SmallStat label="Completed" value={`${completedCount}/${track.topics.length}`} />
                <SmallStat label="Linked Senario" value={scenarioCount.toString()} />
                <SmallStat label="Assigned" value={track.assignedSales.toString()} />
                <SmallStat label="Badge rule" value={`${track.badgeThreshold}%`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge reward</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid h-20 w-20 place-items-center rounded-full border border-success/30 bg-success/12 text-success">
                <FiAward className="h-9 w-9" />
              </div>
              <p className="text-sm font-semibold text-foreground">{track.title} Badge</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Sales จะได้รับ badge เมื่อ complete topic อย่างน้อย {track.badgeThreshold}% โดย topic แบบ Senario จะ complete อัตโนมัติเมื่อ session ผ่าน score ที่กำหนด
                badge มีอายุ 6 เดือนนับจากวันที่ออก และต้องต่ออายุเพื่อคงสถานะ readiness
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function TrackEditor({ track, onBack }: { track: OnboardingTrack; onBack: () => void }) {
  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          ← Back to Onboard
        </button>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Track Management</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground md:text-3xl">Edit {track.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">mock editor สำหรับจัด topic, rule และ badge threshold</p>
          </div>
          <Button type="button">
            <FiCheckCircle className="h-4 w-4" />
            Save draft
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Track detail</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Track name">
                <Input defaultValue={track.title} />
              </Field>
              <Field label="Status">
                <Select defaultValue={track.status}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </Select>
              </Field>
              <Field label="Company solution">
                <Select defaultValue={track.solutionKey}>
                  {solutionOptions.map((solution) => (
                    <option key={solution} value={solution}>
                      {solution}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Badge threshold">
                <Input defaultValue={`${track.badgeThreshold}`} />
              </Field>
              <Field label="Track category">
                <Select defaultValue={track.categoryId}>
                  {trackCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Level">
                <Select defaultValue={track.level}>
                  {Object.entries(trackLevelLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className="min-h-24 rounded-lg border border-input bg-white px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                defaultValue={track.description}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion rule</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>Track progress คำนวณจาก topic ที่ complete แล้วเทียบกับ topic ทั้งหมด</p>
            <p>ถ้า topic type เป็น Senario ระบบจะฟัง event จาก Senario session แล้ว mark complete เมื่อ score ผ่าน required score</p>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Topics</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">จัดลำดับด้วย Index แล้วผูก source หรือ Senario ที่เกี่ยวข้อง</p>
          </div>
          <Button type="button" variant="secondary">
            Add topic
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3">
          {track.topics.map((topic, index) => (
            <div key={topic.id} className="grid gap-3 rounded-lg border border-border bg-background/70 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Topic {index + 1}</p>
                  <p className="mt-1 text-base font-semibold text-foreground">{topic.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{topic.description}</p>
                </div>
                <Badge tone={topic.status === 'completed' ? 'success' : topic.status === 'locked' ? 'muted' : 'warning'}>{topic.status}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(88px,0.45fr)_repeat(4,minmax(0,1fr))]">
                <Field label="Index">
                  <Input type="number" min={1} defaultValue={`${topic.sortIndex}`} />
                </Field>
                <Field label="Type">
                  <Select defaultValue={topic.type}>
                    <option value="knowledge">knowledge</option>
                    <option value="external">external</option>
                    <option value="audio_response">audio_response</option>
                    <option value="scenario">scenario</option>
                  </Select>
                </Field>
                <Field label="Source">
                  <Input defaultValue={topic.source} />
                </Field>
                <Field label="Required score">
                  <Input defaultValue={topic.requiredScore ? `${topic.requiredScore}` : '-'} />
                </Field>
                <Field label="Scenario id">
                  <Input defaultValue={topic.scenarioId ?? '-'} />
                </Field>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

function TopicCard({ topic, index }: { topic: TrackTopic; index: number }) {
  const meta = topicMeta[topic.type];

  return (
    <article className="grid gap-3 rounded-lg border border-border bg-background/70 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{index}</div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={['inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', meta.tone].join(' ')}>
            <meta.icon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
          <Badge tone={topic.status === 'completed' ? 'success' : topic.status === 'locked' ? 'muted' : 'warning'}>{topic.status}</Badge>
        </div>
        <h3 className="mt-3 text-base font-semibold text-foreground">{topic.title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{topic.description}</p>
        <p className="mt-2 text-xs font-semibold text-muted-foreground">{topic.source}</p>
      </div>
      <Button type="button" variant="secondary" className="md:w-auto">
        {topic.type === 'scenario' ? 'Open Senario' : topic.type === 'audio_response' ? 'Start response' : 'Open topic'}
      </Button>
    </article>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' }) {
  const dot = tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : 'bg-primary';

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <span className={['mt-1 h-2.5 w-2.5 rounded-full', dot].join(' ')} />
      </CardContent>
    </Card>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 p-3">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function getTrackCategoryLabel(categoryId: TrackCategoryId) {
  return trackCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

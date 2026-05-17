import { useState } from 'react';
import { FiAward, FiChevronRight } from 'react-icons/fi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Select } from '../../../components/ui/Field';
import {
  badges,
  solutionOptions,
  trackCategories,
  trackLevelLabels,
  tracks,
  type TrackCategoryId,
  type TrackLevel,
} from '../mock-data';

type TrackLibraryProps = {
  onOpenTrack: (trackId: string) => void;
};

export function TrackLibrary({ onOpenTrack }: TrackLibraryProps) {
  const [categoryFilter, setCategoryFilter] = useState<'all' | TrackCategoryId>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | TrackLevel>('all');
  const [solutionFilter, setSolutionFilter] = useState<'all' | string>('all');
  const filteredTracks = tracks.filter((track) => {
    const categoryMatched = categoryFilter === 'all' || track.categoryId === categoryFilter;
    const levelMatched = levelFilter === 'all' || track.level === levelFilter;
    const solutionMatched = solutionFilter === 'all' || track.solutionKey === solutionFilter;

    return categoryMatched && levelMatched && solutionMatched;
  });
  const rankedTracks = [...filteredTracks].sort((left, right) => right.progress - left.progress);

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TrackMetric label="Active tracks" value={tracks.length.toString()} />
        <TrackMetric label="Avg completion" value="68%" tone="warning" />
        <TrackMetric label="Badges earned" value={badges.filter((badge) => badge.status === 'earned').length.toString()} tone="success" />
        <TrackMetric label="Linked Senarios" value="5" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Track Ranking</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">current completion ของแต่ละ track เพื่อดูว่า sales team คืบหน้าตรงไหน</p>
          </div>
          <Badge tone="default">updated mock</Badge>
        </CardHeader>
        <CardContent className="grid max-h-80 gap-3 overflow-y-auto pr-1">
          {rankedTracks.map((track, index) => {
            const earned = track.progress >= track.badgeThreshold;

            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onOpenTrack(track.id)}
                className="grid min-w-0 gap-3 rounded-lg border border-border bg-background/70 p-3 text-left transition hover:border-primary/40 hover:bg-secondary/20 md:grid-cols-[48px_minmax(0,1fr)_160px_120px] md:items-center"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                  #{index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{track.title}</p>
                    <Badge tone={earned ? 'success' : 'warning'}>{earned ? 'badge ready' : `${track.badgeThreshold}% target`}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getTrackCategoryLabel(track.categoryId)} · {trackLevelLabels[track.level]} · {track.assignedSales} assigned sales · {track.topics.length}{' '}
                    topics
                  </p>
                </div>
                <TrackProgressBar value={track.progress} label={`${track.progress}% complete`} />
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-muted-foreground md:justify-end">
                  <span>{track.progress}%</span>
                  <FiChevronRight className="h-4 w-4" />
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Track Library</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">กรอง track ตาม category, level และ solution แล้วเลื่อนดูได้เมื่อมีหลายรายการ</p>
            </div>
            <Badge tone="default">{filteredTracks.length} tracks</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 rounded-lg border border-border bg-background/70 p-3 md:grid-cols-3">
            <Field label="Category">
              <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as 'all' | TrackCategoryId)}>
                <option value="all">All categories</option>
                {trackCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Level">
              <Select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as 'all' | TrackLevel)}>
                <option value="all">All levels</option>
                {Object.entries(trackLevelLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Solution">
              <Select value={solutionFilter} onChange={(event) => setSolutionFilter(event.target.value)}>
                <option value="all">All solutions</option>
                {solutionOptions.map((solution) => (
                  <option key={solution} value={solution}>
                    {solution}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="max-h-[560px] overflow-y-auto rounded-lg border border-border bg-background/60 p-3 pr-2">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTracks.map((track) => (
                <article
                  key={track.id}
                  className="grid min-w-0 rounded-lg border border-border bg-card text-left shadow-panel transition hover:border-primary/40 hover:bg-secondary/20"
                >
                  <div className="h-1 rounded-t-lg bg-gradient-to-r from-primary via-success to-warning" />
                  <div className="grid gap-4 p-5">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm">
                      <FiAward className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge tone="muted">{getTrackCategoryLabel(track.categoryId)}</Badge>
                        <Badge tone="default">{trackLevelLabels[track.level]}</Badge>
                        <Badge tone="muted">{track.solutionKey}</Badge>
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-foreground">{track.title}</h2>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">{track.topics.length} topics</p>
                      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{track.description}</p>
                    </div>
                    <TrackProgressBar value={track.progress} label={`${track.progress}% complete`} />
                    <Button type="button" className="w-full" onClick={() => onOpenTrack(track.id)}>
                      View track
                      <FiChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}



function TrackMetric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' }) {
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

function TrackProgressBar({ value, label }: { value: number; label: string }) {
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
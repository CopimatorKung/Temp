import { FiAward, FiChevronRight } from 'react-icons/fi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Field, Select } from '../../../components/ui/Field';
import {
  solutionOptions,
  trackCategories,
  trackLevelLabels,
  type OnboardingTrack,
  type TrackCategoryId,
  type TrackLevel,
} from '../mock-data';
import { TrackProgressBar } from './TrackOverviewMetrics';

type TrackLibraryGridProps = {
  categoryFilter: 'all' | TrackCategoryId;
  filteredTracks: OnboardingTrack[];
  levelFilter: 'all' | TrackLevel;
  solutionFilter: 'all' | string;
  onCategoryChange: (value: 'all' | TrackCategoryId) => void;
  onLevelChange: (value: 'all' | TrackLevel) => void;
  onOpenTrack: (trackId: string) => void;
  onSolutionChange: (value: 'all' | string) => void;
};

export function TrackLibraryGrid({
  categoryFilter,
  filteredTracks,
  levelFilter,
  solutionFilter,
  onCategoryChange,
  onLevelChange,
  onOpenTrack,
  onSolutionChange,
}: TrackLibraryGridProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Track Library</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">เลือก track ตาม category, level และ solution เพื่อเปิด learning path ของ sales</p>
          </div>
          <Badge tone="default">{filteredTracks.length} tracks</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <TrackLibraryFilters
          categoryFilter={categoryFilter}
          levelFilter={levelFilter}
          solutionFilter={solutionFilter}
          onCategoryChange={onCategoryChange}
          onLevelChange={onLevelChange}
          onSolutionChange={onSolutionChange}
        />

        <div className="max-h-[520px] overflow-y-auto rounded-lg border border-border bg-background/60 p-3 pr-2">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTracks.map((track) => (
              <TrackLibraryCard key={track.id} track={track} onOpen={() => onOpenTrack(track.id)} />
            ))}
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

function TrackLibraryFilters({
  categoryFilter,
  levelFilter,
  solutionFilter,
  onCategoryChange,
  onLevelChange,
  onSolutionChange,
}: {
  categoryFilter: 'all' | TrackCategoryId;
  levelFilter: 'all' | TrackLevel;
  solutionFilter: 'all' | string;
  onCategoryChange: (value: 'all' | TrackCategoryId) => void;
  onLevelChange: (value: 'all' | TrackLevel) => void;
  onSolutionChange: (value: 'all' | string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-background/70 p-3 md:grid-cols-3">
      <Field label="Category">
        <Select value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value as 'all' | TrackCategoryId)}>
          <option value="all">All categories</option>
          {trackCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Level">
        <Select value={levelFilter} onChange={(event) => onLevelChange(event.target.value as 'all' | TrackLevel)}>
          <option value="all">All levels</option>
          {Object.entries(trackLevelLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Solution">
        <Select value={solutionFilter} onChange={(event) => onSolutionChange(event.target.value)}>
          <option value="all">All solutions</option>
          {solutionOptions.map((solution) => (
            <option key={solution} value={solution}>
              {solution}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}

function TrackLibraryCard({ track, onOpen }: { track: OnboardingTrack; onOpen: () => void }) {
  return (
    <article className="grid min-w-0 rounded-lg border border-border bg-card text-left shadow-panel transition hover:border-primary/40 hover:bg-secondary/20">
      <div className="h-1 rounded-t-lg bg-gradient-to-r from-primary via-success to-warning" />
      <div className="grid gap-4 p-5">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <FiAward className="h-6 w-6" />
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
        <Button type="button" className="w-full" onClick={onOpen}>
          View track
          <FiChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

function getTrackCategoryLabel(categoryId: TrackCategoryId) {
  return trackCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

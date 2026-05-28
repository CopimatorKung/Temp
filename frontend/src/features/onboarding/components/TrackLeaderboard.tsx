import { FiAward, FiChevronRight } from 'react-icons/fi';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { trackCategories, trackLevelLabels, type OnboardingTrack, type TrackCategoryId } from '../mock-data';
import { TrackProgressBar, TrackStatusBadge } from './TrackOverviewMetrics';

type TrackLeaderboardProps = {
  rankedTracks: OnboardingTrack[];
  onOpenTrack: (trackId: string) => void;
};

export function TrackLeaderboard({ rankedTracks, onOpenTrack }: TrackLeaderboardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Track Leaderboard</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">อันดับ progress ล่าสุด ใช้ scan track ที่ใกล้ badge หรือยังตามหลัง</p>
        </div>
        <Badge tone="default">อัปเดตล่าสุด</Badge>
      </CardHeader>
      <CardContent className="grid gap-2 p-3">
        {rankedTracks.map((track, index) => (
          <LeaderboardRow key={track.id} track={track} rank={index + 1} onOpen={() => onOpenTrack(track.id)} />
        ))}
      </CardContent>
    </Card>
  );
}

function LeaderboardRow({ track, rank, onOpen }: { track: OnboardingTrack; rank: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid min-w-0 gap-3 rounded-lg border border-border bg-background/70 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-secondary/20 md:grid-cols-[42px_minmax(0,1fr)_minmax(150px,220px)_88px_28px] md:items-center"
    >
      <div className="grid h-9 w-9 place-items-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
        {rank === 1 ? <FiAward className="h-4 w-4" /> : `#${rank}`}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground">{track.title}</p>
          <TrackStatusBadge progress={track.progress} threshold={track.badgeThreshold} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {getTrackCategoryLabel(track.categoryId)} · {trackLevelLabels[track.level]} · {track.assignedSales} assigned · {track.topics.length} topics
        </p>
      </div>
      <TrackProgressBar value={track.progress} label={`${track.progress}% complete`} compact />
      <p className="text-right text-lg font-semibold text-foreground">{track.progress}%</p>
      <FiChevronRight className="h-4 w-4 justify-self-end text-muted-foreground" />
    </button>
  );
}

function getTrackCategoryLabel(categoryId: TrackCategoryId) {
  return trackCategories.find((category) => category.id === categoryId)?.label ?? categoryId;
}

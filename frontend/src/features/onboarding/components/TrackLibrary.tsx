import { useState } from 'react';
import { tracks, type TrackCategoryId, type TrackLevel } from '../mock-data';
import { TrackLeaderboard } from './TrackLeaderboard';
import { TrackLibraryGrid } from './TrackLibraryGrid';
import { TrackOverviewMetrics } from './TrackOverviewMetrics';

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
      <TrackOverviewMetrics />
      <TrackLeaderboard rankedTracks={rankedTracks} onOpenTrack={onOpenTrack} />
      <TrackLibraryGrid
        categoryFilter={categoryFilter}
        filteredTracks={filteredTracks}
        levelFilter={levelFilter}
        solutionFilter={solutionFilter}
        onCategoryChange={setCategoryFilter}
        onLevelChange={setLevelFilter}
        onOpenTrack={onOpenTrack}
        onSolutionChange={setSolutionFilter}
      />
    </section>
  );
}

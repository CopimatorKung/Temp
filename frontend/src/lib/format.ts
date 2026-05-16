export function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function scoreTone(score: number) {
  if (score >= 85) return 'success';
  if (score >= 70) return 'warning';
  return 'danger';
}

import type { ReactNode } from 'react';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'muted';

const tones: Record<BadgeTone, string> = {
  default: 'border border-primary/20 bg-primary/10 text-primary',
  success: 'border border-success/24 bg-success/12 text-success',
  warning: 'border border-warning/30 bg-warning/15 text-warning',
  danger: 'border border-destructive/24 bg-destructive/12 text-destructive',
  muted: 'border border-border bg-muted text-muted-foreground',
};

export function Badge({ tone = 'default', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone]].join(' ')}>
      {children}
    </span>
  );
}

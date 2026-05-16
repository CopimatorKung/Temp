import type { CompetencyKey, Difficulty } from './types';

export const competencyLabels: CompetencyKey[] = ['Discovery', 'Objection', 'Value', 'Compliance', 'Closing'];

export const difficultyMeta: Record<Difficulty, { label: string; tone: 'success' | 'warning' | 'danger'; accent: string }> = {
  easy: {
    label: 'Easy',
    tone: 'success',
    accent: 'border-success/24 bg-success/10 text-success',
  },
  medium: {
    label: 'Medium',
    tone: 'warning',
    accent: 'border-warning/30 bg-warning/10 text-warning',
  },
  hard: {
    label: 'Hard',
    tone: 'danger',
    accent: 'border-destructive/24 bg-destructive/10 text-destructive',
  },
};

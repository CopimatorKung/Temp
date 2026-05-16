import { z } from 'zod';
import {
  mockScorecard,
  mockSubmission,
  mockTranscript,
  scorecardTemplates,
} from './mock-data';
import type {
  AudioSubmission,
  ScorecardResult,
  ScorecardTemplate,
  SubmissionFilters,
  Transcript,
} from './types';

const delay = (ms = 350) => new Promise((resolve) => window.setTimeout(resolve, ms));

const createSubmissionSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  scorecardTemplateId: z.string().min(1),
  topic: z.string().min(1),
  customerSegment: z.string().min(1),
  product: z.string().min(1),
  region: z.string().min(1),
  language: z.string().min(1),
});

export async function listScorecardTemplates(filters: SubmissionFilters): Promise<ScorecardTemplate[]> {
  await delay();
  const exact = scorecardTemplates.filter(
    (template) =>
      template.topic === filters.topic &&
      template.customerSegment === filters.customerSegment &&
      template.product === filters.product &&
      template.region === filters.region &&
      template.language === filters.language,
  );
  if (exact.length > 0) return exact;

  return scorecardTemplates.filter(
    (template) => template.topic === filters.topic && template.product === filters.product,
  );
}

export async function createAudioSubmission(input: {
  title: string;
  notes?: string;
  scorecardTemplateId: string;
} & SubmissionFilters): Promise<AudioSubmission> {
  await delay();
  const parsed = createSubmissionSchema.parse(input);
  return {
    ...mockSubmission,
    id: `asub_${Date.now()}`,
    status: 'draft',
    ...parsed,
    type: 'sales_call_review',
    createdBy: 'user_sales_001',
    createdAt: new Date().toISOString(),
  };
}

export async function uploadAudioFile(submission: AudioSubmission, _file: File): Promise<AudioSubmission> {
  await delay(600);
  return { ...submission, status: 'uploaded' };
}

export async function processAudioSubmission(submission: AudioSubmission): Promise<AudioSubmission> {
  await delay(900);
  return { ...submission, status: 'needs_review' };
}

export async function getTranscript(_submissionId: string): Promise<Transcript> {
  await delay();
  return mockTranscript;
}

export async function getScorecard(_submissionId: string): Promise<ScorecardResult> {
  await delay();
  return mockScorecard;
}

export async function overrideScorecard(result: ScorecardResult): Promise<ScorecardResult> {
  await delay();
  return {
    ...result,
    status: 'completed',
    review: {
      reviewedBy: 'Manager Pim',
      reviewedAt: new Date().toISOString(),
      overrideCount: result.review.overrideCount + 1,
    },
  };
}

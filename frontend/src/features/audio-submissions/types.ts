export type UserRole = 'sales' | 'manager' | 'admin';

export type AudioSubmissionStatus =
  | 'draft'
  | 'uploaded'
  | 'processing'
  | 'transcribed'
  | 'scored'
  | 'needs_review'
  | 'completed'
  | 'failed';

export type ScoreItemStatus = 'passed' | 'failed' | 'partial' | 'not_applicable';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high';

export type ScorecardTemplateItem = {
  id: string;
  label: string;
  sortIndex?: number;
  type:
    | 'required_semantic'
    | 'conditional_required'
    | 'negative_phrase'
    | 'quality_semantic'
    | 'seo_semantic'
    | 'prohibited_answer'
    | 'legal_claim';
  weight: number;
  severity: Severity;
  expectedEvidence: string;
  example?: string;
};

export type ScorecardTemplateSection = {
  id: string;
  label: string;
  sortIndex?: number;
  weight: number;
  items: ScorecardTemplateItem[];
};

export type ScorecardTemplate = {
  id: string;
  name: string;
  version: number;
  status: 'draft' | 'published' | 'archived';
  topic: string;
  customerSegment: string;
  product: string;
  region: string;
  language: string;
  effectiveDate: string;
  expiryDate?: string;
  totalWeight: number;
  sections: ScorecardTemplateSection[];
};

export type AudioSubmission = {
  id: string;
  status: AudioSubmissionStatus;
  type: 'sales_call_review' | 'recording_review' | 'document_review' | 'article_review';
  topic: string;
  customerSegment: string;
  product: string;
  region: string;
  language: string;
  scorecardTemplateId: string;
  title: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
};

export type TranscriptUtterance = {
  id: string;
  speaker: 'sales' | 'customer';
  startMs: number;
  endMs: number;
  text: string;
  confidence: number;
};

export type Transcript = {
  submissionId: string;
  language: string;
  durationSec: number;
  utterances: TranscriptUtterance[];
};

export type ScoreEvidence = {
  utteranceId: string;
  speaker: 'sales' | 'customer';
  startMs: number;
  endMs: number;
  text: string;
};

export type ScorecardResultItem = {
  id: string;
  label: string;
  status: ScoreItemStatus;
  score: number;
  maxScore: number;
  severity: Severity;
  evidence: ScoreEvidence[];
  recommendation: string | null;
};

export type ScorecardResultSection = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  items: ScorecardResultItem[];
};

export type ScorecardResult = {
  id: string;
  submissionId: string;
  templateId: string;
  status: 'scored' | 'needs_review' | 'completed';
  totalScore: number;
  riskLevel: RiskLevel;
  summary: string;
  sections: ScorecardResultSection[];
  review: {
    reviewedBy: string | null;
    reviewedAt: string | null;
    overrideCount: number;
  };
};

export type SubmissionFilters = {
  topic: string;
  customerSegment: string;
  product: string;
  region: string;
  language: string;
};

import { create } from 'zustand';
import {
  createAudioSubmission,
  getScorecard,
  getTranscript,
  listScorecardTemplates,
  overrideScorecard,
  processAudioSubmission,
  uploadAudioFile,
} from './mock-api';
import { scorecardTemplates } from './mock-data';
import type { AudioSubmission, ScorecardResult, ScorecardTemplate, SubmissionFilters, Transcript } from './types';

type AudioReviewState = {
  filters: SubmissionFilters;
  title: string;
  notes: string;
  selectedTemplate?: ScorecardTemplate;
  templates: ScorecardTemplate[];
  submission?: AudioSubmission;
  transcript?: Transcript;
  scorecard?: ScorecardResult;
  selectedEvidenceItemId?: string;
  isLoadingTemplates: boolean;
  isProcessing: boolean;
  error?: string;
  setFilter: (key: keyof SubmissionFilters, value: string) => void;
  setTitle: (value: string) => void;
  setNotes: (value: string) => void;
  loadTemplates: () => Promise<void>;
  selectTemplate: (id: string) => void;
  runMockUploadFlow: (file?: File) => Promise<void>;
  selectEvidenceItem: (id?: string) => void;
  applyManagerOverride: () => Promise<void>;
};

const initialFilters: SubmissionFilters = {
  topic: 'promotion_pitch',
  customerSegment: 'sme',
  product: 'product-a',
  region: 'th',
  language: 'th',
};

export const useAudioReviewStore = create<AudioReviewState>((set, get) => ({
  filters: initialFilters,
  title: 'Pitch โปร Q2 กับร้านค้ารายย่อย',
  notes: 'mock call จาก training session',
  templates: [],
  isLoadingTemplates: false,
  isProcessing: false,
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setTitle: (title) => set({ title }),
  setNotes: (notes) => set({ notes }),
  loadTemplates: async () => {
    set({ isLoadingTemplates: true, error: undefined });
    const templates = await listScorecardTemplates(get().filters);
    set({ templates, selectedTemplate: templates[0], isLoadingTemplates: false });
  },
  selectTemplate: (id) => {
    const selectedTemplate = get().templates.find((template) => template.id === id) ?? scorecardTemplates.find((template) => template.id === id);
    set({ selectedTemplate });
  },
  runMockUploadFlow: async (file) => {
    const selectedTemplate = get().selectedTemplate;
    if (!selectedTemplate) {
      set({ error: 'No scorecard template selected' });
      return;
    }

    set({ isProcessing: true, error: undefined, transcript: undefined, scorecard: undefined });
    const created = await createAudioSubmission({
      ...get().filters,
      title: get().title,
      notes: get().notes,
      scorecardTemplateId: selectedTemplate.id,
    });
    set({ submission: created });

    const uploaded = await uploadAudioFile(created, file ?? new File(['mock'], 'mock-call.webm'));
    set({ submission: uploaded });

    const processed = await processAudioSubmission(uploaded);
    const [transcript, scorecard] = await Promise.all([getTranscript(processed.id), getScorecard(processed.id)]);
    set({ submission: processed, transcript, scorecard, isProcessing: false, selectedEvidenceItemId: 'promo-terms' });
  },
  selectEvidenceItem: (selectedEvidenceItemId) => set({ selectedEvidenceItemId }),
  applyManagerOverride: async () => {
    const scorecard = get().scorecard;
    if (!scorecard) return;
    set({ scorecard: await overrideScorecard(scorecard) });
  },
}));

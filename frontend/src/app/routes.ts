import { compile } from 'path-to-regexp';

export const routes = {
  home: '/',
  dashboard: '/app/dashboard',
  audioNew: '/app/audio/new',
  audioDetail: '/app/audio/:submissionId',
  templateDetail: '/app/template/:templateId',
  trainingAsk: '/app/training/ask',
  trainingAskSession: '/app/training/ask/:sessionId',
  recordingReview: '/app/training/recording-review',
  recordingReviewBatch: '/app/training/recording-review/:batchId',
  trainingRubricDetail: '/app/training/rubrics/:rubricId',
  voiceRoleplay: '/app/training/voice-roleplay',
  voiceRoleplaySession: '/app/training/voice-roleplay/:sessionId',
  onboardingMe: '/app/onboarding/me',
  playbooks: '/app/playbooks',
  adminUsers: '/app/admin/users',
} as const;

export const buildPath = {
  audioDetail: compile<{ submissionId: string }>(routes.audioDetail),
  templateDetail: compile<{ templateId: string }>(routes.templateDetail),
  trainingAskSession: compile<{ sessionId: string }>(routes.trainingAskSession),
  recordingReviewBatch: compile<{ batchId: string }>(routes.recordingReviewBatch),
  trainingRubricDetail: compile<{ rubricId: string }>(routes.trainingRubricDetail),
  voiceRoleplaySession: compile<{ sessionId: string }>(routes.voiceRoleplaySession),
};

export const routeLabels: Record<string, string> = {
  [routes.dashboard]: 'Home',
  [routes.audioNew]: 'Quality',
  [routes.trainingAsk]: 'Ask',
  [routes.trainingAskSession]: 'Ask',
  [routes.templateDetail]: 'Template Edit',
  [routes.recordingReview]: 'Recordings',
  [routes.recordingReviewBatch]: 'Recording Batch',
  [routes.trainingRubricDetail]: 'Training Rubric',
  [routes.voiceRoleplay]: 'Senario',
  [routes.voiceRoleplaySession]: 'Senario Session',
  [routes.onboardingMe]: 'Onboard',
  [routes.playbooks]: 'Knowledge',
  [routes.adminUsers]: 'Settings',
};

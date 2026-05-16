import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AudioQualityReviewPage } from '../features/audio-submissions/pages/AudioQualityReviewPage';
import { TemplateEditorPage } from '../features/audio-submissions/pages/TemplateEditorPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { NotFoundPage } from '../features/not-found/pages/NotFoundPage';
import { OnboardingPage } from '../features/onboarding/pages/OnboardingPage';
import { PlaybooksPage } from '../features/playbooks/pages/PlaybooksPage';
import { RecordingReviewPage } from '../features/training/pages/RecordingReviewPage';
import { TrainingAskPage } from '../features/training/pages/TrainingAskPage';
import { TrainingRubricEditorPage } from '../features/training/pages/TrainingRubricEditorPage';
import { VoiceRoleplayPage } from '../features/training/pages/VoiceRoleplayPage';
import { routes } from './routes';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path={routes.home} element={<LandingPage />} />
        <Route path="/dashboard" element={<Navigate to={routes.dashboard} replace />} />
        <Route path="/audio/new" element={<Navigate to={routes.audioNew} replace />} />
        <Route path="/training/ask" element={<Navigate to={routes.trainingAsk} replace />} />
        <Route path="/training/recording-review" element={<Navigate to={routes.recordingReview} replace />} />
        <Route path="/training/voice-roleplay" element={<Navigate to={routes.voiceRoleplay} replace />} />
        <Route path="/playbooks" element={<Navigate to={routes.playbooks} replace />} />
        <Route path="/onboarding/me" element={<Navigate to={routes.onboardingMe} replace />} />
        <Route path="/admin/users" element={<Navigate to={routes.adminUsers} replace />} />
        <Route
          path="/app/*"
          element={
            <AppShell>
              <Routes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="audio/new" element={<AudioQualityReviewPage />} />
                <Route path="audio/:submissionId" element={<AudioQualityReviewPage />} />
                <Route path="template/:templateId" element={<TemplateEditorPage />} />
                <Route path="training/ask" element={<TrainingAskPage />} />
                <Route path="training/ask/:sessionId" element={<TrainingAskPage />} />
                <Route path="training/recording-review" element={<RecordingReviewPage />} />
                <Route path="training/recording-review/:batchId" element={<RecordingReviewPage />} />
                <Route path="training/rubrics/:rubricId" element={<TrainingRubricEditorPage />} />
                <Route path="training/voice-roleplay/:sessionId" element={<VoiceRoleplayPage />} />
                <Route path="training/voice-roleplay" element={<VoiceRoleplayPage />} />
                <Route path="onboarding/me" element={<OnboardingPage />} />
                <Route path="playbooks" element={<PlaybooksPage />} />
                <Route path="admin/users" element={<AdminUsersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AppShell>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AudioQualityReviewPage } from '../features/audio-submissions/pages/AudioQualityReviewPage';
import { TemplateEditorPage } from '../features/audio-submissions/pages/TemplateEditorPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { LandingPage } from '../features/landing/pages/LandingPage';
import { NotFoundPage } from '../features/not-found/pages/NotFoundPage';
import { OnboardingPage } from '../features/onboarding/pages/OnboardingPage';
import { PlaybooksPage } from '../features/playbooks/pages/PlaybooksPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
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
        <Route path={routes.login} element={<LoginPage />} />
        <Route path="/signin" element={<Navigate to={routes.login} replace />} />
        <Route path="/dashboard" element={<Navigate to={routes.dashboard} replace />} />
        <Route path="/audio/new" element={<Navigate to={routes.audioNew} replace />} />
        <Route path="/training/ask" element={<Navigate to={routes.trainingAsk} replace />} />
        <Route path="/training/recording-review" element={<Navigate to={routes.recordingReview} replace />} />
        <Route path="/training/voice-roleplay" element={<Navigate to={routes.voiceRoleplay} replace />} />
        <Route path="/playbooks" element={<Navigate to={routes.playbooks} replace />} />
        <Route path="/onboarding/me" element={<Navigate to={routes.onboardingMe} replace />} />
        <Route path="/admin/users" element={<Navigate to={routes.settingsUsersRoles} replace />} />
        <Route path="/settings" element={<Navigate to={routes.settings} replace />} />
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
                <Route path="onboarding/track/:trackId" element={<OnboardingPage />} />
                <Route path="onboarding/track-management/:managementTrackId" element={<OnboardingPage />} />
                <Route path="playbooks" element={<PlaybooksPage />} />
                <Route path="knowledge/book/:bookId" element={<PlaybooksPage />} />
                <Route path="knowledge/:categoryId" element={<PlaybooksPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<AdminUsersPage />} />
                <Route path="settings/theme" element={<AdminUsersPage view="theme" />} />
                <Route path="settings/users-roles" element={<AdminUsersPage view="users-roles" />} />
                <Route path="settings/security" element={<AdminUsersPage view="security" />} />
                <Route path="settings/knowledge-sync" element={<AdminUsersPage view="knowledge-sync" />} />
                <Route path="settings/notifications" element={<AdminUsersPage view="notifications" />} />
                <Route path="settings/track-categories" element={<AdminUsersPage view="track-categories" />} />
                <Route path="settings/solutions" element={<AdminUsersPage view="solutions" />} />
                <Route path="admin/users" element={<AdminUsersPage view="users-roles" />} />
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

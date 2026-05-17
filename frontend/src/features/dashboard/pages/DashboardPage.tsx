import { AiInsightBanner } from '../components/AiInsightBanner';
import { DashboardHeader } from '../components/DashboardHeader';
import { ImprovementAreasPanel } from '../components/ImprovementAreasPanel';
import { KnowledgeGapsPanel } from '../components/KnowledgeGapsPanel';
import { LostDealsPanel } from '../components/LostDealsPanel';
import { MomentumHero } from '../components/MomentumHero';
import { OnboardingProgressPanel } from '../components/OnboardingProgressPanel';
import { ReadinessHeatmap } from '../components/ReadinessHeatmap';
import { RecentImprovementsPanel } from '../components/RecentImprovementsPanel';
import { TrendMetricGrid } from '../components/TrendMetricGrid';

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto grid w-full max-w-[1440px] gap-4 p-4 lg:gap-5 lg:p-6">
        <DashboardHeader />
        <MomentumHero />
        <TrendMetricGrid />
        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.75fr)_minmax(320px,0.85fr)]">
          <ReadinessHeatmap />
          <KnowledgeGapsPanel />
          <div className="xl:col-span-2 2xl:col-span-1">
            <LostDealsPanel />
          </div>
        </section>
        <section className="grid min-w-0 gap-4 xl:grid-cols-3">
          <ImprovementAreasPanel />
          <RecentImprovementsPanel />
          <OnboardingProgressPanel />
        </section>
        <AiInsightBanner />
      </main>
    </div>
  );
}

import {
  FiAlertTriangle,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

export const executiveMetrics = [
  { label: 'Deals Won', value: '142', change: '+18%', helper: 'vs last 30 days', icon: FiCheckCircle, tone: 'success' },
  { label: 'Win Rate', value: '24%', change: '+12%', helper: 'vs last 30 days', icon: FiTarget, tone: 'success' },
  { label: 'Avg. Deal Size', value: '$48.7K', change: '+8%', helper: 'vs last 30 days', icon: FiDollarSign, tone: 'success' },
];

export const trendMetrics = [
  { label: 'Time To Readiness', value: '21 days', change: '-23 days', icon: FiClock, tone: 'primary', points: [12, 16, 25, 18, 15, 22, 40, 35, 24, 29, 18, 24] },
  { label: 'Revenue At Risk', value: '฿18.7M', change: '+12%', icon: FiAlertTriangle, tone: 'warning', points: [8, 12, 15, 32, 25, 18, 44, 21, 22, 27, 12, 16] },
  { label: 'Simulation Hours', value: '1,324 hrs', change: '+28%', icon: FiZap, tone: 'success', points: [10, 14, 18, 30, 42, 28, 38, 27, 43, 46, 36, 32, 45] },
  { label: 'Playbook Drift', value: '23 topics', change: '+8', icon: FiBookOpen, tone: 'warning', points: [11, 14, 18, 21, 30, 42, 40, 24, 18, 39, 17, 21, 36] },
];

export const readinessHeatmap = [
  { team: 'Enterprise Team', product: 85, discovery: 72, objection: 48, pricing: 76, compliance: 84, executive: 70, overall: 72 },
  { team: 'SMB Team', product: 78, discovery: 65, objection: 52, pricing: 60, compliance: 88, executive: 58, overall: 66 },
  { team: 'New Hires', product: 42, discovery: 50, objection: 35, pricing: 40, compliance: 62, executive: 36, overall: 44 },
  { team: 'West Region', product: 82, discovery: 74, objection: 63, pricing: 68, compliance: 86, executive: 72, overall: 74 },
  { team: 'Inside Sales', product: 76, discovery: 61, objection: 49, pricing: 55, compliance: 82, executive: 60, overall: 64 },
];

export const knowledgeGaps = [
  { topic: 'Q2 Promotion expiry condition', category: 'Promotion', failRate: '68%', affected: 35, revenue: '฿6.2M' },
  { topic: 'Competitor migration timeline', category: 'Competitor', failRate: '56%', affected: 28, revenue: '฿4.8M' },
  { topic: 'Enterprise implementation concern', category: 'Technical', failRate: '52%', affected: 31, revenue: '฿3.9M' },
  { topic: 'Volume discount policy', category: 'Pricing', failRate: '41%', affected: 22, revenue: '฿2.1M' },
  { topic: 'Data security and compliance', category: 'Compliance', failRate: '37%', affected: 18, revenue: '฿1.7M' },
];

export const lostDealReasons = [
  { label: 'Discovery incomplete', value: 34, color: 'hsl(var(--primary))' },
  { label: 'Weak objection handling', value: 27, color: 'hsl(var(--accent))' },
  { label: 'Pricing confusion', value: 18, color: 'hsl(var(--warning))' },
  { label: 'Compliance hesitation', value: 11, color: 'hsl(var(--success))' },
  { label: 'Other', value: 10, color: 'hsl(var(--muted-foreground))' },
];

export const improvementAreas = [
  { label: 'Objection Handling', value: 42, change: '+18%' },
  { label: 'Product Knowledge', value: 56, change: '+16%' },
  { label: 'Executive Pitch', value: 49, change: '+15%' },
  { label: 'Discovery', value: 61, change: '+12%' },
  { label: 'Compliance', value: 70, change: '+10%' },
];

export const recentImprovements = [
  { title: 'SMB Team improved objection handling', detail: 'After focused AI coaching and simulations', points: '+22 pts' },
  { title: 'New Hires increased product knowledge', detail: 'Completed onboarding track and quizzes', points: '+19 pts' },
  { title: 'Enterprise Team better at executive pitch', detail: 'Practiced CFO and CTO scenarios', points: '+16 pts' },
  { title: 'West Region improved compliance', detail: 'Updated playbook and AI coaching', points: '+14 pts' },
];

export const onboardingTracks = [
  { label: 'Product Knowledge', value: 80 },
  { label: 'Playbook & Process', value: 70 },
  { label: 'Pitch & Objection', value: 60 },
  { label: 'Compliance & Policy', value: 50 },
];

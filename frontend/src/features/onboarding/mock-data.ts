import type { IconType } from 'react-icons';
import { FiBookOpen, FiExternalLink, FiHeadphones, FiMic } from 'react-icons/fi';

export type OnboardingTab = 'track' | 'management' | 'badge';
export type TrackDetailTab = 'topics' | 'achievement';
export type TopicType = 'knowledge' | 'external' | 'audio_response' | 'scenario';
export type TopicStatus = 'completed' | 'in_progress' | 'locked';
export type TrackCategoryId = 'foundation' | 'solution-specialist' | 'enterprise';
export type TrackLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrackTopic = {
  id: string;
  sortIndex: number;
  title: string;
  type: TopicType;
  source: string;
  description: string;
  status: TopicStatus;
  requiredScore?: number;
  scenarioId?: string;
};

export type OnboardingTrack = {
  id: string;
  title: string;
  specialty: string;
  description: string;
  solution: string;
  solutionKey: string;
  categoryId: TrackCategoryId;
  level: TrackLevel;
  status: 'published' | 'draft';
  progress: number;
  badgeThreshold: number;
  assignedSales: number;
  topics: TrackTopic[];
};

export const trackCategories: Array<{ id: TrackCategoryId; label: string; description: string }> = [
  { id: 'foundation', label: 'Foundation', description: 'Core onboarding and sales standard' },
  { id: 'solution-specialist', label: 'Solution Specialist', description: 'Track ตาม product หรือ solution' },
  { id: 'enterprise', label: 'Enterprise', description: 'Cross-solution และ complex deal' },
];

export const solutionOptions = ['Chatbot', 'Voicebot', 'Digital Human', 'CMS', 'DocSearch'] as const;

export const trackLevelLabels: Record<TrackLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export type BadgeAchievement = {
  id: string;
  trackId: string;
  userName: string;
  role: string;
  issuedAt: string;
  expiresAt: string;
  progress: number;
  status: 'active' | 'expiring' | 'expired';
};

export type BadgeDefinition = {
  id: string;
  title: string;
  trackId: string;
  status: 'locked' | 'earned';
  requirement: string;
  progress: number;
  expiresInMonths: number;
};

export const tracks: OnboardingTrack[] = [
  {
    id: 'track-chatbot-mastery',
    title: 'Chatbot Mastery',
    specialty: 'AI conversation design',
    description: 'ฝึก discovery, objection และ safe answer สำหรับ web-based AI bot',
    solution: 'Company solution / Chatbot',
    solutionKey: 'Chatbot',
    categoryId: 'solution-specialist',
    level: 'beginner',
    status: 'published',
    progress: 72,
    badgeThreshold: 80,
    assignedSales: 18,
    topics: [
      {
        id: 'topic-chatbot-positioning',
        sortIndex: 1,
        title: 'อ่าน positioning ของ Chatbot',
        type: 'knowledge',
        source: 'Knowledge / Product Documentation',
        description: 'เข้าใจ use case, limit และ safe claim ก่อนเริ่ม pitch',
        status: 'completed',
      },
      {
        id: 'topic-chatbot-external',
        sortIndex: 2,
        title: 'ดูตัวอย่าง external demo',
        type: 'external',
        source: 'https://example.com/chatbot-demo',
        description: 'เปิด reference ภายนอกเพื่อเห็น customer journey จริง',
        status: 'completed',
      },
      {
        id: 'topic-chatbot-audio',
        sortIndex: 3,
        title: 'ตอบ audio prompt เรื่อง ROI',
        type: 'audio_response',
        source: 'AI audio prompt',
        description: 'ฟังโจทย์แล้วเขียนคำตอบให้ AI ตรวจความเข้าใจ',
        status: 'in_progress',
        requiredScore: 70,
      },
      {
        id: 'topic-chatbot-senario',
        sortIndex: 4,
        title: 'จบ Senario: Non-tech owner',
        type: 'scenario',
        source: 'Senario / vr-001',
        description: 'ถ้า complete Senario นี้ ระบบจะนับ progress ให้ track อัตโนมัติ',
        status: 'in_progress',
        requiredScore: 75,
        scenarioId: 'vr-001',
      },
    ],
  },
  {
    id: 'track-voicebot-architect',
    title: 'Voicebot Architect',
    specialty: 'Voice AI and ASR/TTS',
    description: 'ฝึก pitch เรื่อง latency, tone consistency และ conversation handoff',
    solution: 'Company solution / Voicebot',
    solutionKey: 'Voicebot',
    categoryId: 'solution-specialist',
    level: 'intermediate',
    status: 'published',
    progress: 44,
    badgeThreshold: 85,
    assignedSales: 11,
    topics: [
      {
        id: 'topic-voice-latency',
        sortIndex: 1,
        title: 'ศึกษา latency standard',
        type: 'knowledge',
        source: 'Knowledge / Voicebot Standard',
        description: 'รู้ trade-off ของ ASR, TTS และ WSS streaming',
        status: 'completed',
      },
      {
        id: 'topic-voice-playback',
        sortIndex: 2,
        title: 'ฟังตัวอย่าง call แล้วเขียน response',
        type: 'audio_response',
        source: 'Audio prompt / enterprise voice',
        description: 'ฟังลูกค้าเรื่อง delay แล้วเขียนคำตอบแบบไม่ overclaim',
        status: 'in_progress',
        requiredScore: 80,
      },
      {
        id: 'topic-voice-senario',
        sortIndex: 3,
        title: 'จบ Senario: Technical committee',
        type: 'scenario',
        source: 'Senario / vr-002',
        description: 'ตอบ technical proof และ migration risk ให้ผ่าน rubric',
        status: 'locked',
        requiredScore: 80,
        scenarioId: 'vr-002',
      },
    ],
  },
  {
    id: 'track-enterprise-closer',
    title: 'Enterprise Closer',
    specialty: 'Complex deal strategy',
    description: 'รวม procurement, technical team และ executive buyer ไว้ใน learning path เดียว',
    solution: 'Cross-solution / Enterprise',
    solutionKey: 'Digital Human',
    categoryId: 'enterprise',
    level: 'advanced',
    status: 'draft',
    progress: 88,
    badgeThreshold: 85,
    assignedSales: 7,
    topics: [
      {
        id: 'topic-enterprise-standard',
        sortIndex: 1,
        title: 'Enterprise selling standard',
        type: 'knowledge',
        source: 'Knowledge / Enterprise Sales Standard',
        description: 'อ่านมาตรฐาน discovery, decision process และ legal guardrail',
        status: 'completed',
      },
      {
        id: 'topic-enterprise-room',
        sortIndex: 2,
        title: 'จบ Meeting Room: Procurement Committee',
        type: 'scenario',
        source: 'Senario Meeting Room',
        description: 'เมื่อตอบผ่าน 85% ขึ้นไป topic นี้จะ complete อัตโนมัติ',
        status: 'completed',
        requiredScore: 85,
        scenarioId: 'vr-001',
      },
      {
        id: 'topic-enterprise-audio',
        sortIndex: 3,
        title: 'ตอบ audio prompt เรื่อง discount',
        type: 'audio_response',
        source: 'AI audio prompt / pricing',
        description: 'ฟัง objection เรื่องราคา แล้วเขียน response พร้อม next step',
        status: 'completed',
        requiredScore: 80,
      },
    ],
  },
];

export const badges: BadgeDefinition[] = [
  {
    id: 'badge-chatbot',
    title: 'Chatbot Mastery',
    trackId: 'track-chatbot-mastery',
    status: 'locked',
    requirement: 'Complete 80% of track topics',
    progress: 72,
    expiresInMonths: 6,
  },
  {
    id: 'badge-voice',
    title: 'Voicebot Architect',
    trackId: 'track-voicebot-architect',
    status: 'locked',
    requirement: 'Complete 85% and pass voice scenario',
    progress: 44,
    expiresInMonths: 6,
  },
  {
    id: 'badge-enterprise',
    title: 'Enterprise Closer',
    trackId: 'track-enterprise-closer',
    status: 'earned',
    requirement: 'Complete 85% of track topics',
    progress: 88,
    expiresInMonths: 6,
  },
];

export const badgeAchievements: BadgeAchievement[] = [
  {
    id: 'ach-chatbot-pim',
    trackId: 'track-chatbot-mastery',
    userName: 'Pim K.',
    role: 'Manager',
    issuedAt: '2026-02-18',
    expiresAt: '2026-08-18',
    progress: 92,
    status: 'active',
  },
  {
    id: 'ach-chatbot-nara',
    trackId: 'track-chatbot-mastery',
    userName: 'Nara S.',
    role: 'Sales',
    issuedAt: '2025-12-20',
    expiresAt: '2026-06-20',
    progress: 84,
    status: 'expiring',
  },
  {
    id: 'ach-enterprise-may',
    trackId: 'track-enterprise-closer',
    userName: 'May T.',
    role: 'Senior Sales',
    issuedAt: '2026-01-10',
    expiresAt: '2026-07-10',
    progress: 88,
    status: 'active',
  },
  {
    id: 'ach-enterprise-korn',
    trackId: 'track-enterprise-closer',
    userName: 'Korn P.',
    role: 'Sales',
    issuedAt: '2025-11-15',
    expiresAt: '2026-05-15',
    progress: 86,
    status: 'expired',
  },
];

export const topicMeta: Record<TopicType, { label: string; icon: IconType; tone: string }> = {
  knowledge: { label: 'Knowledge topic', icon: FiBookOpen, tone: 'text-success bg-success/12' },
  external: { label: 'External view', icon: FiExternalLink, tone: 'text-primary bg-primary/10' },
  audio_response: { label: 'Audio response', icon: FiHeadphones, tone: 'text-warning bg-warning/15' },
  scenario: { label: 'Linked Senario', icon: FiMic, tone: 'text-primary bg-primary/10' },
};

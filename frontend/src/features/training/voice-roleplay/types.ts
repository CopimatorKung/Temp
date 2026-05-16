export type Difficulty = 'easy' | 'medium' | 'hard';
export type PersonaStatus = 'published' | 'draft';
export type PageMode = 'overview' | 'session' | 'summary';
export type RoleplayTab = 'session-history' | 'persona-management' | 'meeting-room';
export type CompetencyKey = 'Discovery' | 'Objection' | 'Value' | 'Compliance' | 'Closing';

export type Persona = {
  id: string;
  name: string;
  subtitle: string;
  company: string;
  difficulty: Difficulty;
  description: string;
  traits: string[];
  goal: string;
  objection: string;
  status: PersonaStatus;
  sessions: number;
  avatar: string;
};

export type Session = {
  id: string;
  personaIds: string[];
  meetingRoomId?: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  turns: number;
  outcome: string;
  meetingGoal?: string;
  improvementSuggestion?: string;
  conversation?: SessionConversationMessage[];
  competencies: Record<CompetencyKey, number>;
  strengths: string[];
  growth: string[];
};

export type SessionConversationMessage = {
  id: string;
  speakerType: 'persona' | 'seller' | 'system';
  personaId?: string;
  text: string;
  timestamp: string;
  feedback?: string;
};

export type MeetingRoom = {
  id: string;
  name: string;
  description: string;
  personaIds: string[];
  scenario: string;
  status: PersonaStatus;
};

export type PersonaForm = Pick<
  Persona,
  'name' | 'subtitle' | 'company' | 'difficulty' | 'description' | 'traits' | 'goal' | 'objection' | 'status'
>;

export type MeetingRoomForm = Pick<MeetingRoom, 'name' | 'description' | 'personaIds' | 'scenario' | 'status'>;

export type LiveMessage = {
  speaker: 'AI Customer' | 'You';
  align: 'left' | 'right';
  text: string;
};

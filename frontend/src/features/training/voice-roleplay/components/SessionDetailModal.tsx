import { useState } from 'react';
import { FiBarChart2, FiCheckCircle, FiMessageSquare, FiTarget } from 'react-icons/fi';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Portal } from '../../../../components/ui/Portal';
import { competencyLabels } from '../constants';
import type { MeetingRoom, Persona, Session } from '../types';
import { getPersonaLabel } from '../utils';
import { PersonaAvatar, RadarChart, ScoreRing } from './Visuals';

export function SessionDetailView({
  session,
  personas,
  meetingRoom,
  previousSession,
}: {
  session: Session;
  personas: Persona[];
  meetingRoom?: MeetingRoom;
  previousSession?: Session;
}) {
  const [activeTab, setActiveTab] = useState<'info' | 'conversation'>('info');
  const improvement = previousSession ? session.score - previousSession.score : 0;
  const meetingGoal = session.meetingGoal ?? meetingRoom?.description ?? 'ฝึก Senario เพื่อประเมินทักษะการขายและ objection handling';
  const improvementSuggestion =
    session.improvementSuggestion ?? session.growth.join(' · ') ?? 'ทบทวน conversation แล้วเลือก next step ที่ชัดขึ้น';
  const conversation = session.conversation ?? [];

  return (
    <div className="grid gap-5">
      <div className="inline-grid w-fit grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1">
        {[
          { id: 'info', label: 'Info', icon: FiBarChart2 },
          { id: 'conversation', label: 'Conversation', icon: FiMessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'info' | 'conversation')}
            className={[
              'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition',
              activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary/60',
            ].join(' ')}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'info' ? (
        <SessionInfoPanel
          session={session}
          personas={personas}
          meetingRoom={meetingRoom}
          meetingGoal={meetingGoal}
          improvement={improvement}
          improvementSuggestion={improvementSuggestion}
          previousSession={previousSession}
        />
      ) : (
        <SessionConversationPanel
          conversation={conversation}
          personas={personas}
          meetingGoal={meetingGoal}
          improvementSuggestion={improvementSuggestion}
        />
      )}
    </div>
  );
}

function SessionInfoPanel({
  session,
  personas,
  meetingRoom,
  meetingGoal,
  improvement,
  improvementSuggestion,
  previousSession,
}: {
  session: Session;
  personas: Persona[];
  meetingRoom?: MeetingRoom;
  meetingGoal: string;
  improvement: number;
  improvementSuggestion: string;
  previousSession?: Session;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="grid content-start gap-4">
        <Card className="grid justify-items-center gap-4 p-5">
          <ScoreRing score={session.score} size={148} />
          <Badge tone={improvement >= 0 ? 'success' : 'warning'}>
            {improvement >= 0 ? '+' : ''}
            {improvement} vs previous
          </Badge>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {personas.map((persona) => (
              <div key={persona.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/70 p-3">
                <PersonaAvatar persona={persona} className="h-10 w-10 text-sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{persona.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{persona.subtitle}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid min-w-0 gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Meeting goal</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{meetingRoom?.name ?? session.title}</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 rounded-lg border border-primary/15 bg-primary/5 p-3 text-sm leading-6">
                <FiTarget className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{meetingGoal}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Improvement suggestion</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">AI feedback สำหรับ session ถัดไป</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm leading-6">
                <FiBarChart2 className="mt-1 h-4 w-4 shrink-0 text-warning" />
                <span className="text-muted-foreground">{improvementSuggestion}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Radar Comparison</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">session นี้เทียบกับ session ก่อนหน้า</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
            <RadarChart current={session.competencies} previous={previousSession?.competencies} height={220} />
            <div className="grid gap-3 text-sm">
              {competencyLabels.map((label) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-background/70 px-3 py-2">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="font-semibold text-primary">{session.competencies[label]}/100</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 md:grid-cols-2">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {session.strengths.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6">
                  <FiCheckCircle className="mt-1 h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Growth</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {session.growth.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6">
                  <FiBarChart2 className="mt-1 h-4 w-4 shrink-0 text-warning" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SessionConversationPanel({
  conversation,
  personas,
  meetingGoal,
  improvementSuggestion,
}: {
  conversation: NonNullable<Session['conversation']>;
  personas: Persona[];
  meetingGoal: string;
  improvementSuggestion: string;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Conversation review</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">ย้อนดู chat log เพื่อประเมิน self และคำตอบของ AI persona</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 rounded-lg border border-border bg-secondary/25 p-4">
            {conversation.map((message) => {
              const persona = message.personaId ? personas.find((item) => item.id === message.personaId) : undefined;
              const isSeller = message.speakerType === 'seller';
              const speakerName = isSeller ? 'You' : persona ? `${persona.name} · ${persona.subtitle}` : 'AI Customer';

              return (
                <div key={message.id} className={['flex gap-3', isSeller ? 'justify-end' : 'justify-start'].join(' ')}>
                  {!isSeller ? (
                    <PersonaAvatar persona={persona ?? personas[0]} className="h-9 w-9 text-xs" />
                  ) : null}
                  <div className={['grid max-w-[760px] gap-2', isSeller ? 'justify-items-end' : 'justify-items-start'].join(' ')}>
                    <div
                      className={[
                        'rounded-lg border px-4 py-3 text-sm leading-6 shadow-sm',
                        isSeller
                          ? 'border-primary/20 bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground',
                      ].join(' ')}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-semibold opacity-80">
                        <span>{speakerName}</span>
                        <span>{message.timestamp}</span>
                      </div>
                      <p>{message.text}</p>
                    </div>
                    {message.feedback ? (
                      <div className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-xs leading-5 text-muted-foreground">
                        <span className="font-semibold text-success">AI feedback: </span>
                        {message.feedback}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <aside className="grid content-start gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Meeting goal</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">{meetingGoal}</CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Improvement</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">{improvementSuggestion}</CardContent>
        </Card>
      </aside>
    </div>
  );
}

export function SessionDetailModal({
  session,
  personas,
  previousSession,
  onClose,
}: {
  session: Session;
  personas: Persona[];
  previousSession?: Session;
  onClose: () => void;
}) {
  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Senario session detail"
          className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Session Detail
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{session.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {getPersonaLabel(personas)} · {session.date} · {session.duration}
              </p>
            </div>
            <Button type="button" variant="ghost" className="h-9 px-3" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="max-h-[76vh] overflow-y-auto p-5">
            <SessionDetailView session={session} personas={personas} previousSession={previousSession} />
          </div>
        </div>
      </div>
    </Portal>
  );
}

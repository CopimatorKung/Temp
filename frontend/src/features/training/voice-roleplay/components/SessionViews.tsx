import { useEffect, useMemo, useRef, useState } from 'react';
import { FiBarChart2, FiCheckCircle, FiMic, FiSend, FiSquare, FiUser } from 'react-icons/fi';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { competencyLabels, difficultyMeta } from '../constants';
import { liveMessages } from '../mock-data';
import type { Persona, Session } from '../types';
import { getPersonaLabel } from '../utils';
import { PersonaAvatar, RadarChart, ScoreRing } from './Visuals';

type ResponseLatencyAction = 'start_typing' | 'push_to_talk' | 'send_text';

type ResponseLatencyEvent = {
  aiMessageKey: string;
  action: ResponseLatencyAction;
  latencyMs: number;
  capturedAt: string;
};

export function LiveSessionView({
  personas,
}: {
  personas: Persona[];
}) {
  const primaryPersona = personas[0];
  const sessionTitle = getPersonaLabel(personas);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const sessionTime = useMemo(() => formatSessionTime(elapsedSeconds), [elapsedSeconds]);
  const conversationMessages = useMemo(() => {
    let personaTurn = 0;

    return liveMessages.map((message) => {
      if (message.align === 'right') {
        return { message, persona: undefined };
      }

      const persona = personas[personaTurn % personas.length] ?? primaryPersona;
      personaTurn += 1;

      return { message, persona };
    });
  }, [personas, primaryPersona]);
  const latestAiMessageKey = useMemo(() => {
    const latestAiMessage = [...conversationMessages].reverse().find(({ message }) => message.align === 'left');

    return latestAiMessage ? `${latestAiMessage.message.speaker}:${latestAiMessage.message.text}` : 'session-start';
  }, [conversationMessages]);
  const aiResponseStartedAtRef = useRef(Date.now());
  const trackedLatencyKeysRef = useRef(new Set<string>());
  const responseLatencyEventsRef = useRef<ResponseLatencyEvent[]>([]);
  const [isPushToTalkListening, setIsPushToTalkListening] = useState(false);

  const trackResponseLatency = (action: ResponseLatencyAction) => {
    const eventKey = `${latestAiMessageKey}:${action}`;

    if (trackedLatencyKeysRef.current.has(eventKey)) {
      return;
    }

    trackedLatencyKeysRef.current.add(eventKey);
    responseLatencyEventsRef.current.push({
      aiMessageKey: latestAiMessageKey,
      action,
      latencyMs: Date.now() - aiResponseStartedAtRef.current,
      capturedAt: new Date().toISOString(),
    });
  };

  const togglePushToTalk = () => {
    setIsPushToTalkListening((current) => {
      if (!current) {
        trackResponseLatency('push_to_talk');
      }

      return !current;
    });
  };

  useEffect(() => {
    const startedAt = Date.now();
    const timerId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    aiResponseStartedAtRef.current = Date.now();
    trackedLatencyKeysRef.current.clear();
  }, [latestAiMessageKey]);

  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(220px,240px)] xl:items-start">
      <aside className="order-2 grid min-w-0 max-w-full content-start gap-2 overflow-hidden rounded-lg border border-border bg-card p-3 shadow-sm xl:sticky xl:top-20">
        <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-secondary/35 p-3">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <span className="shrink-0">
              <Badge tone={difficultyMeta[primaryPersona.difficulty].tone}>
                {personas.length > 1 ? 'Multi' : difficultyMeta[primaryPersona.difficulty].label}
              </Badge>
            </span>
            <span className="min-w-0 truncate text-right text-xs font-semibold text-primary">Trust 64%</span>
          </div>
          <h2 className="mt-2 truncate text-sm font-semibold text-foreground">{sessionTitle}</h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {personas.map((persona) => persona.subtitle).join(' · ')}
          </p>
        </div>

        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-background/70 p-2">
              <p className="text-xs text-muted-foreground">Objection</p>
              <p className="mt-1 font-semibold text-foreground">
                {personas.some((persona) => persona.difficulty === 'hard') ? 'High' : 'Medium'}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background/70 p-2">
              <p className="text-xs text-muted-foreground">People</p>
              <p className="mt-1 font-semibold text-foreground">{personas.length}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background/70 p-2.5 text-left text-xs leading-5">
            <p className="font-semibold text-foreground">Session goal</p>
            <p className="mt-1 max-h-9 overflow-hidden text-muted-foreground">{primaryPersona.goal}</p>
          </div>
          <div className="grid min-w-0 gap-2 text-left">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Participants</p>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                {personas.length}
              </span>
            </div>
            <div className="grid min-w-0 gap-1.5">
              {personas.map((persona) => (
                <div
                  key={persona.id}
                  className="flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-background/70 py-1 pl-1 pr-2"
                >
                  <PersonaAvatar persona={persona} className="h-5 w-5 text-[9px]" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-foreground">{persona.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{persona.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="order-1 grid min-h-[calc(100vh-170px)] min-w-0 grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-primary/20 bg-card shadow-panel">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Conversation Log</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Q2 Promotion Senario · {sessionTitle}</h2>
          </div>
          <Badge tone="muted">{sessionTime} Session Time</Badge>
        </div>

        <div className="grid content-start gap-4 overflow-y-auto bg-secondary/20 p-5">
          {conversationMessages.map(({ message, persona }) => (
            <div
              key={`${message.speaker}-${message.text}`}
              className={['flex items-start gap-3', message.align === 'right' ? 'justify-end' : 'justify-start'].join(' ')}
            >
              {persona ? <PersonaAvatar persona={persona} className="h-8 w-8 text-xs" /> : null}
              <div
                className={[
                  'max-w-[760px] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm',
                  message.align === 'right'
                    ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-foreground',
                ].join(' ')}
              >
                <p className="mb-1 text-xs font-semibold opacity-75">
                  {persona ? `${persona.name} · ${persona.subtitle}` : message.speaker}
                </p>
                <p>{message.text}</p>
              </div>
              {message.align === 'right' ? (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  <FiUser className="h-4 w-4" />
                </div>
              ) : null}
            </div>
          ))}
          <div className="flex items-start gap-3">
            <PersonaAvatar persona={personas[Math.min(1, personas.length - 1)]} className="h-8 w-8 text-xs" />
            <div className="max-w-[760px] rounded-lg border-l-4 border-primary bg-primary/10 px-4 py-3 text-sm leading-6 text-foreground">
              <p className="mb-1 text-xs font-semibold text-primary">
                {personas[Math.min(1, personas.length - 1)]?.name ?? 'AI Customer'} is speaking...
              </p>
              <p>ถ้าคุณบอกว่าลดเวลา onboarding ได้ ผมอยากเห็นว่าจะวัดผลยังไงในเดือนแรก</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-border bg-card p-4">
          <label className="grid min-w-0 gap-2">
            <span className="text-xs font-semibold text-foreground">Message</span>
            <div className="grid min-w-0 gap-3 rounded-lg border border-border bg-background p-3">
              <textarea
                className="min-h-20 w-full resize-none bg-transparent text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="Type your response instead..."
                defaultValue="ผมจะวัดจาก completion rate ของ onboarding และ score เฉลี่ยหลัง review ครั้งที่ 1-3 ครับ"
                onChange={() => trackResponseLatency('start_typing')}
              />
              {isPushToTalkListening ? (
                <div className="grid gap-2 rounded-lg border border-primary/20 bg-primary/8 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="relative grid h-3 w-3 shrink-0 place-items-center">
                        <span className="absolute h-3 w-3 animate-ping rounded-full bg-primary/50" />
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      </span>
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-primary">Listening</p>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">voice input active</p>
                  </div>
                  <VoiceInputMeter />
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant={isPushToTalkListening ? 'primary' : 'secondary'}
                  className="justify-center sm:w-auto"
                  aria-label={isPushToTalkListening ? 'Stop recording' : 'Push to talk'}
                  aria-pressed={isPushToTalkListening}
                  onClick={togglePushToTalk}
                >
                  {isPushToTalkListening ? <FiSquare className="h-4 w-4" /> : <FiMic className="h-4 w-4" />}
                  {isPushToTalkListening ? 'Stop recording' : 'Push to talk'}
                </Button>
                <Button type="button" className="justify-center sm:w-auto" onClick={() => trackResponseLatency('send_text')}>
                  <FiSend className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </label>
        </div>
      </section>
    </main>
  );
}

function VoiceInputMeter() {
  const levels = [34, 58, 42, 72, 48, 64, 38, 80, 52, 70, 44, 62, 36, 54, 40, 66, 46, 74];

  return (
    <div className="flex h-10 items-center gap-1 overflow-hidden rounded-full bg-background/80 px-3" aria-hidden="true">
      {levels.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="inline-block w-1 shrink-0 animate-pulse rounded-full bg-primary"
          style={{
            height: `${height}%`,
            animationDelay: `${index * 70}ms`,
            animationDuration: `${650 + (index % 4) * 120}ms`,
          }}
        />
      ))}
      <span className="ml-2 h-6 w-px animate-pulse bg-primary/60" />
      {levels.slice(0, 8).map((height, index) => (
        <span
          key={`tail-${height}-${index}`}
          className="inline-block w-1 shrink-0 animate-pulse rounded-full bg-primary/30"
          style={{
            height: `${Math.max(18, height - 20)}%`,
            animationDelay: `${(index + 18) * 70}ms`,
            animationDuration: `${720 + (index % 3) * 140}ms`,
          }}
        />
      ))}
    </div>
  );
}

function formatSessionTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function SummaryView({
  session,
  personas,
  previousSession,
  onBack,
  onNewSession,
}: {
  session: Session;
  personas: Persona[];
  previousSession?: Session;
  onBack: () => void;
  onNewSession: () => void;
}) {
  const improvement = previousSession ? session.score - previousSession.score : 12;

  return (
    <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
      <section className="grid justify-items-center gap-3 text-center">
        <Badge tone="success">
          <FiCheckCircle className="mr-1 h-3.5 w-3.5" />
          Session Complete
        </Badge>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          สรุปผล Senario กับ {getPersonaLabel(personas)}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          ระบบบันทึกผล session นี้ไว้แล้ว เพื่อเทียบกับ session ก่อนหน้าและดูพัฒนาการด้วย radar chart
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="grid min-w-0 justify-items-center gap-3 p-4">
          <ScoreRing score={session.score} size={128} />
          <Badge tone={improvement >= 0 ? 'success' : 'warning'}>
            {improvement >= 0 ? '+' : ''}
            {improvement} vs last session
          </Badge>
          <div className="grid w-full grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-secondary/55 p-2.5">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground">{session.duration}</p>
            </div>
            <div className="rounded-lg bg-secondary/55 p-2.5">
              <p className="text-xs text-muted-foreground">Turns</p>
              <p className="font-semibold text-foreground">{session.turns}</p>
            </div>
          </div>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Core Competency Analysis</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">คะแนนราย competency จาก session ล่าสุด</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {competencyLabels.map((label) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="font-semibold text-muted-foreground">{session.competencies[label]}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${session.competencies[label]}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Radar Comparison</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              เปรียบเทียบ competency ของ session ล่าสุดกับ session ก่อนหน้าของ persona เดียวกัน
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
            <RadarChart current={session.competencies} previous={previousSession?.competencies} height={192} />
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

        <div className="grid gap-5">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle>Areas of Strength</CardTitle>
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
              <CardTitle>Opportunities for Growth</CardTitle>
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
      </section>

      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back to overview
        </Button>
        <Button type="button" onClick={onNewSession}>
          <FiMic className="h-4 w-4" />
          Start new session
        </Button>
      </div>
    </main>
  );
}

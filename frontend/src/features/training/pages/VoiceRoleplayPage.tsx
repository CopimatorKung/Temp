import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiGrid,
  FiMinusCircle,
  FiMic,
  FiPlus,
  FiSearch,
  FiSliders,
  FiStopCircle,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { buildPath, routes } from '../../../app/routes';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Field';
import { Portal } from '../../../components/ui/Portal';
import {
  LatestOutcomePanel,
  MeetingRoomCard,
  PersonaCard,
  PersonaManagementHeader,
  RadarPanel,
  SessionHistoryCard,
  StatGrid,
} from '../voice-roleplay/components/RoleplayCards';
import {
  MeetingRoomModal,
  PersonaModal,
  PersonaSelectModal,
  SessionDetailView,
} from '../voice-roleplay/components/RoleplayModals';
import { RoleplayTabs } from '../voice-roleplay/components/RoleplayTabs';
import { LiveSessionView, SummaryView } from '../voice-roleplay/components/SessionViews';
import { initialMeetingRooms, initialPersonas, initialSessions } from '../voice-roleplay/mock-data';
import type { MeetingRoom, MeetingRoomForm, PageMode, Persona, PersonaForm, RoleplayTab, Session } from '../voice-roleplay/types';
import { findPreviousComparableSession, getSessionPersonas } from '../voice-roleplay/utils';

export function VoiceRoleplayPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const [personas, setPersonas] = useState(initialPersonas);
  const [meetingRooms, setMeetingRooms] = useState(initialMeetingRooms);
  const [sessions, setSessions] = useState(initialSessions);
  const [selectedPersonaId, setSelectedPersonaId] = useState(initialPersonas[1].id);
  const [activePersonaIds, setActivePersonaIds] = useState<string[]>([initialPersonas[1].id]);
  const [activeMeetingRoomId, setActiveMeetingRoomId] = useState<string | undefined>(undefined);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<PageMode>('overview');
  const [activeTab, setActiveTab] = useState<RoleplayTab>('session-history');
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [creatingPersona, setCreatingPersona] = useState(false);
  const [creatingMeetingRoom, setCreatingMeetingRoom] = useState(false);
  const [choosingPersona, setChoosingPersona] = useState(false);
  const [viewingMeetingRoomId, setViewingMeetingRoomId] = useState<string | null>(null);

  const selectedPersona = personas.find((persona) => persona.id === selectedPersonaId) ?? personas[0];
  const activePersonas = activePersonaIds
    .map((personaId) => personas.find((persona) => persona.id === personaId))
    .filter((persona): persona is (typeof personas)[number] => Boolean(persona));
  const effectiveActivePersonas = activePersonas.length > 0 ? activePersonas : [selectedPersona];
  const editingPersona = personas.find((persona) => persona.id === editingPersonaId);
  const completedSession = sessions.find((session) => session.id === completedSessionId) ?? sessions[0];
  const completedPersonas = getSessionPersonas(completedSession, personas);
  const viewingSession = sessionId ? sessions.find((session) => session.id === sessionId) : undefined;
  const viewingPersonas = viewingSession ? getSessionPersonas(viewingSession, personas) : [];
  const viewingMeetingRoom = viewingSession?.meetingRoomId
    ? meetingRooms.find((room) => room.id === viewingSession.meetingRoomId)
    : undefined;

  const averageScore = useMemo(
    () => Math.round(sessions.reduce((total, session) => total + session.score, 0) / sessions.length),
    [sessions],
  );

  const savePersona = (form: PersonaForm) => {
    if (editingPersonaId) {
      setPersonas((current) =>
        current.map((persona) => (persona.id === editingPersonaId ? { ...persona, ...form } : persona)),
      );
      return;
    }

    const id = `persona-${Date.now()}`;
    setPersonas((current) => [{ id, ...form, sessions: 0, avatar: form.name.trim().slice(0, 1) || 'P' }, ...current]);
    setSelectedPersonaId(id);
  };

  const saveMeetingRoom = (form: MeetingRoomForm) => {
    const id = `room-${Date.now()}`;
    setMeetingRooms((current) => [{ id, ...form }, ...current]);
  };

  const startSession = (personaIds: string[], meetingRoomId?: string) => {
    const nextPersonaIds = personaIds.length > 0 ? personaIds : [selectedPersona.id];
    setActivePersonaIds(nextPersonaIds);
    setActiveMeetingRoomId(meetingRoomId);
    setSelectedPersonaId(nextPersonaIds[0]);
    setChoosingPersona(false);
    setMode('session');
  };

  const toggleMeetingRoom = (room: MeetingRoom) => {
    if (activeMeetingRoomId === room.id) {
      setActiveMeetingRoomId(undefined);
      setActivePersonaIds([selectedPersonaId]);
      return;
    }

    setActiveMeetingRoomId(room.id);
    setActivePersonaIds(room.personaIds);
    setSelectedPersonaId(room.personaIds[0] ?? selectedPersonaId);
  };

  const updateMeetingRoomPersona = (roomId: string, personaId: string, action: 'add' | 'remove') => {
    setMeetingRooms((current) =>
      current.map((room) => {
        if (room.id !== roomId) {
          return room;
        }

        if (action === 'add') {
          return room.personaIds.includes(personaId) ? room : { ...room, personaIds: [...room.personaIds, personaId] };
        }

        if (room.personaIds.length <= 1) {
          return room;
        }

        const nextPersonaIds = room.personaIds.filter((id) => id !== personaId);
        return { ...room, personaIds: nextPersonaIds.length > 0 ? nextPersonaIds : room.personaIds };
      }),
    );

    setActivePersonaIds((current) => {
      if (activeMeetingRoomId !== roomId) {
        return current;
      }

      if (action === 'add') {
        return current.includes(personaId) ? current : [...current, personaId];
      }

      return current.length <= 1 ? current : current.filter((id) => id !== personaId);
    });
  };

  const finishSession = () => {
    const id = `vr-${Date.now()}`;
    const activeRoom = meetingRooms.find((room) => room.id === activeMeetingRoomId);
    const sessionNumber =
      sessions.filter((session) =>
        session.personaIds.some((personaId) => effectiveActivePersonas.some((persona) => persona.id === personaId)),
      ).length + 1;
    const newSession: Session = {
      id,
      personaIds: effectiveActivePersonas.map((persona) => persona.id),
      meetingRoomId: activeMeetingRoomId,
      title: `${activeRoom?.name ?? `${effectiveActivePersonas.length} personas`} Session ${sessionNumber}`,
      date: 'เมื่อสักครู่',
      duration: '08m',
      score: 86,
      turns: 16,
      outcome: 'คุมบทสนทนาได้ดีขึ้น ถาม pain point ชัด และปิด next step ได้ครบ',
      meetingGoal: activeRoom?.description ?? 'ฝึกสนทนากับ AI persona เพื่อประเมิน discovery, objection และ closing',
      improvementSuggestion: 'ต่อยอดด้วยการทวน pain point ก่อนปิด next step และบันทึก proof point ที่ใช้ในคำตอบ',
      conversation: [
        {
          id: `${id}-c1`,
          speakerType: 'persona',
          personaId: effectiveActivePersonas[0]?.id,
          timestamp: '00:00',
          text: 'ช่วยอธิบายให้เห็นหน่อยว่า Pitchsmith จะช่วยทีมขายใหม่ให้พร้อมก่อนเจอลูกค้าจริงได้ยังไง',
        },
        {
          id: `${id}-c2`,
          speakerType: 'seller',
          timestamp: '00:42',
          text: 'ระบบให้ทีมซ้อมกับ persona ที่ใกล้เคียงลูกค้าจริง แล้ววิเคราะห์ทักษะการตอบ objection, product knowledge และ next step ครับ',
          feedback: 'ตอบชัดและโยงกับ pain onboarding ได้ดี',
        },
      ],
      competencies: { Discovery: 84, Objection: 82, Value: 88, Compliance: 90, Closing: 86 },
      strengths: ['จับ pain point และโยงกับ value proposition ได้ชัด', 'ตอบ objection โดยไม่ overclaim และมี next step'],
      growth: ['เว้นจังหวะให้ลูกค้าพูดมากขึ้นหลังถามคำถามสำคัญ', 'เพิ่ม proof point ที่เฉพาะเจาะจงกับอุตสาหกรรมของลูกค้า'],
    };

    setSessions((current) => [newSession, ...current]);
    setPersonas((current) =>
      current.map((persona) =>
        effectiveActivePersonas.some((activePersona) => activePersona.id === persona.id)
          ? { ...persona, sessions: persona.sessions + 1 }
          : persona,
      ),
    );
    setCompletedSessionId(id);
    setMode('summary');
  };

  if (sessionId) {
    return (
      <SenarioSessionPage
        session={viewingSession}
        personas={viewingPersonas}
        meetingRoom={viewingMeetingRoom}
        previousSession={viewingSession ? findPreviousComparableSession(viewingSession, sessions) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleplayHeader
        mode={mode}
        onBackFromSession={() => setMode('overview')}
        onEndSession={finishSession}
        onStartSession={() => setChoosingPersona(true)}
      />

      {mode === 'session' ? (
        <LiveSessionView personas={effectiveActivePersonas} />
      ) : mode === 'summary' ? (
        <SummaryView
          session={completedSession}
          personas={completedPersonas.length > 0 ? completedPersonas : effectiveActivePersonas}
          previousSession={findPreviousComparableSession(completedSession, sessions)}
          onBack={() => setMode('overview')}
          onNewSession={() => setChoosingPersona(true)}
        />
      ) : (
        <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
          <RoleplayTabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === 'session-history' ? (
            <SessionHistoryTab
              sessions={sessions}
              personas={personas}
              averageScore={averageScore}
              onOpenSession={(id) => navigate(buildPath.voiceRoleplaySession({ sessionId: id }))}
              onStartSession={() => setChoosingPersona(true)}
            />
          ) : activeTab === 'persona-management' ? (
            <PersonaManagementTab
              personas={personas}
              selectedPersonaId={selectedPersonaId}
              onCreatePersona={() => setCreatingPersona(true)}
              onEditPersona={setEditingPersonaId}
              onSelectPersona={setSelectedPersonaId}
            />
          ) : (
            <MeetingRoomTab
              meetingRooms={meetingRooms}
              personas={personas}
              sessions={sessions}
              activeMeetingRoomId={activeMeetingRoomId}
              viewingMeetingRoomId={viewingMeetingRoomId}
              onCreateMeetingRoom={() => setCreatingMeetingRoom(true)}
              onToggleMeetingRoom={toggleMeetingRoom}
              onOpenMeetingRoom={setViewingMeetingRoomId}
              onAddPersona={(roomId, personaId) => updateMeetingRoomPersona(roomId, personaId, 'add')}
              onRemovePersona={(roomId, personaId) => updateMeetingRoomPersona(roomId, personaId, 'remove')}
            />
          )}
        </main>
      )}

      {creatingPersona ? (
        <PersonaModal
          onClose={() => setCreatingPersona(false)}
          onSave={(form) => {
            savePersona(form);
            setCreatingPersona(false);
          }}
        />
      ) : null}
      {editingPersona ? (
        <PersonaModal
          persona={editingPersona}
          onClose={() => setEditingPersonaId(null)}
          onSave={(form) => {
            savePersona(form);
            setEditingPersonaId(null);
          }}
        />
      ) : null}
      {creatingMeetingRoom ? (
        <MeetingRoomModal
          personas={personas}
          onClose={() => setCreatingMeetingRoom(false)}
          onSave={(form) => {
            saveMeetingRoom(form);
            setCreatingMeetingRoom(false);
          }}
        />
      ) : null}
      {choosingPersona ? (
        <PersonaSelectModal
          personas={personas}
          meetingRooms={meetingRooms}
          initialPersonaIds={activePersonaIds}
          initialMeetingRoomId={activeMeetingRoomId}
          onClose={() => setChoosingPersona(false)}
          onStart={startSession}
        />
      ) : null}
    </div>
  );
}

function SenarioSessionPage({
  session,
  personas,
  meetingRoom,
  previousSession,
}: {
  session?: Session;
  personas: typeof initialPersonas;
  meetingRoom?: MeetingRoom;
  previousSession?: Session;
}) {
  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card px-5 py-5 lg:px-8">
          <Link to={routes.voiceRoleplay} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <FiArrowLeft className="h-4 w-4" />
            Back to Senario
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-foreground">Session not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">ไม่พบข้อมูลของ session นี้</p>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-5 py-5 lg:px-8">
        <Link to={routes.voiceRoleplay} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <FiArrowLeft className="h-4 w-4" />
          Back to Senario
        </Link>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{session.title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {session.date} · {session.duration} · {personas.length} personas
            </p>
          </div>
          <BadgeSummary score={session.score} />
        </div>
      </header>

      <main className="grid min-w-0 gap-5 p-4 md:p-5 lg:p-6">
        <SessionDetailView session={session} personas={personas} meetingRoom={meetingRoom} previousSession={previousSession} />
      </main>
    </div>
  );
}

function BadgeSummary({ score }: { score: number }) {
  return (
    <div className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm shadow-sm">
      <p className="text-xs font-medium text-muted-foreground">Session score</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{score}/100</p>
    </div>
  );
}

function RoleplayHeader({
  mode,
  onBackFromSession,
  onEndSession,
  onStartSession,
}: {
  mode: PageMode;
  onBackFromSession: () => void;
  onEndSession: () => void;
  onStartSession: () => void;
}) {
  const isLiveSession = mode === 'session';

  return (
    <header className="border-b border-border bg-card px-5 py-4 lg:px-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_auto] xl:items-end">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {isLiveSession ? 'Live Senario Session' : 'เลือก AI Customer เพื่อฝึก Senario ผ่านเสียง'}
          </h1>
          <p className="mt-1.5 max-w-3xl text-xs leading-5 text-muted-foreground">
            {isLiveSession
              ? 'กำลังฝึกสนทนากับ AI โฟกัสที่บทสนทนา การพูด และคำตอบที่ได้รับ'
              : 'เลือกลูกค้า AI ห้องประชุม และสถานการณ์ เพื่อเริ่มฝึกสนทนาผ่านเสียงพร้อมข้อมูลจากคู่มือ'}
          </p>
        </div>
        {isLiveSession ? (
          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Button type="button" variant="secondary" onClick={onBackFromSession}>
              <FiArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="button" variant="destructive" onClick={onEndSession}>
              <FiStopCircle className="h-4 w-4" />
              End session
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onStartSession}>
              <FiMic className="h-4 w-4" />
              Start session
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function SessionHistoryTab({
  sessions,
  personas,
  averageScore,
  onOpenSession,
  onStartSession,
}: {
  sessions: typeof initialSessions;
  personas: typeof initialPersonas;
  averageScore: number;
  onOpenSession: (sessionId: string) => void;
  onStartSession: () => void;
}) {
  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid min-w-0 content-start gap-5">
        <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">พร้อมฝึกแล้วไหม?</p>
            <p className="mt-1 text-base font-semibold text-foreground">เริ่ม Senario Session ใหม่</p>
            <p className="mt-1 text-sm text-muted-foreground">เลือก AI Customer และสถานการณ์ แล้วฝึกสนทนาผ่านเสียง</p>
          </div>
          <Button type="button" onClick={onStartSession}>
            <FiMic className="h-4 w-4" />
            Start session
          </Button>
        </div>
        <StatGrid
          stats={[
            { label: 'Past sessions', value: sessions.length, icon: FiClock },
            { label: 'Avg score', value: `${averageScore}/100`, icon: FiBarChart2 },
            { label: 'Latest score', value: `${sessions[0].score}/100`, icon: FiCheckCircle },
            { label: 'Active scenario', value: 'SME', icon: FiSliders },
          ]}
        />

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              ผล session ถูกบันทึกไว้เพื่อใช้เทียบ competency และ radar chart
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {sessions.slice(0, 6).map((session) => (
                <SessionHistoryCard
                  key={session.id}
                  session={session}
                  personas={personas}
                  onOpen={() => onOpenSession(session.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="grid min-w-0 content-start gap-5">
        <RadarPanel current={sessions[0]} previous={sessions[1]} />
        <LatestOutcomePanel session={sessions[0]} />
      </aside>
    </section>
  );
}

function PersonaManagementTab({
  personas,
  selectedPersonaId,
  onCreatePersona,
  onEditPersona,
  onSelectPersona,
}: {
  personas: typeof initialPersonas;
  selectedPersonaId: string;
  onCreatePersona: () => void;
  onEditPersona: (personaId: string) => void;
  onSelectPersona: (personaId: string) => void;
}) {
  return (
    <section className="grid min-w-0 gap-5">
      <div className="grid min-w-0 content-start gap-5">
        <StatGrid
          stats={[
            { label: 'Personas', value: personas.length, icon: FiUsers },
            { label: 'Published', value: personas.filter((persona) => persona.status === 'published').length, icon: FiCheckCircle },
            { label: 'Drafts', value: personas.filter((persona) => persona.status === 'draft').length, icon: FiEdit2 },
            { label: 'Active personas', value: personas.filter((persona) => persona.status === 'published').length, icon: FiUsers },
          ]}
        />

        <Card className="min-w-0 overflow-hidden">
          <PersonaManagementHeader onCreate={onCreatePersona} />
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {personas.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  selected={persona.id === selectedPersonaId}
                  onSelect={() => onSelectPersona(persona.id)}
                  onEdit={() => onEditPersona(persona.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function MeetingRoomTab({
  meetingRooms,
  personas,
  sessions,
  activeMeetingRoomId,
  viewingMeetingRoomId,
  onCreateMeetingRoom,
  onToggleMeetingRoom,
  onOpenMeetingRoom,
  onAddPersona,
  onRemovePersona,
}: {
  meetingRooms: typeof initialMeetingRooms;
  personas: typeof initialPersonas;
  sessions: typeof initialSessions;
  activeMeetingRoomId?: string;
  viewingMeetingRoomId: string | null;
  onCreateMeetingRoom: () => void;
  onToggleMeetingRoom: (room: MeetingRoom) => void;
  onOpenMeetingRoom: (roomId: string | null) => void;
  onAddPersona: (roomId: string, personaId: string) => void;
  onRemovePersona: (roomId: string, personaId: string) => void;
}) {
  const multiStakeholderSessions = sessions.filter((session) => Boolean(session.meetingRoomId)).length;
  const viewingRoom = meetingRooms.find((room) => room.id === viewingMeetingRoomId) ?? null;

  return (
    <section className="grid min-w-0 gap-5">
      <StatGrid
        stats={[
          { label: 'Meeting rooms', value: meetingRooms.length, icon: FiGrid },
          { label: 'Published', value: meetingRooms.filter((room) => room.status === 'published').length, icon: FiCheckCircle },
          { label: 'Stakeholders', value: meetingRooms.reduce((total, room) => total + room.personaIds.length, 0), icon: FiUsers },
          { label: 'Room sessions', value: multiStakeholderSessions, icon: FiClock },
        ]}
      />

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Meeting Room</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              สร้างห้อง Senario ที่มีหลาย persona เช่น manager, procurement และ technical team
            </p>
          </div>
          <Button type="button" onClick={onCreateMeetingRoom}>
            <FiPlus className="h-4 w-4" />
            Create room
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {meetingRooms.map((room) => (
              <MeetingRoomCard
                key={room.id}
                room={room}
                personas={personas}
                selected={room.id === activeMeetingRoomId}
                onOpen={() => onOpenMeetingRoom(room.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {viewingRoom ? (
        <MeetingRoomDetailPanel
          room={viewingRoom}
          personas={personas}
          isActiveMeeting={viewingRoom.id === activeMeetingRoomId}
          onClose={() => onOpenMeetingRoom(null)}
          onAddPersona={(personaId) => onAddPersona(viewingRoom.id, personaId)}
          onRemovePersona={(personaId) => onRemovePersona(viewingRoom.id, personaId)}
          onToggleMeeting={() => onToggleMeetingRoom(viewingRoom)}
        />
      ) : null}
    </section>
  );
}

function MeetingRoomDetailPanel({
  room,
  personas,
  isActiveMeeting,
  onClose,
  onAddPersona,
  onRemovePersona,
  onToggleMeeting,
}: {
  room: MeetingRoom;
  personas: Persona[];
  isActiveMeeting: boolean;
  onClose: () => void;
  onAddPersona: (personaId: string) => void;
  onRemovePersona: (personaId: string) => void;
  onToggleMeeting: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const roomPersonas = room.personaIds
    .map((personaId) => personas.find((persona) => persona.id === personaId))
    .filter((persona): persona is Persona => Boolean(persona));
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const availablePersonas = personas.filter((persona) => {
    if (room.personaIds.includes(persona.id)) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [persona.name, persona.subtitle, persona.company, persona.description, ...persona.traits]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch);
  });
  const canRemovePersona = room.personaIds.length > 1;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/24 p-4 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="meeting-room-detail-title"
          className="grid max-h-[92vh] w-full max-w-4xl grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-border bg-card shadow-panel"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="border-b border-border px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Meeting Room</p>
                  <Badge tone={room.status === 'published' ? 'success' : 'muted'}>{room.status}</Badge>
                  {isActiveMeeting ? <Badge>active meeting</Badge> : null}
                </div>
                <h2 id="meeting-room-detail-title" className="mt-1 text-xl font-semibold text-foreground">
                  {room.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{room.scenario}</p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{room.description}</p>
              </div>
              <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close meeting room">
                <FiX className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="min-h-0 overflow-y-auto p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="grid content-start gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-foreground">Personas in room</h3>
                  <Badge tone="muted">{roomPersonas.length} personas</Badge>
                </div>
                <div className="grid gap-2">
                  {roomPersonas.map((persona) => (
                    <RoomPersonaRow
                      key={persona.id}
                      persona={persona}
                      actionLabel="Remove"
                      actionIcon={<FiMinusCircle className="h-4 w-4" />}
                      disabled={!canRemovePersona}
                      onAction={() => onRemovePersona(persona.id)}
                    />
                  ))}
                </div>
                {!canRemovePersona ? <p className="text-xs text-muted-foreground">ต้องมีอย่างน้อย 1 persona เพื่อใช้เริ่ม voice Senario</p> : null}
              </div>

              <div className="grid content-start gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-foreground">Append persona</h3>
                  <Badge tone="muted">{availablePersonas.length} found</Badge>
                </div>
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-9"
                    placeholder="Search persona, company, trait"
                    autoFocus
                  />
                </label>
                <div className="grid gap-2">
                  {availablePersonas.length > 0 ? (
                    availablePersonas.map((persona) => (
                      <RoomPersonaRow
                        key={persona.id}
                        persona={persona}
                        actionLabel="Append"
                        actionIcon={<FiPlus className="h-4 w-4" />}
                        onAction={() => onAddPersona(persona.id)}
                      />
                    ))
                  ) : (
                    <div className="rounded-lg border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                      ไม่พบ persona ที่ตรงกับคำค้น หรือทุก persona ถูกเพิ่มในห้องนี้แล้ว
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="button" variant={isActiveMeeting ? 'secondary' : 'primary'} onClick={onToggleMeeting}>
              {isActiveMeeting ? <FiMinusCircle className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
              {isActiveMeeting ? 'Unset active room' : 'Use this room'}
            </Button>
          </footer>
        </div>
      </div>
    </Portal>
  );
}

function RoomPersonaRow({
  persona,
  actionLabel,
  actionIcon,
  disabled = false,
  onAction,
}: {
  persona: Persona;
  actionLabel: string;
  actionIcon: ReactNode;
  disabled?: boolean;
  onAction: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-background/70 px-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{persona.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{persona.subtitle} · {persona.company}</p>
      </div>
      <Button type="button" variant="secondary" className="h-9 px-3" disabled={disabled} onClick={onAction}>
        {actionIcon}
        {actionLabel}
      </Button>
    </div>
  );
}

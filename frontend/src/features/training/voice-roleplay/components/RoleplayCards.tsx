import type { ComponentType } from 'react';
import { FiCheckCircle, FiEdit2, FiMinusCircle, FiPlus, FiUser, FiUsers } from 'react-icons/fi';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { difficultyMeta } from '../constants';
import type { MeetingRoom, Persona, Session } from '../types';
import { getPersonaLabel, getSessionPersonas } from '../utils';
import { PersonaAvatar, RadarChart } from './Visuals';

function PersonaAvatarStack({
  personas,
  maxVisible = 3,
  avatarClassName = 'h-11 w-11 border-card text-base',
}: {
  personas: Persona[];
  maxVisible?: number;
  avatarClassName?: string;
}) {
  const visiblePersonas = personas.slice(0, maxVisible);
  const hiddenCount = Math.max(personas.length - visiblePersonas.length, 0);

  return (
    <div className="flex min-w-0 -space-x-2" aria-label={`${personas.length} personas`}>
      {visiblePersonas.map((persona) => (
        <PersonaAvatar key={persona.id} persona={persona} className={avatarClassName} />
      ))}
      {hiddenCount > 0 ? (
        <div
          className={[
            'inline-flex shrink-0 items-center justify-center rounded-full border border-card bg-secondary',
            'font-semibold text-secondary-foreground shadow-sm',
            avatarClassName,
          ].join(' ')}
          title={`${hiddenCount} more personas`}
        >
          +{hiddenCount}
        </div>
      ) : null}
    </div>
  );
}

export function StatGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string | number; icon: ComponentType<{ className?: string }> }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <stat.icon className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-1 truncate text-xl font-semibold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function PersonaCard({
  persona,
  selected,
  onSelect,
  onEdit,
}: {
  persona: Persona;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}) {
  const difficulty = difficultyMeta[persona.difficulty];

  return (
    <article
      className={[
        'grid min-w-0 gap-4 rounded-lg border p-4 transition',
        selected ? 'border-primary bg-primary/8 shadow-panel' : 'border-border bg-card hover:bg-secondary/40',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PersonaAvatar persona={persona} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-foreground">{persona.name}</h3>
              <Badge tone={persona.status === 'published' ? 'success' : 'muted'}>{persona.status}</Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{persona.subtitle}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{persona.company}</p>
          </div>
        </div>
        <span className={['rounded-full border px-2.5 py-1 text-xs font-medium', difficulty.accent].join(' ')}>
          {difficulty.label}
        </span>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">{persona.description}</p>

      <div className="flex flex-wrap gap-2">
        {persona.traits.map((trait) => (
          <span
            key={trait}
            className="rounded-full border border-border bg-secondary/55 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            {trait}
          </span>
        ))}
      </div>

      <div className="grid gap-2 rounded-lg border border-border bg-background/70 p-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Goal</p>
          <p className="mt-1 text-foreground">{persona.goal}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Main objection</p>
          <p className="mt-1 text-foreground">{persona.objection}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="flex-1" variant={selected ? 'primary' : 'secondary'} onClick={onSelect}>
          <FiUser className="h-4 w-4" />
          {selected ? 'Selected persona' : 'Select persona'}
        </Button>
        <Button type="button" variant="ghost" onClick={onEdit}>
          <FiEdit2 className="h-4 w-4" />
          Edit
        </Button>
      </div>
    </article>
  );
}

export function MeetingRoomCard({
  room,
  personas,
  selected,
  onToggle,
}: {
  room: MeetingRoom;
  personas: Persona[];
  selected: boolean;
  onToggle: () => void;
}) {
  const roomPersonas = room.personaIds
    .map((personaId) => personas.find((persona) => persona.id === personaId))
    .filter((persona): persona is Persona => Boolean(persona));

  return (
    <article
      className={[
        'grid gap-3 rounded-lg border p-4 transition',
        selected ? 'border-primary bg-primary/8 shadow-panel' : 'border-border bg-card hover:bg-secondary/35',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-foreground">{room.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{room.scenario}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {selected ? <Badge tone="default">in meeting</Badge> : null}
          <Badge tone={room.status === 'published' ? 'success' : 'muted'}>{room.status}</Badge>
        </div>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{room.description}</p>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PersonaAvatarStack personas={roomPersonas} avatarClassName="h-9 w-9 border-card text-xs" />
          <span className="text-xs font-medium text-muted-foreground">{roomPersonas.length} personas</span>
        </div>
        <Button type="button" variant={selected ? 'secondary' : 'primary'} onClick={onToggle}>
          {selected ? <FiMinusCircle className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
          {selected ? 'Remove from meeting' : 'Add to meeting'}
        </Button>
      </div>
    </article>
  );
}

export function SessionHistoryCard({
  session,
  personas,
  onOpen,
}: {
  session: Session;
  personas: Persona[];
  onOpen: () => void;
}) {
  const sessionPersonas = getSessionPersonas(session, personas);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-lg border border-border bg-card p-4 text-left transition hover:bg-secondary/35"
    >
      <div className="flex items-start gap-3">
        <PersonaAvatarStack personas={sessionPersonas} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{session.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getPersonaLabel(sessionPersonas)} · {session.date}
          </p>
        </div>
        <Badge tone={session.score >= 80 ? 'success' : 'warning'}>{session.score}/100</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-secondary/55 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Duration</p>
          <p className="font-semibold text-foreground">{session.duration}</p>
        </div>
        <div className="rounded-lg bg-secondary/55 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Turns</p>
          <p className="font-semibold text-foreground">{session.turns}</p>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          <FiCheckCircle className="h-3.5 w-3.5" />
          AI feedback
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{session.outcome}</p>
      </div>
    </button>
  );
}

export function LatestOutcomePanel({ session }: { session: Session }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Latest Outcome</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{session.title}</p>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        {session.strengths.map((item) => (
          <div key={item} className="flex gap-3 leading-6">
            <FiCheckCircle className="mt-1 h-4 w-4 shrink-0 text-success" />
            <span className="text-muted-foreground">{item}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RadarPanel({ current, previous }: { current: Session; previous?: Session }) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>Radar Comparison</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">session ล่าสุดเทียบ session ก่อนหน้า</p>
      </CardHeader>
      <CardContent>
        <RadarChart current={current.competencies} previous={previous?.competencies} />
      </CardContent>
    </Card>
  );
}

export function PersonaManagementHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <CardTitle>Persona Management</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          สร้าง แก้ไข และเลือก customer persona สำหรับ Senario session
        </p>
      </div>
      <Button type="button" onClick={onCreate}>
        <FiPlus className="h-4 w-4" />
        Create persona
      </Button>
    </CardHeader>
  );
}

import { useState } from 'react';
import { FiMic, FiShuffle, FiUsers } from 'react-icons/fi';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Portal } from '../../../../components/ui/Portal';
import { difficultyMeta } from '../constants';
import type { MeetingRoom, Persona } from '../types';
import { PersonaAvatar } from './Visuals';

type StartSource = 'personas' | 'meeting-room';

export function PersonaSelectModal({
  personas,
  meetingRooms,
  onClose,
  onStart,
}: {
  personas: Persona[];
  meetingRooms: MeetingRoom[];
  onClose: () => void;
  onStart: (personaIds: string[], meetingRoomId?: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([personas[0]?.id].filter(Boolean));
  const [source, setSource] = useState<StartSource>('personas');

  const togglePersona = (personaId: string) => {
    setSelectedIds((current) => {
      const exists = current.includes(personaId);
      const next = exists ? current.filter((id) => id !== personaId) : [...current, personaId];
      return next.length > 0 ? next : [personaId];
    });
  };

  const startRandom = () => {
    const shuffled = [...personas.filter((persona) => persona.status === 'published')].sort(() => Math.random() - 0.5);
    onStart(shuffled.slice(0, Math.min(3, shuffled.length)).map((persona) => persona.id));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select Senario persona"
          className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Start Session
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">เลือก source สำหรับ Senario</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                เริ่มจาก persona ที่เลือกเอง หรือใช้ Meeting Room ที่จัด stakeholder ไว้แล้ว
              </p>
            </div>
            <Button type="button" variant="ghost" className="h-9 px-3" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid max-h-[72vh] gap-5 overflow-y-auto p-5">
            <div className="inline-grid w-full gap-2 rounded-lg border border-border bg-background p-1 sm:w-fit sm:grid-cols-2">
              {[
                { id: 'personas', label: 'Use personas' },
                { id: 'meeting-room', label: 'Use meeting room' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSource(item.id as StartSource)}
                  className={[
                    'h-10 rounded-md px-4 text-sm font-semibold transition',
                    source === item.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {source === 'meeting-room' ? (
              <section className="grid gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">Meeting Room</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    เลือกห้องประชุมจำลองที่มี persona หลายคน เช่น manager, procurement และ technical team
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {meetingRooms.map((room) => {
                    const roomPersonas = room.personaIds
                      .map((personaId) => personas.find((persona) => persona.id === personaId))
                      .filter((persona): persona is Persona => Boolean(persona));

                    return (
                      <article key={room.id} className="grid gap-3 rounded-lg border border-border bg-background/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{room.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{room.scenario}</p>
                          </div>
                          <Badge tone={room.status === 'published' ? 'success' : 'muted'}>{room.status}</Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{room.description}</p>
                        <div className="flex -space-x-2">
                          {roomPersonas.map((persona) => (
                            <PersonaAvatar key={persona.id} persona={persona} className="h-9 w-9 border-card text-xs" />
                          ))}
                        </div>
                        <Button type="button" onClick={() => onStart(room.personaIds, room.id)}>
                          <FiUsers className="h-4 w-4" />
                          Start meeting room
                        </Button>
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section className="grid gap-5">
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/35 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Shuffle mode</p>
                    <p className="mt-1 text-sm text-muted-foreground">สุ่ม persona 2-3 คนเพื่อซ้อมสถานการณ์ buying committee</p>
                  </div>
                  <Button type="button" variant="secondary" onClick={startRandom}>
                    <FiShuffle className="h-4 w-4" />
                    Shuffle start
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Custom persona selection</h3>
                  <p className="mt-1 text-sm text-muted-foreground">เลือกได้หลาย persona เช่น 2 manager และ 1 technical team</p>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => onStart(selectedIds)}>
                    <FiMic className="h-4 w-4" />
                    Start selected ({selectedIds.length})
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {personas.map((persona) => {
                    const selected = selectedIds.includes(persona.id);

                    return (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => togglePersona(persona.id)}
                        className={[
                          'grid gap-4 rounded-lg border p-4 text-left transition',
                          selected ? 'border-primary bg-primary/10' : 'border-border bg-background/55 hover:bg-secondary/45',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-3">
                          <PersonaAvatar persona={persona} />
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-foreground">{persona.name}</p>
                            <p className="text-sm text-muted-foreground">{persona.subtitle}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{persona.company}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{persona.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={difficultyMeta[persona.difficulty].tone}>{difficultyMeta[persona.difficulty].label}</Badge>
                          {persona.traits.slice(0, 2).map((trait) => (
                            <span key={trait} className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

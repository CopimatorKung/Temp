import { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { Button } from '../../../../components/ui/Button';
import { Field, Input, Select } from '../../../../components/ui/Field';
import { Portal } from '../../../../components/ui/Portal';
import type { MeetingRoomForm, Persona, PersonaStatus } from '../types';
import { toMeetingRoomForm } from '../utils';
import { PersonaAvatar } from './Visuals';

export function MeetingRoomModal({
  personas,
  onClose,
  onSave,
}: {
  personas: Persona[];
  onClose: () => void;
  onSave: (room: MeetingRoomForm) => void;
}) {
  const [form, setForm] = useState<MeetingRoomForm>(() => toMeetingRoomForm(undefined, personas[0]?.id));

  const togglePersona = (personaId: string) => {
    setForm((current) => {
      const exists = current.personaIds.includes(personaId);
      const personaIds = exists
        ? current.personaIds.filter((id) => id !== personaId)
        : [...current.personaIds, personaId];

      return { ...current, personaIds: personaIds.length > 0 ? personaIds : [personaId] };
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create meeting room"
          className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Meeting Room
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Create Meeting Room</h2>
              <p className="mt-1 text-sm text-muted-foreground">กำหนดห้องประชุมจำลองที่มีหลาย persona ใน session เดียว</p>
            </div>
            <Button type="button" variant="ghost" className="h-9 px-3" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid max-h-[68vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
            <Field label="Room name">
              <Input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Procurement Committee"
              />
            </Field>
            <Field label="Scenario">
              <Input
                value={form.scenario}
                onChange={(event) => setForm((current) => ({ ...current, scenario: event.target.value }))}
              />
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as PersonaStatus }))}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </Select>
            </Field>
            <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </label>
            <div className="grid gap-3 md:col-span-2">
              <p className="text-sm font-semibold text-foreground">Personas in meeting room</p>
              <div className="grid gap-2 md:grid-cols-2">
                {personas.map((persona) => {
                  const checked = form.personaIds.includes(persona.id);

                  return (
                    <label
                      key={persona.id}
                      className={[
                        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition',
                        checked ? 'border-primary bg-primary/10' : 'border-border bg-background/60 hover:bg-secondary/45',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePersona(persona.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      <PersonaAvatar persona={persona} className="h-9 w-9 text-sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{persona.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{persona.subtitle}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onSave(form);
                onClose();
              }}
            >
              <FiSave className="h-4 w-4" />
              Save meeting room
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

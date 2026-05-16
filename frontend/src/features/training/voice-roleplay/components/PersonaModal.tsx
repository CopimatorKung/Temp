import { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { Button } from '../../../../components/ui/Button';
import { Field, Input, Select } from '../../../../components/ui/Field';
import { Portal } from '../../../../components/ui/Portal';
import type { Persona, PersonaForm, PersonaStatus } from '../types';
import { toPersonaForm } from '../utils';

export function PersonaModal({
  persona,
  onClose,
  onSave,
}: {
  persona?: Persona;
  onClose: () => void;
  onSave: (persona: PersonaForm) => void;
}) {
  const [form, setForm] = useState<PersonaForm>(() => toPersonaForm(persona));

  const update = <Key extends keyof PersonaForm>(key: Key, value: PersonaForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4 backdrop-blur-md">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={persona ? 'Edit persona' : 'Create persona'}
          className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Persona Management
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {persona ? 'Edit Persona' : 'Create Persona'}
              </h2>
            </div>
            <Button type="button" variant="ghost" className="h-9 px-3" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="grid max-h-[68vh] gap-4 overflow-y-auto p-5 md:grid-cols-2">
            <Field label="Persona name">
              <Input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="คุณเมย์" />
            </Field>
            <Field label="Persona type">
              <Input value={form.subtitle} onChange={(event) => update('subtitle', event.target.value)} />
            </Field>
            <Field label="Company / segment">
              <Input value={form.company} onChange={(event) => update('company', event.target.value)} />
            </Field>
            <Field label="Difficulty">
              <Select
                value={form.difficulty}
                onChange={(event) => update('difficulty', event.target.value as Persona['difficulty'])}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(event) => update('status', event.target.value as PersonaStatus)}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </Select>
            </Field>
            <Field label="Traits">
              <Input
                value={form.traits.join(', ')}
                onChange={(event) =>
                  update(
                    'traits',
                    event.target.value
                      .split(',')
                      .map((trait) => trait.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="non-tech, price-sensitive"
              />
            </Field>
            <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </label>
            <Field label="Conversation goal">
              <Input value={form.goal} onChange={(event) => update('goal', event.target.value)} />
            </Field>
            <Field label="Primary objection">
              <Input value={form.objection} onChange={(event) => update('objection', event.target.value)} />
            </Field>
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
              Save persona
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

import { useState } from 'react';
import { FiCode, FiSave } from 'react-icons/fi';
import { Button } from '../../../../components/ui/Button';
import { Field, Input, Select } from '../../../../components/ui/Field';
import { Portal } from '../../../../components/ui/Portal';
import type { Difficulty, Persona, PersonaForm, PersonaStatus } from '../types';
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
  const [yamlOpen, setYamlOpen] = useState(false);

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
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" className="h-9 px-3" onClick={() => setYamlOpen(true)} aria-label="Import persona YAML">
                <FiCode className="h-4 w-4" />
                YAML
              </Button>
              <Button type="button" variant="ghost" className="h-9 px-3" onClick={onClose}>
                Close
              </Button>
            </div>
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
        {yamlOpen ? (
          <PersonaYamlModal
            initialForm={form}
            onApply={(nextForm) => {
              setForm(nextForm);
              setYamlOpen(false);
            }}
            onClose={() => setYamlOpen(false)}
          />
        ) : null}
      </div>
    </Portal>
  );
}

function PersonaYamlModal({
  initialForm,
  onApply,
  onClose,
}: {
  initialForm: PersonaForm;
  onApply: (form: PersonaForm) => void;
  onClose: () => void;
}) {
  const [yamlText, setYamlText] = useState(() => personaFormToYaml(initialForm));
  const [error, setError] = useState<string | null>(null);

  const applyYaml = () => {
    const result = parsePersonaYaml(yamlText, initialForm);

    if ('error' in result) {
      setError(result.error);
      return;
    }

    setError(null);
    onApply(result.form);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/25 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Import persona YAML"
        className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card shadow-panel"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              YAML Persona
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Import persona from YAML</h3>
            <p className="mt-1 text-sm text-muted-foreground">วาง YAML ตาม standard แล้วกด Apply เพื่อเติมค่าใน persona form</p>
          </div>
          <Button type="button" variant="ghost" className="h-9 px-3" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid max-h-[62vh] gap-4 overflow-y-auto p-5">
          <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs leading-5 text-muted-foreground">
            <p className="font-semibold text-foreground">Supported keys</p>
            <p className="mt-1">
              `name`, `persona_type`, `company`, `difficulty`, `status`, `traits`, `description`, `goal`, `objection`
            </p>
            <p className="mt-1">Use `traits` as a YAML list. Use `|` for multi-line fields.</p>
          </div>

          <label className="grid gap-2 text-sm font-medium text-foreground">
            <span>Persona YAML</span>
            <textarea
              aria-label="Persona YAML"
              value={yamlText}
              onChange={(event) => setYamlText(event.target.value)}
              rows={16}
              spellCheck={false}
              className="font-mono w-full resize-y rounded-lg border border-input bg-white px-3 py-2 text-xs leading-5 outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={applyYaml}>
            <FiCode className="h-4 w-4" />
            Apply YAML
          </Button>
        </div>
      </div>
    </div>
  );
}

function personaFormToYaml(form: PersonaForm) {
  return [
    `name: ${form.name}`,
    `persona_type: ${form.subtitle}`,
    `company: ${form.company}`,
    `difficulty: ${form.difficulty}`,
    `status: ${form.status}`,
    'traits:',
    ...form.traits.map((trait) => `  - ${trait}`),
    'description: |',
    ...form.description.split('\n').map((line) => `  ${line}`),
    'goal: |',
    ...form.goal.split('\n').map((line) => `  ${line}`),
    'objection: |',
    ...form.objection.split('\n').map((line) => `  ${line}`),
  ].join('\n');
}

function parsePersonaYaml(rawYaml: string, fallback: PersonaForm): { form: PersonaForm } | { error: string } {
  const parsed: Record<string, string | string[]> = {};
  const lines = rawYaml.replace(/\r\n/g, '\n').split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim() || line.trim().startsWith('#')) {
      continue;
    }

    const pair = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);

    if (!pair) {
      continue;
    }

    const key = normalizePersonaYamlKey(pair[1]);
    const value = pair[2].trim();

    if (value === '|') {
      const blockLines: string[] = [];
      let cursor = index + 1;

      while (cursor < lines.length && (lines[cursor].startsWith(' ') || !lines[cursor].trim())) {
        blockLines.push(lines[cursor].replace(/^ {2}/, ''));
        cursor += 1;
      }

      parsed[key] = blockLines.join('\n').trim();
      index = cursor - 1;
      continue;
    }

    if (!value && key === 'traits') {
      const traits: string[] = [];
      let cursor = index + 1;

      while (cursor < lines.length && lines[cursor].match(/^\s*-/)) {
        traits.push(lines[cursor].replace(/^\s*-\s*/, '').trim());
        cursor += 1;
      }

      parsed[key] = traits.filter(Boolean);
      index = cursor - 1;
      continue;
    }

    parsed[key] = value.replace(/^['"]|['"]$/g, '');
  }

  const difficulty = normalizeDifficulty(String(parsed.difficulty ?? fallback.difficulty));
  const status = normalizeStatus(String(parsed.status ?? fallback.status));

  if (!difficulty) {
    return { error: 'difficulty must be easy, medium, or hard' };
  }

  if (!status) {
    return { error: 'status must be draft or published' };
  }

  const traits =
    Array.isArray(parsed.traits)
      ? parsed.traits
      : typeof parsed.traits === 'string'
        ? parsed.traits.split(',').map((trait) => trait.trim()).filter(Boolean)
        : fallback.traits;

  const form: PersonaForm = {
    name: readYamlText(parsed.name, fallback.name),
    subtitle: readYamlText(parsed.subtitle, fallback.subtitle),
    company: readYamlText(parsed.company, fallback.company),
    difficulty,
    status,
    traits,
    description: readYamlText(parsed.description, fallback.description),
    goal: readYamlText(parsed.goal, fallback.goal),
    objection: readYamlText(parsed.objection, fallback.objection),
  };

  if (!form.name.trim()) {
    return { error: 'name is required' };
  }

  return { form };
}

function normalizePersonaYamlKey(key: string) {
  const normalized = key.trim().toLowerCase().replace(/-/g, '_');
  const aliases: Record<string, keyof PersonaForm> = {
    persona_type: 'subtitle',
    type: 'subtitle',
    segment: 'company',
    primary_objection: 'objection',
    conversation_goal: 'goal',
  };

  return aliases[normalized] ?? normalized;
}

function normalizeDifficulty(value: string): Difficulty | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'easy' || normalized === 'medium' || normalized === 'hard') {
    return normalized;
  }

  return null;
}

function normalizeStatus(value: string): PersonaStatus | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'draft' || normalized === 'published') {
    return normalized;
  }

  return null;
}

function readYamlText(value: string | string[] | undefined, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

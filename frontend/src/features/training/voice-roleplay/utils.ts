import { initialPersonas } from './mock-data';
import type { MeetingRoom, MeetingRoomForm, Persona, PersonaForm, Session } from './types';

export function toPersonaForm(persona?: Persona): PersonaForm {
  return {
    name: persona?.name ?? '',
    subtitle: persona?.subtitle ?? '',
    company: persona?.company ?? '',
    difficulty: persona?.difficulty ?? 'medium',
    description: persona?.description ?? '',
    traits: persona?.traits ?? [],
    goal: persona?.goal ?? '',
    objection: persona?.objection ?? '',
    status: persona?.status ?? 'draft',
  };
}

export function toMeetingRoomForm(room?: MeetingRoom, fallbackPersonaId = initialPersonas[0].id): MeetingRoomForm {
  return {
    name: room?.name ?? '',
    description: room?.description ?? '',
    personaIds: room?.personaIds ?? [fallbackPersonaId],
    scenario: room?.scenario ?? '',
    status: room?.status ?? 'draft',
  };
}

export function getSessionPersonas(session: Session, personas: Persona[]) {
  return session.personaIds
    .map((personaId) => personas.find((persona) => persona.id === personaId))
    .filter((persona): persona is Persona => Boolean(persona));
}

export function getPersonaLabel(personas: Persona[]) {
  if (personas.length === 0) return 'No persona';
  if (personas.length === 1) return personas[0].name;
  return `${personas.length} personas`;
}

export function findPreviousComparableSession(session: Session, sessions: Session[]) {
  return sessions.find(
    (candidate) =>
      candidate.id !== session.id && candidate.personaIds.some((personaId) => session.personaIds.includes(personaId)),
  );
}

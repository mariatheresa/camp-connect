export interface Participant {
  id: string;
  name: string;
  photo_path: string | null;
  job_profile: string | null;
  title: string | null;
}

export interface RateablePerson {
  participant: Participant;
  level: number | null;
}

export interface ParticipantResponse {
  participant: Participant;
  progress: { rated: number; total: number };
}

export async function fetchParticipant(token: string): Promise<ParticipantResponse | null> {
  const res = await fetch(`/api/p/${token}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchRateablePeople(token: string): Promise<RateablePerson[]> {
  const res = await fetch(`/api/p/${token}/people`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.people;
}

export async function submitRating(token: string, rateeId: string, level: number): Promise<boolean> {
  const res = await fetch(`/api/p/${token}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rateeId, level }),
  });
  return res.ok;
}

export async function fetchSuggestion(token: string, excludeIds: string[]): Promise<Participant | null> {
  const query = excludeIds.length ? `?exclude=${excludeIds.join(',')}` : '';
  const res = await fetch(`/api/p/${token}/suggestion${query}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.suggestion;
}

export async function joinWithCode(code: string): Promise<{ token: string; participant: Participant } | null> {
  const res = await fetch('/api/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) return null;
  return res.json();
}

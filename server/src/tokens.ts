import { randomBytes } from 'node:crypto';
import { db } from './db';
import type { DbParticipant } from './types';

export function generateToken(): string {
  return randomBytes(6).toString('base64url');
}

export async function issueTokenForParticipant(participantId: string): Promise<string> {
  const token = generateToken();
  await db.run('INSERT INTO tokens (token, participant_id) VALUES (?, ?)', [token, participantId]);
  return token;
}

export async function resolveToken(token: string): Promise<DbParticipant | null> {
  const row = await db.get<DbParticipant>(
    `SELECT p.* FROM tokens t JOIN participants p ON p.id = t.participant_id WHERE t.token = ?`,
    [token],
  );
  return row ?? null;
}

/** Gives every participant without an existing token exactly one. Safe to call on every boot. */
export async function issueMissingTokens(): Promise<void> {
  const withoutToken = await db.all<Array<{ id: string }>>(
    `SELECT id FROM participants WHERE id NOT IN (SELECT participant_id FROM tokens)`,
  );
  for (const { id } of withoutToken) {
    await issueTokenForParticipant(id);
  }
}

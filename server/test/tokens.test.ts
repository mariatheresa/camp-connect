import { beforeEach, describe, expect, it } from 'vitest';
import { seedParticipants } from '../src/people';
import { issueMissingTokens, issueTokenForParticipant, resolveToken } from '../src/tokens';
import { freshTestDb } from './helpers/testDb';

describe('tokens', () => {
  beforeEach(async () => {
    await freshTestDb();
    await seedParticipants([
      { id: 'p1', name: 'Anna Weber', photoPath: null, jobProfile: 'Design', title: 'Senior Designer' },
    ]);
  });

  it('resolves a valid token to its participant', async () => {
    const token = await issueTokenForParticipant('p1');
    const participant = await resolveToken(token);
    expect(participant?.id).toBe('p1');
  });

  it('returns null for an unknown token', async () => {
    const participant = await resolveToken('does-not-exist');
    expect(participant).toBeNull();
  });

  it('issueMissingTokens gives every un-tokened participant exactly one token', async () => {
    await issueMissingTokens();
    const participant = await resolveToken((await issueMissingTokens(), await getFirstToken()));
    expect(participant?.id).toBe('p1');
  });
});

async function getFirstToken(): Promise<string> {
  const { db } = await import('../src/db');
  const row = await db.get<{ token: string }>('SELECT token FROM tokens LIMIT 1');
  if (!row) throw new Error('expected a token to exist');
  return row.token;
}

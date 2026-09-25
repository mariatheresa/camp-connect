import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../src/db';
import { freshTestDb } from './helpers/testDb';

describe('initDb', () => {
  beforeEach(async () => {
    await freshTestDb();
  });

  it('creates the participants, tokens, and ratings tables', async () => {
    const tables = await db.all<Array<{ name: string }>>(
      "SELECT name FROM sqlite_master WHERE type = 'table'",
    );
    const names = tables.map((t) => t.name);
    expect(names).toContain('participants');
    expect(names).toContain('tokens');
    expect(names).toContain('ratings');
  });
});

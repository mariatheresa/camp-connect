import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../src/db';
import { seedParticipants } from '../src/people';
import { freshTestDb } from './helpers/testDb';
import type { Participant } from '../src/types';

const FIXTURE: Participant[] = [
  { id: 'p1', name: 'Anna Weber', photoPath: '/photos/p1.jpg', jobProfile: 'Design', title: 'Senior Designer' },
  { id: 'p2', name: 'Daniel Kim', photoPath: '/photos/p2.jpg', jobProfile: 'Product', title: 'Product Manager' },
];

describe('seedParticipants', () => {
  beforeEach(async () => {
    await freshTestDb();
  });

  it('inserts every participant from the list', async () => {
    await seedParticipants(FIXTURE);
    const rows = await db.all('SELECT * FROM participants ORDER BY id');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ id: 'p1', name: 'Anna Weber', job_profile: 'Design' });
  });

  it('is idempotent — re-seeding updates rather than duplicating', async () => {
    await seedParticipants(FIXTURE);
    await seedParticipants([{ ...FIXTURE[0], name: 'Anna Weber-Smith' }]);
    const rows = await db.all('SELECT * FROM participants ORDER BY id');
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe('Anna Weber-Smith');
  });
});

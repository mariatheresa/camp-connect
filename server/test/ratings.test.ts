import { beforeEach, describe, expect, it } from 'vitest';
import { seedParticipants } from '../src/people';
import { countRatingsGivenBy, getRatingsGivenBy, upsertRating } from '../src/ratings';
import { freshTestDb } from './helpers/testDb';

describe('ratings', () => {
  beforeEach(async () => {
    await freshTestDb();
    await seedParticipants([
      { id: 'p1', name: 'Anna', photoPath: null, jobProfile: 'Design', title: null },
      { id: 'p2', name: 'Daniel', photoPath: null, jobProfile: 'Product', title: null },
    ]);
  });

  it('stores a new rating', async () => {
    await upsertRating('p1', 'p2', 2);
    const given = await getRatingsGivenBy('p1');
    expect(given.get('p2')).toBe(2);
  });

  it('updates rather than duplicates on a second rating of the same pair', async () => {
    await upsertRating('p1', 'p2', 1);
    await upsertRating('p1', 'p2', 3);
    const given = await getRatingsGivenBy('p1');
    expect(given.get('p2')).toBe(3);
    expect(given.size).toBe(1);
  });

  it('survives a rapid duplicate submit without throwing', async () => {
    await Promise.all([upsertRating('p1', 'p2', 2), upsertRating('p1', 'p2', 2)]);
    expect(await countRatingsGivenBy('p1')).toBe(1);
  });
});

import { db } from './db';

/** Caller (the route layer) is responsible for validating raterId/rateeId/level. */
export async function upsertRating(raterId: string, rateeId: string, level: number): Promise<void> {
  await db.run(
    `INSERT INTO ratings (rater_id, ratee_id, level, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(rater_id, ratee_id) DO UPDATE SET
       level = excluded.level,
       updated_at = excluded.updated_at`,
    [raterId, rateeId, level],
  );
}

export async function getRatingsGivenBy(raterId: string): Promise<Map<string, number>> {
  const rows = await db.all<Array<{ ratee_id: string; level: number }>>(
    'SELECT ratee_id, level FROM ratings WHERE rater_id = ?',
    [raterId],
  );
  return new Map(rows.map((r) => [r.ratee_id, r.level]));
}

export async function countRatingsGivenBy(raterId: string): Promise<number> {
  const row = await db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM ratings WHERE rater_id = ?',
    [raterId],
  );
  return row?.count ?? 0;
}

import { Router } from 'express';
import { db } from '../db';
import { countRatingsGivenBy, getRatingsGivenBy, upsertRating } from '../ratings';
import { pickSuggestion } from '../suggestion';
import { resolveToken } from '../tokens';
import type { DbParticipant } from '../types';

export const participantsRouter = Router();

async function getAllParticipants(): Promise<DbParticipant[]> {
  return db.all<DbParticipant[]>('SELECT * FROM participants');
}

participantsRouter.get('/:token', async (req, res) => {
  const participant = await resolveToken(req.params.token);
  if (!participant) return res.status(404).json({ error: 'Unknown token' });

  const total = (await getAllParticipants()).length - 1;
  const rated = await countRatingsGivenBy(participant.id);
  res.json({ participant, progress: { rated, total } });
});

participantsRouter.get('/:token/people', async (req, res) => {
  const participant = await resolveToken(req.params.token);
  if (!participant) return res.status(404).json({ error: 'Unknown token' });

  const others = (await getAllParticipants()).filter((p) => p.id !== participant.id);
  const ratingsGiven = await getRatingsGivenBy(participant.id);
  const people = others.map((p) => ({
    participant: p,
    level: ratingsGiven.has(p.id) ? (ratingsGiven.get(p.id) as number) : null,
  }));
  res.json({ people });
});

participantsRouter.post('/:token/ratings', async (req, res) => {
  const participant = await resolveToken(req.params.token);
  if (!participant) return res.status(404).json({ error: 'Unknown token' });

  const { rateeId, level } = req.body as { rateeId?: unknown; level?: unknown };
  if (typeof rateeId !== 'string' || typeof level !== 'number') {
    return res.status(400).json({ error: 'rateeId and level are required' });
  }
  if (rateeId === participant.id) {
    return res.status(400).json({ error: 'Cannot rate yourself' });
  }
  if (!Number.isInteger(level) || level < 0 || level > 3) {
    return res.status(400).json({ error: 'level must be an integer between 0 and 3' });
  }
  const ratee = await db.get<DbParticipant>('SELECT * FROM participants WHERE id = ?', [rateeId]);
  if (!ratee) return res.status(404).json({ error: 'Unknown ratee' });

  await upsertRating(participant.id, rateeId, level);
  res.json({ ok: true });
});

participantsRouter.get('/:token/suggestion', async (req, res) => {
  const participant = await resolveToken(req.params.token);
  if (!participant) return res.status(404).json({ error: 'Unknown token' });

  const excludeParam = typeof req.query.exclude === 'string' ? req.query.exclude : '';
  const excludeIds = excludeParam.split(',').filter(Boolean);

  const all = await getAllParticipants();
  const ratingsGiven = await getRatingsGivenBy(participant.id);
  const suggestion = pickSuggestion(participant, all, ratingsGiven, excludeIds);
  res.json({ suggestion });
});

import { Router } from 'express';
import { resolveToken } from '../tokens';

export const joinRouter = Router();

joinRouter.post('/', async (req, res) => {
  const { code } = req.body as { code?: unknown };
  if (typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'code is required' });
  }
  const participant = await resolveToken(code.trim());
  if (!participant) return res.status(404).json({ error: 'Invalid code' });
  res.json({ token: code.trim(), participant });
});

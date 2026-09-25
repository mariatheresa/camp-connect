import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { seedParticipants } from '../src/people';
import { joinRouter } from '../src/routes/join';
import { participantsRouter } from '../src/routes/participants';
import { issueTokenForParticipant } from '../src/tokens';
import { freshTestDb } from './helpers/testDb';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/p', participantsRouter);
  app.use('/api/join', joinRouter);
  return app;
}

describe('participants routes', () => {
  let app: express.Express;
  let tokenA: string;
  let tokenB: string;

  beforeEach(async () => {
    await freshTestDb();
    await seedParticipants([
      { id: 'p1', name: 'Anna', photoPath: null, jobProfile: 'Design', title: null },
      { id: 'p2', name: 'Daniel', photoPath: null, jobProfile: 'Product', title: null },
    ]);
    tokenA = await issueTokenForParticipant('p1');
    tokenB = await issueTokenForParticipant('p2');
    app = buildApp();
  });

  it('GET /:token resolves the participant and progress', async () => {
    const res = await request(app).get(`/api/p/${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.participant.id).toBe('p1');
    expect(res.body.progress).toEqual({ rated: 0, total: 1 });
  });

  it('GET /:token returns 404 for an unknown token', async () => {
    const res = await request(app).get('/api/p/not-a-real-token');
    expect(res.status).toBe(404);
  });

  it('GET /:token/people lists everyone except the viewer', async () => {
    const res = await request(app).get(`/api/p/${tokenA}/people`);
    expect(res.status).toBe(200);
    expect(res.body.people).toHaveLength(1);
    expect(res.body.people[0].participant.id).toBe('p2');
    expect(res.body.people[0].level).toBeNull();
  });

  it('POST /:token/ratings upserts a rating', async () => {
    const res = await request(app)
      .post(`/api/p/${tokenA}/ratings`)
      .send({ rateeId: 'p2', level: 2 });
    expect(res.status).toBe(200);

    const progress = await request(app).get(`/api/p/${tokenA}`);
    expect(progress.body.progress.rated).toBe(1);
  });

  it('POST /:token/ratings rejects rating yourself', async () => {
    const res = await request(app)
      .post(`/api/p/${tokenA}/ratings`)
      .send({ rateeId: 'p1', level: 2 });
    expect(res.status).toBe(400);
  });

  it('POST /:token/ratings rejects an out-of-range level', async () => {
    const res = await request(app)
      .post(`/api/p/${tokenA}/ratings`)
      .send({ rateeId: 'p2', level: 7 });
    expect(res.status).toBe(400);
  });

  it('GET /:token/suggestion returns a candidate', async () => {
    const res = await request(app).get(`/api/p/${tokenA}/suggestion`);
    expect(res.status).toBe(200);
    expect(res.body.suggestion.id).toBe('p2');
  });

  it('GET /:token/suggestion returns null when everyone is excluded', async () => {
    const res = await request(app).get(`/api/p/${tokenA}/suggestion`).query({ exclude: 'p2' });
    expect(res.status).toBe(200);
    expect(res.body.suggestion).toBeNull();
  });

  it('POST /api/join resolves a valid code to its token', async () => {
    const res = await request(app).post('/api/join').send({ code: tokenB });
    expect(res.status).toBe(200);
    expect(res.body.participant.id).toBe('p2');
  });

  it('POST /api/join rejects an invalid code', async () => {
    const res = await request(app).post('/api/join').send({ code: 'nonsense' });
    expect(res.status).toBe(404);
  });
});

import http from 'node:http';
import path from 'node:path';
import express from 'express';
import { initDb } from './db';
import { loadPeopleFile, seedParticipants } from './people';
import { joinRouter } from './routes/join';
import { participantsRouter } from './routes/participants';
import { issueMissingTokens } from './tokens';

const app = express();
const httpServer = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

app.use('/photos', express.static(path.join(__dirname, '..', 'assets', 'photos')));
app.use('/api/p', participantsRouter);
app.use('/api/join', joinRouter);

const clientDist = path.join(process.cwd(), '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

async function boot(): Promise<void> {
  await initDb();
  const people = loadPeopleFile(path.join(__dirname, '..', 'assets', 'people.json'));
  await seedParticipants(people);
  await issueMissingTokens();
  httpServer.listen(PORT, () => {
    console.log(`\n🧭  Camp Connect — http://localhost:${PORT}\n`);
  });
}

boot();

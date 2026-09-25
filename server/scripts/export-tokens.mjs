#!/usr/bin/env node
// Operator tool: prints id,name,token,url as CSV so QR codes can be generated
// before the event. Run with: pnpm --filter server export-tokens
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const db = await open({ filename: path.join(dataDir, 'camp-connect.db'), driver: sqlite3.Database });
const rows = await db.all(
  `SELECT p.id, p.name, t.token
   FROM participants p JOIN tokens t ON t.participant_id = p.id
   ORDER BY p.name`,
);

console.log('id,name,token,url');
for (const r of rows) {
  console.log(`${r.id},"${r.name}",${r.token},${baseUrl}/p/${r.token}`);
}

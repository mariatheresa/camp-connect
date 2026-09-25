import fs from 'node:fs';
import path from 'node:path';
import { type Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

export let db: Database;

function resolveDataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), '..', 'data');
}

export async function initDb(): Promise<void> {
  const dataDir = resolveDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  db = await open({ filename: path.join(dataDir, 'camp-connect.db'), driver: sqlite3.Database });

  await db.run('PRAGMA journal_mode = WAL');
  await db.run('PRAGMA foreign_keys = ON');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      photo_path  TEXT,
      job_profile TEXT,
      title       TEXT
    );

    CREATE TABLE IF NOT EXISTS tokens (
      token          TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL REFERENCES participants(id),
      created_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ratings (
      rater_id   TEXT NOT NULL REFERENCES participants(id),
      ratee_id   TEXT NOT NULL REFERENCES participants(id),
      level      INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (rater_id, ratee_id)
    );
  `);
}

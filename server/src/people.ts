import fs from 'node:fs';
import { db } from './db';
import type { Participant } from './types';

export function loadPeopleFile(filePath: string): Participant[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Participant[];
}

export async function seedParticipants(people: Participant[]): Promise<void> {
  for (const p of people) {
    await db.run(
      `INSERT INTO participants (id, name, photo_path, job_profile, title)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         photo_path = excluded.photo_path,
         job_profile = excluded.job_profile,
         title = excluded.title`,
      [p.id, p.name, p.photoPath ?? null, p.jobProfile ?? null, p.title ?? null],
    );
  }
}

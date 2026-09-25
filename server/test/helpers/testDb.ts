import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { initDb } from '../../src/db';

/** Points DATA_DIR at a fresh temp dir and boots a clean DB for one test file. */
export async function freshTestDb(): Promise<void> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'camp-connect-test-'));
  process.env.DATA_DIR = dir;
  await initDb();
}

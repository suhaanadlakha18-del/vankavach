import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '../config/env.js';
let db: DatabaseSync | undefined;
export function getDatabase(path = env.DATABASE_PATH): DatabaseSync {
  if (!db) { const resolved = path === ':memory:' ? path : resolve(path); if (resolved !== ':memory:') mkdirSync(dirname(resolved),{recursive:true}); db = new DatabaseSync(resolved); db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;'); }
  return db;
}
export function closeDatabase(){ db?.close(); db=undefined; }

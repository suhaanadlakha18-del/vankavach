import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getDatabase } from './database.js';
export function migrate(){ const here=dirname(fileURLToPath(import.meta.url)); getDatabase().exec(readFileSync(join(here,'schema.sql'),'utf8')); }
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) { migrate(); console.log('Database schema initialized.'); }

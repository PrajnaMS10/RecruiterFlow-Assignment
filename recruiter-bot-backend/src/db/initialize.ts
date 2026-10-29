import type { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export function initialize(db:DatabaseSync) {
 db.exec('BEGIN IMMEDIATE');
 try {
  db.exec(readFileSync(resolve('src/db/schema.sql'),'utf8'));
  db.exec(readFileSync(resolve('src/db/seed.sql'),'utf8'));
  db.exec('COMMIT');
 } catch(error) { db.exec('ROLLBACK'); throw error; }
}

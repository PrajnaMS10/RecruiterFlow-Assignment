import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
export function openDatabase(path=process.env.DATABASE_PATH ?? 'data/recruiterflow.db') {
 if(path!==':memory:') mkdirSync(dirname(resolve(path)),{recursive:true});
 const db=new DatabaseSync(path);
 db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
 return db;
}

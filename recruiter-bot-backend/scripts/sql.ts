import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function runDetective() {
 const db=new DatabaseSync(':memory:');
 try {
  const [setup,...queries]=readFileSync('sql_detective.sql','utf8').split(/-- Question \d[^\n]*\n/);
  db.exec(setup);
  return queries.map(query=>db.prepare(query).all());
 } finally {db.close();}
}
if(process.argv[1]?.endsWith('sql.ts') || process.argv[1]?.endsWith('sql.js')) runDetective().forEach((rows,i)=>{console.log(`Question ${i+1}`);console.table(rows);});

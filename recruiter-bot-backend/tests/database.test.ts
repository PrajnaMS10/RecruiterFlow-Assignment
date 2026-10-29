import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {openDatabase} from '../src/config/database.js';
import {initialize} from '../src/db/initialize.js';
import {getCandidates} from '../src/repositories/candidateRepository.js';
import {getJobs} from '../src/repositories/jobRepository.js';
it('preserves every seed field, initializes twice, and enforces relational constraints',()=>{
 const db=openDatabase(':memory:');
 try {
 initialize(db);initialize(db);
 const expected=JSON.parse(readFileSync('tests/fixtures/seeds.json','utf8'));
 expect(getCandidates(db)).toEqual(expected.candidates);expect(getJobs(db)).toEqual(expected.jobs);
 expect(db.prepare('PRAGMA foreign_keys').get()?.foreign_keys).toBe(1);
 expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
 expect(()=>db.prepare('INSERT INTO candidate_skills VALUES (?,?)').run(999,'deduction')).toThrow();
 expect(()=>db.prepare('INSERT INTO candidate_skills VALUES (?,?)').run(1,'deduction')).toThrow();
 expect(()=>db.prepare('UPDATE candidates SET experienceYears=-1 WHERE id=1').run()).toThrow();
 expect(()=>db.prepare("UPDATE candidates SET availability='Tomorrow' WHERE id=1").run()).toThrow();
 } finally {db.close();}
});

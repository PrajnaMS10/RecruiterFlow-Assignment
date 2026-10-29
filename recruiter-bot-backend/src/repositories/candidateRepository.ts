import type { DatabaseSync } from 'node:sqlite';
import type { Candidate } from '../types/index.js';
export function getCandidates(db:DatabaseSync):Candidate[] {
 const skills=db.prepare('SELECT candidate_id,skill FROM candidate_skills ORDER BY skill').all();
 const traits=db.prepare('SELECT candidate_id,keyword FROM candidate_traits ORDER BY keyword').all();
 return db.prepare('SELECT id,name,experienceYears,availability,quirk FROM candidates ORDER BY id').all().map(row=>({
 ...row,skills:skills.filter(s=>s.candidate_id===row.id).map(s=>String(s.skill)),
 traits:traits.filter(s=>s.candidate_id===row.id).map(s=>String(s.keyword))
 } as unknown as Candidate));
}
export function findCandidate(db:DatabaseSync,id:number) {
 const row=db.prepare('SELECT id FROM candidates WHERE id = ?').get(id);
 return row ? getCandidates(db).find(c=>c.id===id) : undefined;
}

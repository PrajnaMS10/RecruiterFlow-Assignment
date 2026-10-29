import type { DatabaseSync } from 'node:sqlite';
import type { Job } from '../types/index.js';
export function getJobs(db:DatabaseSync):Job[] {
 const skills=db.prepare('SELECT job_id,skill FROM job_skills ORDER BY skill').all();
 const culture=db.prepare('SELECT job_id,keyword FROM job_culture ORDER BY keyword').all();
 return db.prepare('SELECT id,title,minimumExperience,tagline FROM jobs ORDER BY id').all().map(row=>({
 ...row,requiredSkills:skills.filter(s=>s.job_id===row.id).map(s=>String(s.skill)),
 cultureKeywords:culture.filter(s=>s.job_id===row.id).map(s=>String(s.keyword))
 } as unknown as Job));
}
export function findJob(db:DatabaseSync,id:number) {
 const row=db.prepare('SELECT id FROM jobs WHERE id = ?').get(id);
 return row ? getJobs(db).find(j=>j.id===id) : undefined;
}

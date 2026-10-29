import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import request from 'supertest';
import {openDatabase} from '../src/config/database.js';
import {initialize} from '../src/db/initialize.js';
import {createApp} from '../src/app.js';
let db:ReturnType<typeof openDatabase>;
beforeEach(()=>{db=openDatabase(':memory:');initialize(db);});
afterEach(()=>{if(db.isOpen) db.close();});
it('serves health and both complete response shapes',async()=>{
 const app=createApp(db);
 expect((await request(app).get('/health')).body).toEqual({status:'ok'});
 const jobs=await request(app).get('/jobs/1/matches').expect(200);
 expect(jobs.body.matches).toHaveLength(15);
 expect(jobs.body.matches[0]).toMatchObject({candidateId:1,candidateName:'Sherlock H.',score:100,availability:'Immediate',missingSkills:[]});
 expect(jobs.body.matches[0].reason).toBe('Matches 3 of 3 required skills and meets the experience requirement.');
 const candidates=await request(app).get('/candidates/1/matches').expect(200);
 expect(candidates.body.matches).toHaveLength(6);
 expect(candidates.body.matches[0]).toMatchObject({jobId:1,score:100,minimumExperience:3});
});
it('has identical scores and reasons for every pair in both directions',async()=>{
 const app=createApp(db);
 const reverse=await Promise.all(Array.from({length:15},(_,i)=>request(app).get(`/candidates/${i+1}/matches`)));
 for(let job=1;job<=6;job++) {
  const forward=await request(app).get(`/jobs/${job}/matches`).expect(200);
  for(const m of forward.body.matches) {
   const other=reverse[m.candidateId-1].body.matches.find((x:{jobId:number})=>x.jobId===job);
   for(const key of ['score','reason','matchedSkills','missingSkills']) expect(m[key]).toEqual(other[key]);
  }
 }
});
it.each(['/jobs/999/matches','/candidates/999/matches','/absent'])('returns JSON 404 for %s',async(path)=>{expect((await request(createApp(db)).get(path).expect(404)).body.error).toBeTypeOf('string');});
it.each(['0','-1','1.5','abc','01','9007199254740992',"1%20OR%201=1"])('rejects invalid ID %s',async(id)=>{
 for(const resource of ['jobs','candidates']) await request(createApp(db)).get(`/${resource}/${id}/matches`).expect(400);
});
it('handles actual database failures without exposing internals',async()=>{
 db.close();const spy=vi.spyOn(console,'error').mockImplementation(()=>{});
 try {expect((await request(createApp(db)).get('/jobs/1/matches').expect(500)).body).toEqual({error:'Internal server error'});} finally {spy.mockRestore();}
});

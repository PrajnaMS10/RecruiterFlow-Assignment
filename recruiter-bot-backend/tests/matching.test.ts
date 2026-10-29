import {describe,it,expect} from 'vitest';
import {scoreMatch,rankCandidates,rankJobs} from '../src/services/matching.js';
import type {Candidate,Job} from '../src/types/index.js';
const c:Candidate={id:1,name:'Zed',skills:['a','b'],experienceYears:4,availability:'Immediate',traits:[],quirk:''};
const j:Job={id:1,title:'Role',requiredSkills:['a','b'],minimumExperience:4,cultureKeywords:[],tagline:''};
describe('matching',()=>{
 it.each([[['a','b'],100],[['a','x'],65],[['x','y'],30]])('scores overlap %j',(skills,expected)=>expect(scoreMatch({...c,skills},j).score).toBe(expected));
 it('caps experience and prorates a shortfall',()=>{
 expect(scoreMatch({...c,experienceYears:20},j).score).toBe(100);
 expect(scoreMatch({...c,experienceYears:2},j).score).toBe(85);
 expect(scoreMatch({...c,experienceYears:0},j).score).toBe(70);
 });
 it('defines empty skills and zero experience minimum',()=>expect(scoreMatch({...c,experienceYears:0},{...j,requiredSkills:[],minimumExperience:0}).score).toBe(100));
 it('reports data-grounded reasons and missing skills',()=>{
 const m=scoreMatch({...c,skills:['a'],experienceYears:2},j);
 expect(m.matchedSkills).toEqual(['a']);expect(m.missingSkills).toEqual(['b']);
 expect(m.reason).toBe('Matches 1 of 2 required skills and falls below the experience requirement (2/4 years).');
 });
 it('sorts ties by name then ID in both directions',()=>{
 expect(rankCandidates([c,{...c,id:2,name:'Amy'},{...c,id:3,name:'Amy'}],j).map(x=>x.candidateId)).toEqual([2,3,1]);
 expect(rankJobs(c,[j,{...j,id:2,title:'A'}]).map(x=>x.jobId)).toEqual([2,1]);
 });
 it('sorts before rounding',()=>{
 const job={...j,minimumExperience:10000};
 expect(rankCandidates([{...c,id:1,name:'Amy',experienceYears:1},{...c,id:2,name:'Zed',experienceYears:2}],job)[0].candidateId).toBe(2);
 });
 it('bounds scores for supported inputs',()=>{
 for(const years of [0,1,4,100]) for(const minimum of [0,1,10]) for(const skills of [[],['a'],['a','b']]) {
 const m=scoreMatch({...c,experienceYears:years,skills},{...j,minimumExperience:minimum});
 expect(m.score).toBeGreaterThanOrEqual(0);expect(m.score).toBeLessThanOrEqual(100);
 }
 });
});

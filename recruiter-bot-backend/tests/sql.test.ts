import {it,expect} from 'vitest';
import {runDetective} from '../scripts/sql.js';
it('executes the original dataset and all five questions with correct results',()=>{
 const result=runDetective();expect(result).toHaveLength(5);
 expect(result[0].map(x=>x.id)).toEqual([1,2,4,5]);
 expect(result[1].map(x=>x.final_applicants)).toEqual([2,2,1,2,0,0,2]);
 expect(result[2].map(x=>[x.full_name,x.job_count])).toEqual([['Ananya Rao',2],['Ben Turner',2],['Elena Popescu',2]]);
 expect(result[3].map(x=>[x.id,x.final_interviews,x.passed,x.conversion_percent])).toEqual([[1,4,3,75],[2,4,2,50]]);
 expect(result[4].map(x=>[x.department,x.recruiter_id,x.placement_count])).toEqual([['Data',3,1],['Engineering',1,3],['Infrastructure',4,0]]);
});

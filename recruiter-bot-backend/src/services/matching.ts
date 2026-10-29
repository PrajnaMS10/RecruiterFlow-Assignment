import type {Candidate,Job} from '../types/index.js';
export function scoreMatch(candidate:Candidate,job:Job) {
 const required=[...new Set(job.requiredSkills)];
 const matchedSkills=required.filter(s=>candidate.skills.includes(s)).sort();
 const missingSkills=required.filter(s=>!candidate.skills.includes(s)).sort();
 const skillRatio=required.length===0 ? 1 : matchedSkills.length/required.length;
 const experienceRatio=job.minimumExperience===0 ? 1 : Math.min(candidate.experienceYears/job.minimumExperience,1);
 const rawScore=70*skillRatio+30*experienceRatio;
 const skillReason=required.length===0 ? 'No required skills specified' : `Matches ${matchedSkills.length} of ${required.length} required skills`;
 const experienceReason=candidate.experienceYears>=job.minimumExperience ? 'meets the experience requirement' : `falls below the experience requirement (${candidate.experienceYears}/${job.minimumExperience} years)`;
 return {rawScore,score:Number(rawScore.toFixed(2)),skillScore:Number((100*skillRatio).toFixed(2)),experienceScore:Number((100*experienceRatio).toFixed(2)),matchedSkills,missingSkills,reason:`${skillReason} and ${experienceReason}.`};
}
function compare(a:{rawScore:number;name:string;id:number},b:{rawScore:number;name:string;id:number}) {
 return b.rawScore-a.rawScore || (a.name<b.name ? -1 : a.name>b.name ? 1 : a.id-b.id);
}
export function rankCandidates(candidates:Candidate[],job:Job) {
 return candidates.map(c=>({candidate:c,...scoreMatch(c,job)})).sort((a,b)=>compare({rawScore:a.rawScore,name:a.candidate.name,id:a.candidate.id},{rawScore:b.rawScore,name:b.candidate.name,id:b.candidate.id})).map(({candidate:c,rawScore,...match})=>({candidateId:c.id,candidateName:c.name,experienceYears:c.experienceYears,availability:c.availability,traits:c.traits,quirk:c.quirk,...match}));
}
export function rankJobs(candidate:Candidate,jobs:Job[]) {
 return jobs.map(j=>({job:j,...scoreMatch(candidate,j)})).sort((a,b)=>compare({rawScore:a.rawScore,name:a.job.title,id:a.job.id},{rawScore:b.rawScore,name:b.job.title,id:b.job.id})).map(({job:j,rawScore,...match})=>({jobId:j.id,jobTitle:j.title,minimumExperience:j.minimumExperience,requiredSkills:j.requiredSkills,cultureKeywords:j.cultureKeywords,tagline:j.tagline,...match}));
}

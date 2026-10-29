import {Router} from 'express';
import type {DatabaseSync} from 'node:sqlite';
import {getJobs} from '../repositories/jobRepository.js';
import {findCandidate} from '../repositories/candidateRepository.js';
import {rankJobs} from '../services/matching.js';
import {parseId} from '../middleware/errorHandler.js';
export function candidatesRouter(db:DatabaseSync) {
 const router=Router();
 router.get('/:id/matches',(req,res)=>{
  const id=parseId(req.params.id);
  if(id===undefined) {res.status(400).json({error:'Candidate ID must be a positive safe integer without leading zeros'});return;}
  const candidate=findCandidate(db,id);
  if(!candidate) {res.status(404).json({error:'Candidate not found'});return;}
  res.json({candidate,matches:rankJobs(candidate,getJobs(db))});
 });return router;
}

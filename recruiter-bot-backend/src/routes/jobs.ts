import {Router} from 'express';
import type {DatabaseSync} from 'node:sqlite';
import {findJob} from '../repositories/jobRepository.js';
import {getCandidates} from '../repositories/candidateRepository.js';
import {rankCandidates} from '../services/matching.js';
import {parseId} from '../middleware/errorHandler.js';
export function jobsRouter(db:DatabaseSync) {
 const router=Router();
 router.get('/:id/matches',(req,res)=>{
  const id=parseId(req.params.id);
  if(id===undefined) {res.status(400).json({error:'Job ID must be a positive safe integer without leading zeros'});return;}
  const job=findJob(db,id);
  if(!job) {res.status(404).json({error:'Job not found'});return;}
  res.json({job,matches:rankCandidates(getCandidates(db),job)});
 });return router;
}

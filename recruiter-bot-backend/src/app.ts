import express from 'express';
import type {DatabaseSync} from 'node:sqlite';
import {jobsRouter} from './routes/jobs.js';
import {candidatesRouter} from './routes/candidates.js';
import {errorHandler} from './middleware/errorHandler.js';
export function createApp(db:DatabaseSync) {
 const app=express();app.disable('x-powered-by');
 app.get('/health',(_req,res)=>{db.prepare('SELECT 1').get();res.json({status:'ok'});});
 app.use('/jobs',jobsRouter(db));app.use('/candidates',candidatesRouter(db));
 app.use((_req,res)=>{res.status(404).json({error:'Route not found'});});
 app.use(errorHandler);return app;
}

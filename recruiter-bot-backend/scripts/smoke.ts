import { once } from 'node:events';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/config/database.js';
import { initialize } from '../src/db/initialize.js';
import { createApp } from '../src/app.js';
const db = openDatabase();
initialize(db);
const server = createApp(db).listen(0, '127.0.0.1');
try {
  await once(server, 'listening');
  const address = server.address();
  assert(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });
  const forward = await fetch(`${base}/jobs/1/matches`);
  const reverse = await fetch(`${base}/candidates/1/matches`);
  assert.equal(forward.status, 200);
  assert.equal(reverse.status, 200);
  const job = await forward.json() as { matches: { candidateId: number; score: number }[] };
  const candidate = await reverse.json() as { matches: { jobId: number; score: number }[] };
  assert.equal(job.matches.length, 15);
  assert.equal(candidate.matches.length, 6);
  assert.equal(job.matches[0].candidateId, 1);
  assert.equal(candidate.matches[0].jobId, 1);
  assert.equal(job.matches[0].score, 100);
  assert.equal(candidate.matches[0].score, 100);
  console.log('Disk database HTTP smoke check passed: health, 15 candidate matches, 6 job matches, Sherlock/Detective score 100.');
} finally {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  db.close();
}

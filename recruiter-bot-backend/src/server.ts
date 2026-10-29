import {openDatabase} from './config/database.js';
import {initialize} from './db/initialize.js';
import {createApp} from './app.js';
const port=Number(process.env.PORT ?? 3000);
if(!Number.isInteger(port)||port<1||port>65535) throw new Error('PORT must be an integer between 1 and 65535');
const db=openDatabase();
try { initialize(db); } catch(error) {db.close();throw error;}
const server=createApp(db).listen(port,'127.0.0.1',()=>console.log(`Recruiter Bot listening at http://localhost:${port}`));
server.on('error',(error)=>{console.error(error.message);db.close();process.exitCode=1;});
for(const signal of ['SIGINT','SIGTERM'] as const) process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));

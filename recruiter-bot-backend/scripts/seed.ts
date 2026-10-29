import {openDatabase} from '../src/config/database.js';
import {initialize} from '../src/db/initialize.js';
const db=openDatabase();
try { initialize(db); console.log('Database initialized: 15 seed candidates and 6 seed jobs available.'); } finally { db.close(); }

import cron from 'node-cron';
import connect from './connectdb.js';
import * as ctrl from './api/ctrl.js'

// Connect MongoDB
await connect();

console.log(await ctrl.getUserNum('화이트모카'));

// cron.schedule('* * * * * *', () => {
//   console.log('running a task every second');
// });

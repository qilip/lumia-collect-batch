import cron from 'node-cron';
import connect from './connectdb.js';
import * as job from './api/job.js';
import * as ctrl from './api/ctrl.js';
import * as er from './api/er.js';

// Connect MongoDB
await connect();

// import Queue from './models/queue.js';
import Schedule from './models/schedule.js';

// Queue.create({
//   jobFuncName: 'getUserSeason',
//   priority: 5,
//   data: [
//     { userNum: 2773385, seasonId: 5 },
//     { userNum: 2773385, seasonId: 4 },
//     { userNum: 2773385, seasonId: 3 },
//     { userNum: 2773385, seasonId: 2 },
//     { userNum: 2773385, seasonId: 1 }
//   ]
// });

// Queue.create({
//   jobFuncName: 'getUserStats',
//   priority: 4,
//   data: [
//     { userNum: 2773385, seasonId: 0 }
//   ]
// });

// Schedule.create({
//   jobFuncName: 'getUserSeason',
//   priority: 4,
//   interval: 24*60,
//   data: [
//     { userNum: 2773385 }
//   ],
//   nextRunAt: new Date(1999,6,8)
// });

// Schedule.create({
//   jobFuncName: 'getGameData',
//   priority: 4,
//   interval: 24*60,
//   data: [
//     { metaType: 'Season' }
//   ],
//   nextRunAt: new Date(1999,6,8)
// });

cron.schedule('* * * * * *', () => {
  job.queue();
});

cron.schedule('* * * * *', () => {
  job.schedule();
});

cron.schedule('*/3 * * * * *', () => {
  // 3초마다
  job.idle();
});

// await ctrl.getFreeCharacters(2);
// await ctrl.getUserNum('화이트모카');
// await ctrl.getGame(9628082);
// await ctrl.getRoute(383558);
// await ctrl.getUserSeason(2773385, 5);
// await ctrl.getUserRank(2773385, 4);
// await ctrl.getUserStats(2773385, 0);
// await ctrl.getUserGames(2773385);
// await ctrl.getUserGames(2773385, 10544019);
// await ctrl.getUserRecentGames(2773385, 9974987, 50);
// await ctrl.getGameData('Season');

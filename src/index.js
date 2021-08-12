import cron from 'node-cron';
import Bottleneck from 'bottleneck';
import connect from './connectdb.js';
import * as job from './api/job.js';
// import * as ctrl from './api/ctrl.js';
// import * as er from './api/er.js';

// Connect MongoDB
await connect();

const limiter = new Bottleneck({
  reservoir: 100,
  reservoirIncreaseAmount: 50,
  reservoirIncreaseInterval: 1000,
  reservoirIncreaseMaximum: 100,
  
  maxConcurrent: 30,
  minTime: 50,
});

// import Queue from './models/queue.js';

// Queue.create({
//   jobFuncName: 'getUserStats',
//   priority: 5,
//   data: [{ userNum: 2773385, seasonId: 0 }]
// });

cron.schedule('* * * * * *', () => {
  job.queue(limiter);
});

cron.schedule('* * * * *', () => {
  job.schedule(limiter);
});

cron.schedule('* * * * *', () => {
  if(limiter.empty()){
    job.cleanupQueue();
    job.idle(limiter);
  }
});

limiter.on('error', (error) => {
  console.error('limiter: ERROR');
  console.error(error);
});

limiter.on('failed', (error, jobInfo) => {
  console.warn('limiter: Job [ ' + JSON.stringify(jobInfo, 0, 2) + ' ] Failed');
  console.warn(error);
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
// console.log(await er.getGameData('hash'));

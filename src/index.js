import cron from 'node-cron';
import connect from './connectdb.js';
import createJob from './jobs/createJob.js';
import * as job from './api/job.js';

// Connect MongoDB
await connect();

// DB에 조건 맞을때만 실행하도록 설정
await createJob();

cron.schedule('* * * * * *', () => {
  job.queue();
});

cron.schedule('*/10 * * * * *', () => {
  job.schedule();
});

cron.schedule('*/3 * * * * *', () => {
  // 3초마다
  job.idle();
});

// import * as ctrl from './api/ctrl.js';
// import * as er from './api/er.js';

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
// await ctrl.getL10nData('Korean');
// await ctrl.getTopRanks(5, 3);

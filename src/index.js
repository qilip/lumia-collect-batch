import cron from 'node-cron';
import connect from './loader/connectdb.js';
import createJob from './loader/createJob.js';
import * as job from './api/job.js';

// Connect MongoDB
await connect();

// DB에 조건 맞을때만 실행하도록 설정
await createJob();

process.on('unhandledRejection', (error, promise) => {
  console.log('unhandled promise rejection: ', promise);
  console.log('error: ', error);
});

cron.schedule('* * * * * *', () => {
  job.queue();
});

cron.schedule('*/2 * * * * *', () => {
  job.schedule();
});

cron.schedule('*/3 * * * * *', () => {
  // 3초마다
  job.idle();
});

// import * as ctrl from './api/ctrl.js';
// import * as er from './api/er.js';

// await ctrl.getUserNum('화이트모카');
// await ctrl.getUserNum('튀겨낸무드리');
// await ctrl.getUserNum('moodle');
// await ctrl.getGame(9628082);
// await ctrl.getGame(11885815);
// await ctrl.getRoute(383558);
// await ctrl.getUserSeason(2773385, 5);
// await ctrl.getUserRank(2773385);
// await ctrl.getUserRank(2773385, 4);
// await ctrl.getUserStats(2773385, 0);
// await ctrl.getUserGames(2773385);
// await ctrl.getUserGames(2773385, 10544019);
// await ctrl.getUserRecentGames(2773385, 9974987, 50);
// await ctrl.getFreeCharacters(2);
// await ctrl.getGameData('Season');
// await ctrl.getL10nData('Korean');
// await ctrl.getTopRanks(5, 3);
// await ctrl.getUserGamesInRange(2773385, null, 1);
// await ctrl.getUserGamesInRange(1867007, null, 1);
// await ctrl.getUserGamesInRange(1782120, null, 1);
// await ctrl.getUserUpdate(2773385);

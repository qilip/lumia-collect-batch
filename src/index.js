import cron from 'node-cron';
import connect from './connectdb.js';
import * as ctrl from './api/ctrl.js'
import * as er from './api/er.js';

// Connect MongoDB
await connect();

// await ctrl.getFreeCharacters(2);
// await ctrl.getUserNum('화이트모카');
// await ctrl.getGame(10414943);
// await ctrl.getRoute(383558);
// await ctrl.getUserSeason(2773385, 5);
// await ctrl.getUserRank(2773385, 4);
// await ctrl.getUserStats(2773385, 0);
// await ctrl.getUserGames(2773385);
// await ctrl.getUserGames(2773385, 10544019);
// await ctrl.getUserRecentGames(2773385, 9974987, 50);


// cron.schedule('* * * * * *', () => {
//   console.log('running a task every second');
// });

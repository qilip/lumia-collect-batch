import Queue from './models/queue.js';
import Schedule from './models/schedule.js';

export default async () => {
  // DB 아무것도 없을때 Job 초기설정
  Queue.create({
    jobFuncName: 'getUserSeason',
    priority: 5,
    data: [
      { userNum: 2773385, seasonId: 5 },
      { userNum: 2773385, seasonId: 4 },
      { userNum: 2773385, seasonId: 3 },
      { userNum: 2773385, seasonId: 2 },
      { userNum: 2773385, seasonId: 1 }
    ]
  });
  
  Queue.create({
    jobFuncName: 'getUserStats',
    priority: 4,
    data: [
      { userNum: 2773385, seasonId: 0 }
    ]
  });
  
  Schedule.create({
    jobFuncName: 'getUserUpdate',
    priority: 4,
    interval: 24*60,
    data: [
      { userNum: 2773385 }
    ],
    nextRunAt: new Date(1999,6,8)
  });
  
  Schedule.create({
    jobFuncName: 'getGameData',
    priority: 4,
    interval: 24*60,
    data: [
      { metaType: 'Season' }
    ],
    nextRunAt: new Date(1999,6,8)
  });
};

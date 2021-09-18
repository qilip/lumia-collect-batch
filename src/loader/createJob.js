// import Queue from '../models/queue.js';
import Schedule from '../models/schedule.js';
import metaTypeData from './metaTypes.js';

export default async () => {
  // DB 아무것도 없을때 Job 초기설정
  const setted = await Schedule.findOne({}).exec();
  if(setted) return;
  console.log('Schedule job init');

  Schedule.upsert({
    jobName: 'getUserUpdate',
    priority: 4,
    interval: 24*60,
    data: [
      { userNum: 2773385 }
    ],
    nextRunAt: new Date(1999,6,8)
  });

  Schedule.upsert({
    jobName: 'getGameData',
    priority: 4,
    interval: 24*60,
    data: metaTypeData,
    nextRunAt: new Date(1999,6,8)
  });

  Schedule.upsert({
    jobName: 'getL10nData',
    priority: 4,
    interval: 24*60,
    data: [
      { language: 'Korean' }
    ],
    nextRunAt: new Date(1999,6,8)
  });

  Schedule.upsert({
    jobName: 'getFreeCharacters',
    priority: 4,
    interval: 12*60,
    data: [
      { matchingMode: 2 }
    ],
    nextRunAt: new Date(1999,6,8)
  });

  Schedule.upsert({
    jobName: 'getTopRanks',
    priority: 4,
    interval: 60,
    data: [
      { matchingTeamMode: 1 },
      { matchingTeamMode: 2 },
      { matchingTeamMode: 3 }
    ],
    nextRunAt: new Date(1999,6,8)
  });
};

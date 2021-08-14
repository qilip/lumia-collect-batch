import Bottleneck from 'bottleneck';
import * as ctrl from './ctrl.js';
import Queue from '../models/queue.js';
import Schedule from '../models/schedule.js';

const funcMapper = {
  getUserNum: p => ctrl.getUserNum(p.nickname),
  getUserRank: p => ctrl.getUserRank(p.userNum, p.seasonId),
  getUserStats: p => ctrl.getUserStats(p.userNum, p.seasonId),
  getUserSeason: p => ctrl.getUserSeason(p.userNum, p.seasonId),
  getUserGames: p => ctrl.getUserGames(p.userNum, p.start),
  getUserRecentGames: p => ctrl.getUserRecentGames(p.userNum, p.start, p.limit),
  getGame: p => ctrl.getGame(p.gameId),
  getRoute: p => ctrl.getRoute(p.routeId),
  getFreeCharacters: p => ctrl.getFreeCharacters(p.matchingMode),
};

const funcWeight = {
  getUserNum: p => 1,
  getUserRank: p => 3,
  getUserStats: p => 1,
  getUserSeason: p => 4,
  getUserGames: p => 1,
  getUserRecentGames: p => parseInt(p.limit/10, 10),
  getGame: p => 1,
  getRoute: p => 1,
  getFreeCharacters: p => 1,
};

const baseLimiter = new Bottleneck({
  reservoir: 100,
  reservoirIncreaseAmount: 50,
  reservoirIncreaseInterval: 1000,
  reservoirIncreaseMaximum: 100,
  maxConcurrent: 30,
  minTime: 50,
});

const lockLimiter = new Bottleneck.Group({
  reservoir: 100,
  reservoirIncreaseAmount: 50,
  reservoirIncreaseInterval: 1000,
  reservoirIncreaseMaximum: 100,
  maxConcurrent: 1,
  minTime: 50,
});

export async function queue(){
  let lockTime = new Date();
  lockTime.setMinutes(lockTime.getMinutes() - 10); // 락 걸린 이후로 10분이상 처리안된거
  let job;
  try{
  job = await Queue.findOne({})
                    .where('finished')
                    .equals(false)
                    .lt('lockedAt', lockTime)
                    .sort({ priority: -1 })
                    .exec();
  if(!job) return;
  await Queue.lock(job);
  }catch(e){
    console.error(e);
  }
  const fName = job.jobFuncName;
  let res = null;
  job.data.map(async (param, idx) => {
    const limitOption = {
      priority: job.priority,
      weight: funcWeight[fName](param),
      expiration: 30000,
      id: job._id + '-' + idx,
    };
    try{
      // User DB 동시수정 땜빵처리, atomic 하게 되면 지우기
      if(fName.includes('getUser') && !fName.includes('Num')){
        limitOption.weight = 1;
        res = await lockLimiter.key(param.userNum.toString()).schedule(
                    limitOption,
                    () => funcMapper[fName](param));
      }else
        res = await baseLimiter.schedule(limitOption,
                    () => funcMapper[fName](param));
      if(res) throw res;
    }catch(e){
      // await Queue.unlock(job); // 디버깅용
      console.error(e);
      console.error('JOB: ' + job);
    }
  });
  if(!res) await Queue.finished(job);
}

export async function schedule(){
  const job = await Schedule.findOne({}).sort({ priority: -1, nextRunAt: -1 }).exec();
}

export async function idle(){
  if(baseLimiter.empty()){
  Queue.deleteFinished();
  // console.log('Finished queue deleted');
  }
  // idle work
}

baseLimiter.on('error', (error) => {
  console.error('baseLimiter: ERROR');
  console.error(error);
});

baseLimiter.on('failed', (error, jobInfo) => {
  console.warn('baseLimiter: Job [ ' + JSON.stringify(jobInfo, 0, 2) + ' ] Failed');
  console.warn(error);
});

lockLimiter.on('error', (error) => {
  console.error('lockLimiter: ERROR');
  console.error(error);
});

lockLimiter.on('failed', (error, jobInfo) => {
  console.warn('lockLimiter: Job [ ' + JSON.stringify(jobInfo, 0, 2) + ' ] Failed');
  console.warn(error);
});

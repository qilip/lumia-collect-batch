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

export async function queue(limiter){
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
  job.data.map(async (param, idx) => {
    try{
      const res = await limiter.schedule({
        priority: job.priority,
        weight: funcWeight[job.jobFuncName](param),
        expiration: 30000,
        id: job._id,
      }, () => funcMapper[job.jobFuncName](param));
      if(res) throw res;
      await Queue.finished(job);
    }catch(e){
      await Queue.unlock(job);
      console.error(e);
      console.error('JOB: ' + job);
    }
  });
}

export async function schedule(limiter){
  const job = await Schedule.findOne({}).sort({ priority: -1, nextRunAt: -1 }).exec();
}

export async function idle(limiter){
  
}

export async function cleanupQueue(){
  await Queue.deleteFinished();
  console.log('Finished queue deleted');
}

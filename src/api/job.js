import Bottleneck from 'bottleneck';
import * as er from './er.js';
import * as ctrl from './ctrl.js';
import Queue from '../models/queue.js';
import Schedule from '../models/schedule.js';
import Metadata from '../models/metadata.js';

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
  getGameData: p => ctrl.getGameData(p.metaType),
  getUserUpdate: p => ctrl.getUserUpdate(p.userNum),
  getUserGamesInRange: p => ctrl.getUserGamesInRange(p.userNum, p.start, p.end),
  getTopRanks: p => ctrl.getTopRanks(p.seasonId, p.matchingTeamMode),
  getRecommendRoute: p => ctrl.getRecommendRoute(p.start),
  getL10nData: p => ctrl.getL10nData(p.language),
};

const funcWeight = {
  getUserNum: p => 1,
  getUserRank: p => 3,
  getUserStats: p => 1,
  getUserSeason: p => 4,
  getUserGames: p => 1,
  getUserRecentGames: p => 1, // 어차피 한번에 하나 가져오니..
  getGame: p => 1,
  getRoute: p => 1,
  getFreeCharacters: p => 1,
  getGameData: p => 1,
  getUserUpdate: p => 6,
  getUserGamesInRange: p => 1,
  getTopRanks: p => 1,
  getRecommendRoute: p => 1,
  getL10nData: p => 1,
};

const baseLimiter = new Bottleneck({
  reservoir: 100,
  reservoirIncreaseAmount: 50,
  reservoirIncreaseInterval: 1000,
  reservoirIncreaseMaximum: 100,
  maxConcurrent: 40,
  minTime: 10,
});

const lockLimiter = new Bottleneck.Group({
  reservoir: 100,
  reservoirIncreaseAmount: 50,
  reservoirIncreaseInterval: 1000,
  reservoirIncreaseMaximum: 100,
  maxConcurrent: 1,
  minTime: 10,
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
      expiration: 6000000, // 10min
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
      return;
    }
  });
  await Queue.finished(job);
}

export async function schedule(){
  let lockTime = new Date();
  lockTime.setMinutes(lockTime.getMinutes() - 10); // 락 걸린 이후로 10분이상 처리안된거
  let job;
  try{
  job = await Schedule.findOne({})
                    .lt('nextRunAt', new Date())
                    .lt('lockedAt', lockTime)
                    .sort({ priority: -1, nextRunAt: -1 })
                    .exec();
  if(!job) return;
  await Schedule.lock(job);
  }catch(e){
    console.error(e);
  }
  const fName = job.jobFuncName;
  let res = null;
  job.data.map(async (param, idx) => {
    const limitOption = {
      priority: job.priority,
      weight: funcWeight[fName](param),
      expiration: 6000000, // 10min
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
      // await Schedule.unlock(job); // 디버깅용
      console.error(e);
      console.error('Scheduled JOB: ' + job);
      return;
    }
  });
  await Schedule.finished(job);
}

export async function idle(){
  if(!baseLimiter.empty() || await baseLimiter.running()) return;
  await Queue.deleteFinished();
  // console.log('Finished queue deleted');
  // 한번 호출마다 수집할 개수
  const bulk = parseInt(process.env.BULK, 10) || -1;
  if(bulk <= 0) return;
  let gameId;
  try{
    gameId = await Metadata.findOne({dataName: 'gameId'}).exec();
    if(!gameId){
      console.log('create New gameId metadata');
      //21-08-20 기준 대충 lower upper (의미없는 1인데이터 제외)
      gameId = await Metadata.create({
        dataName: 'gameId',
        data: {
          'lower': 8500000,
          'upper': 11000000
        }
      });
    }
  }catch(e){
    console.error(e);
  }
  if(!gameId.data.lower || !gameId.data.upper){
    console.error('Metadata GameId ERROR');
    return;
  }
  // lower 수집되면 갱신, upper는 유저데이터중 최신분으로 업뎃
  let lower = gameId.data.lower;
  let upper = gameId.data.upper;
  // 수집할거 없을때 upper + bulk + random 쳐서 수집되면 갱신
  if(lower+bulk >= upper){
    try{
      const randInt = Math.floor(Math.random()*99);
      const res = er.getGame(upper + bulk + randInt );
      if(res.statusCode == 200 && er.erCode == 200){
        upper += bulk + randInt;
        await Metadata.update('gameId', {
          data: {
            lower,
            upper
          }
        });
      }
      return;
    }catch(e){
      console.error(e);
      return;
    }
  }
  // 수집
  const curId = Array.from(new Array(bulk), (c, i) => i + lower);
  const req = curId.map(id => baseLimiter.schedule({
    priority: 8,
    weight: 1,
    expiration: 6000000, // 10min
    id: 'idleCollectGame' + '-' + id,
  }, () => ctrl.getGame(id)));
  
  try{
    await Promise.all(req);
  }catch(e){
    console.log(e);
    return;
  }
  
  try{
    await Metadata.update('gameId', {
      data: {
        lower: lower+bulk,
        upper: upper
      }
    });
  }catch(e){
    console.error(e);
  }
}

baseLimiter.on('error', (error) => {
  console.error('baseLimiter: ERROR');
  console.error(error);
});

baseLimiter.on('failed', (error, jobInfo) => {
  console.warn('baseLimiter: Job Failed: ' + JSON.stringify(jobInfo, 0, 2));
  console.warn(error);
});

lockLimiter.on('error', (error) => {
  console.error('lockLimiter: ERROR');
  console.error(error);
});

lockLimiter.on('failed', (error, jobInfo) => {
  console.warn('lockLimiter: Job Failed: ' + JSON.stringify(jobInfo, 0, 2));
  console.warn(error);
});

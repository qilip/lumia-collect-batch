import * as er from './er.js';
import * as ctrl from './ctrl.js';
import Queue from '../models/queue.js';
import Schedule from '../models/schedule.js';
import Metadata from '../models/metadata.js';
import { baseLimiter, baseJob, limitOption } from './job/jobLimiter.js';

export async function queue(){
  if(!baseLimiter.empty() || await baseLimiter.running()) return;
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
  const jobName = job.jobName;
  const error = job.data.map(async (param, idx) => {
    const option = limitOption(job, param, idx);
    try{
      const res = await baseJob(option, jobName, param);
      if(res) throw res;
      else return 0;
    }catch(e){
      // await Queue.unlock(job); // 디버깅용
      console.error(e);
      console.error('JOB: ' + job);
      return 1;
    }
  });
  if(!error.find(a => a === 1)) await Queue.finished(job);
  else await Queue.failed(job);
}

export async function schedule(){
  if(!baseLimiter.empty() || await baseLimiter.running()) return;
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
  const jobName = job.jobName;
  const error = job.data.map(async (param, idx) => {
    const option = limitOption(job, param, idx);
    try{
      const res = await baseJob(option, jobName, param);
      if(res) throw res;
      else return 0;
    }catch(e){
      // await Schedule.unlock(job); // 디버깅용
      console.error(e);
      console.error('Scheduled JOB: ' + job);
      return 1;
    }
  });
  if(!error.find(a => a === 1)) await Schedule.finished(job);
  else await Schedule.failed(job);
}

export async function idle(){
  if(!baseLimiter.empty() || await baseLimiter.running()) return;
  await Queue.deleteFinished();
  // console.log('Finished queue deleted');
  // 한번 호출마다 수집할 개수
  let bulkData = await Metadata.findOne({dataName: 'idleGameCollectBulk'}).exec();
  if(!bulkData) bulkData = await Metadata.upsert({dataName: 'idleGameCollectBulk',
                                                  data: { 'bulk': 0 }
                                                });
  const bulk = bulkData?.bulk ?? 0;
  if(bulk <= 0) return;
  let gameId;
  try{
    gameId = await Metadata.findOne({dataName: 'gameId'}).exec();
    if(!gameId){
      console.log('upsert New gameId metadata');
      //21-08-20 기준 대충 lower upper (의미없는 1인데이터 제외)
      gameId = await Metadata.upsert({
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
        await Metadata.updateData('gameId', {
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
  const option = limitOption(null, null, null, {
    priority: 8,
    weight: 1,
    id: 'idleCollectGame' + '-' + id,
  });
  const req = curId.map(id => baseLimiter.schedule(option, () => ctrl.getGame(id)));
  try{
    await Promise.all(req);
  }catch(e){
    console.log(e);
    return;
  }

  try{
    await Metadata.updateDataData('gameId', {
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

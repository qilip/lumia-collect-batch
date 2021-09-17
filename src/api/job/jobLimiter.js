import Bottleneck from 'bottleneck';
import { jobMapper, jobWeight } from './jobMapper.js';

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

async function baseJob(option, jobName, param){
  return baseLimiter.schedule(option,
    () => jobMapper[jobName](param));
}

async function lockJob(option, jobName, param){
  return lockLimiter.key(param.userNum.toString()).schedule(option,
    () => jobMapper[jobName](param));
}

function limitOption(job, param, idx, override = {}){
  return {
    priority: override?.priority ?? job.priority,
    weight: override?.weight ?? jobWeight[job.jobName][param],
    expiration: override?.expiration ?? 6000000, // 10min
    id: override?.id ?? job._id + '-' + idx,
  }
}

export { baseLimiter, lockLimiter, baseJob, lockJob, limitOption };

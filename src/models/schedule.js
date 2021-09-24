import mongoose from 'mongoose';
const { Schema } = mongoose;

const Schedule = new Schema({
  jobName: { type: String, required: true },
  priority: { type: Number, required: true},
  interval: Number,
  data: { type:Array, default: [], _id: false },
  lockedAt: { type: Date, default: new Date(1999, 6-1, 8) },
  lastFinishedAt: { type: Date, default: new Date(1999, 6-1, 8) },
  nextRunAt: { type: Date, required: true},
  failCount: { type: Number, default: 0 },
}, { timestamps: true });

Schedule.index({ priority: -1, nextRunAt: -1 });

Schedule.statics.upsert = function (ScheduleData) {
  const Schedule = new this(ScheduleData);
  return Schedule.save();
};

Schedule.statics.lock = function (job) {
  job.lockedAt = new Date();
  return job.save();
};

Schedule.statics.unlock = function (job) {
  job.lockedAt = new Date(2000, 6, 8);
  return job.save();
};

Schedule.statics.finished = function (job) {
  let nextRunTime = new Date();
  nextRunTime.setMinutes(nextRunTime.getMinutes() + job.interval);
  job.lastFinishedAt = new Date();
  job.nextRunAt = nextRunTime;
  return job.save();
};

Schedule.statics.failed = function (job) {
  job.failCount += 1;
  return job.save();
}

export default mongoose.model('Schedule', Schedule);

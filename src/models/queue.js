import mongoose from 'mongoose';
const { Schema } = mongoose;

const Queue = new Schema({
  jobName: { type: String, required: true },
  priority: { type: Number, required: true, index: true },
  data: { type: Array, default: [], _id: false },
  lockedAt: { type: Date, default: new Date(1999, 6-1, 8) },
  finished: { type: Boolean, default: false },
  failCount: { type: Number, default: 0 },
}, { timestamps: true });

Queue.statics.upsert = function (queueData) {
  const Queue = new this(queueData);
  return Queue.save();
};

Queue.statics.lock = function (job) {
  job.lockedAt = new Date();
  return job.save();
};

Queue.statics.unlock = function (job) {
  job.lockedAt = new Date(2000, 6, 8);
  return job.save();
};

Queue.statics.finished = function (job) {
  job.finished = true;
  return job.save();
};

Queue.statics.deleteFinished = function() {
  return this.deleteMany({ finished: true });
};

Queue.statics.failed = function(job) {
  job.failCount += 1;
  return job.save();
}

export default mongoose.model('Queue', Queue);

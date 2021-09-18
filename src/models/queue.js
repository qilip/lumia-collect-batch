import mongoose from 'mongoose';
const { Schema } = mongoose;

const Queue = new Schema({
  jobName: { type: String, required: true },
  priority: { type: Number, required: true, index: true },
  data: { type: Array, default: [], _id: false },
  lockedAt: { type: Date, default: new Date(1999, 6-1, 8) },
  finished: { type: Boolean, default: false }
}, { timestamps: true, strict: false });

Queue.statics.upsert = async function (queueData) {
  
  const Queue = new this(queueData);
  return Queue.save();
};

Queue.statics.lock = async function (job) {
  job.lockedAt = new Date();
  return job.save();
};

Queue.statics.unlock = async function (job) {
  job.lockedAt = new Date(2000, 6, 8);
  return job.save();
};

Queue.statics.finished = async function (job) {
  job.finished = true;
  return job.save();
};

Queue.statics.deleteFinished = function() {
  return this.deleteMany({ finished: true });
};

export default mongoose.model('Queue', Queue);

import mongoose from 'mongoose';
const { Schema } = mongoose;

const Schedule = new Schema({
  jobFuncName: { type: String, required: true },
  priority: { type: Number, required: true},
  interval: Number,
  data: { type:Array, default: [], _id: false },
  lockedAt: { type: Date, default: new Date(1999, 6, 8) },
  lastFinishedAt: { type: Date, default: new Date(1999, 6, 8) },
  nextRunAt: { type: Date, required: true}
}, { timestamps: true, strict: false });

Schedule.index({ priority: -1, nextRunAt: -1 });

Schedule.statics.create = async function (ScheduleData) {
  
  const Schedule = new this(ScheduleData);
  return Schedule.save();
};

export default mongoose.model('Schedule', Schedule);

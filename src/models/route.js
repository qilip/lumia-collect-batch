import mongoose from 'mongoose';
const { Schema } = mongoose;

const Route = new Schema({
  _id: Number,
  routeId: { type: Number, unique: true, required: true },
  title: String,
  userNum: Number,
  userNickname: String,
  characterCode: Number,
  slotId: Number,
  weaponType: Number,
  weaponCodes: [Number],
  paths: [Number],
  count: Number,
  version: String,
  teamMode: Number,
  languageCode: String,
  routeVersion: Number,
  like: Number,
  unLike: Number,
  likeScore: Number,
  unLikeScore: Number,
  accumulateLite: Number,
  accumulateUnLike: Number,
  accumulateLikeScore: Number,
  accumulateUnLikeScore: Number,
  share: Boolean,
  updateDtm: Date,
  starScore: Number,
  accumulateStarScore: Number,
  skillPath: [String],
  routeDesc: {
    qDesc: String,
    wDesc: String,
    eDesc: String,
    rDesc: String,
    tDesc: String,
    dDesc: String,
    descTitle: String,
    desc: String,
    dataUpdatedAt: { type: Date, default: new Date() },
  },
}, { timestamps: true });

Route.statics.findByRouteId = function (routeId) {
  return this.findById(routeId).exec();
};

Route.statics.upsert = async function (routeData) {
  const existRoute = await this.findById(routeData.routeId).exec();
  routeData['_id'] = routeData.routeId;
  routeData['dataUpdatedAt'] = new Date();
  if(routeData.weaponCode)
    routeData.weaponCodes = routeData.weaponCodes.split(',');
  if(routeData.paths)
    routeData.paths = routeData.paths.split(',');
  if(routeData.skillPath)
    routeData.skillPath = routeData.skillPath.split(',');
  if(existRoute){
    Object.assign(existRoute, routeData);
    return existRoute.save();
  }
  const Route = new this(routeData);
  return Route.save();
};

export default mongoose.model('Route', Route);

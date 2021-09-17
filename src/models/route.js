import mongoose from 'mongoose';
const { Schema } = mongoose;

const Route = new Schema({
  routeId: { type: Number, unique: true, required: true },
}, { timestamps: true, strict: false });

Route.statics.findByRouteId = function (routeId) {
  return this.findOne({routeId}).exec();
};

Route.statics.upsert = async function (routeData) {
  const existRoute = await this.findOne({routeId: routeData.routeId}).exec();
  if(existRoute){
    if(routeData.routeVersion && existRoute.routeVersion < routeData.routeVersion)
      existRoute = routeData;
    return existRoute.save();
  }
  const Route = new this(routeData);
  return Route.save();
};

export default mongoose.model('Route', Route);

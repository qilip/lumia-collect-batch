const mongoose = require('mongoose');
const { Schema } = mongoose;

const Route = new Schema({
  id: { type: Number, unique: true, required: true },
}, { timestamps: true, strict: false });

Route.statics.findByRouteId = function (routeId) {
  return this.findOne({routeId}).exec();
};

Route.statics.create = function (routeData) {
  const route = new this(routeData);
  return route.save();
};

Route.statics.update = function (routeDoc, routeData) {
  if(routeData.routeVersion && routeDoc.routeVersion < routeData.routeVersion)
    routeDoc = routeData;
  return routeDoc.save();
};

module.exports = mongoose.model('Route', Route);

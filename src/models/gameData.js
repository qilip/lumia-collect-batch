import mongoose from 'mongoose';
const { Schema } = mongoose;

const GameData = new Schema({
  metaType: { type: String, unique: true, required: true },
  data: {}
}, { timestamps: true });

GameData.statics.findByMetaType = function (metaType) {
  return this.findOne({metaType}).exec();
};

GameData.statics.upsert = async function (gameData) {
  const existData = await this.findOne({metaType: gameData.metaType}).exec();
  if(existData){
    if(gameData) existData.data = gameData.data;
    return existData.save();
  }
  const GameData = new this(gameData);
  return GameData.save();
};

export default mongoose.model('GameData', GameData);

import mongoose from 'mongoose';
const { Schema } = mongoose;

const Game = new Schema({
  gameId: { type: Number, unique: true, required: true },
  seasonId: Number,
  matchingMode: Number,
  matchingTeamMode: Number,
  versionMajor: Number,
  versionMinor: Number,
  serverName: String,
  startDtm: Date,
  botAdded: Number,
  mmrAvg: Number,
  games: { type: Array },
}, { timestamps: true, strict: false });

Game.statics.findByGameId = function (gameId) {
  return this.findOne({gameId}).exec();
};

Game.statics.create = async function (gameData) {
  const existGame = await this.findOne({gameId:gameData.gameId}).exec();
  if(existGame){
    Object.assign(existGame, gameData);
    return existGame.save();
  }
  const game = new this(gameData);
  return game.save();
};

export default mongoose.model('Game', Game);

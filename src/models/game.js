import mongoose from 'mongoose';
const { Schema } = mongoose;

const Game = new Schema({
  _id: Number,
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
  games: Array,
  dataUpdatedAt: { type: Date, default: new Date() },
}, { timestamps: true });

Game.statics.findByGameId = function (gameId) {
  return this.findById(gameId).exec();
};

Game.statics.upsert = async function (newGame) {
  const existGame = await this.findById(newGame.gameId).exec();
  if(existGame){
    Object.assign(existGame, newGame);
    existGame.dataUpdatedAt = new Date();
    return existGame.save();
  }
  newGame['_id'] = newGame.gameId;
  newGame['dataUpdatedAt'] = new Date();
  const game = new this(newGame);
  return game.save();
};

export default mongoose.model('Game', Game);

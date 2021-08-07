const mongoose = require('mongoose');
const { Schema } = mongoose;

const Game = new Schema({
  gameId: { type: Number, unique: true, required: true }
}, { timestamps: true, strict: false });

Game.statics.findByGameId = function (gameId) {
  return this.findOne({gameId}).exec();
};

Game.statics.create = function (gameData) {
  const game = new this(gameData);
  return game.save();
};

Game.statics.update = function (gameDoc, gameData) {
  if(gameData) Object.assign(gameDoc, gameData);
  return gameDoc.save();
};

module.exports = mongoose.model('Game', Game);

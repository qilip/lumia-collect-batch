import mongoose from 'mongoose';
const { Schema } = mongoose;

const GamePreview = new Schema({
  _id: false,
  //게임 공통사항
  gameId: Number,
  seasonId: Number,
  matchingMode: Number,
  matchingTeamMode: Number,
  versionMajor: Number,
  versionMinor: Number,
  startDtm: Date,
  serverName: String,
  // mmrAvg: Number,
  //개인 기본사항
  characterNum: Number,
  skinCode: Number,
  characterLevel: Number,
  gameRank: Number,
  playerKill: Number,
  playerAssistant: Number,
  monsterKill: Number,
  bestWeapon: Number,
  bestWeaponLevel: Number,
  equipment: {},
  damageToPlayer: Number,
  routeIdOfStart: Number,
});

export default GamePreview;

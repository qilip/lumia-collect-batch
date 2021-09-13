import mongoose from 'mongoose';
const { Schema } = mongoose;

const gamePreview = new Schema({
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

const UserGame = new Schema({
  // 분할 할 일 있을까봐 userNum을 _id로 사용 안함
  userNum: { type: Number, unique: true, required: true },
  userGames: [gamePreview],
  //이전 번호가 있는지 유무 n: 모름, y: 있음, f: 없음(끝 or 오래됨)
  hasNextGame: {
    type: Map,
    of: String,
  },
  dataUpdatedAt: { type: Date, default: new Date() },
}, { timestamps: true });

// Model methods

UserGame.statics.findByUserNum = function (userNum) {
  return this.findOne({userNum}).exec();
};

// * data에는 userNum, userGames, start, last
// userGames 통해서 hasNextGame 비교 & 저장
UserGame.statics.upsert = function (data) {
  let userGame = await this.findOne({userNum: data.userNum}).exec();
  if(!userGame) userGame = new this({userNum: data.userNum});
  if(data.userGames){
    const gameCount = data.userGames.length - 1;
    if(gameCount && data.start) user.hasNextGame.set(start.toString(), 'y');

    data.userGame.map((game, idx) => {
      const dbValue = userGame.hasNextGame.get(game.gameId);
      if(!dbValue) userGame.userGames.push(game);

      let hasNextGame;
      if(gameCount === idx){ // 배열 마지막
        if(data.last === true) hasNextGame = 'f'; // 마지막 데이터면
        else hasNextGame = 'n'; // 그냥 마지막 수집건
      }else hasNextGame = 'y'; // 배열 중간
      if(dbValue === 'y') hasNextGame = 'y'; // DB Y
      if(dbValue === 'f' && hasNextGame === 'n') hasNextGame = 'f'; // DB F

      user.hasNextGame.set(game.gameId.toString(), hasNextGame);
    };
  }

  userGame.dataUpdatedAt = new Date();
  return userGame.save();
}

export default mongoose.model('UserGame', UserGame);

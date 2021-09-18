import mongoose from 'mongoose';
const { Schema } = mongoose;

import gamePreview from './gamePreview.js';

const UserGame = new Schema({
  // 분할 할 일 있을까봐 userNum을 _id로 사용 안함
  userNum: { type: Number, unique: true, required: true },
  userGames: [gamePreview],
  //이전 번호가 있는지 유무 n: 모름, y: 있음, f: 없음(끝 or 오래됨)
  hasNextGame: {
    type: Map,
    of: String,
    default: {},
  },
  dataUpdatedAt: { type: Date, default: new Date() },
}, { timestamps: true });

// Model methods

UserGame.statics.findByUserNum = function (userNum) {
  return this.findOne({userNum}).exec();
};

// * data에는 userNum, userGames, start, isLast
// userGames 통해서 hasNextGame 비교 & 저장
UserGame.statics.upsert = async function (data) {
  let userGame = await this.findOne({userNum: data.userNum}).exec();
  if(!userGame) userGame = new this({userNum: data.userNum});
  if(!data.isLast) data['isLast'] = false;
  if(data.userGames){
    const gameCount = data.userGames.length - 1;
    if(gameCount && data?.start) userGame.hasNextGame.set(data.start.toString(), 'y');

    data.userGames.map((game, idx) => {
      const dbValue = userGame.hasNextGame.get(game.gameId.toString());
      if(!dbValue) userGame.userGames.push(game);

      let hasNextGame;
      if(gameCount === idx){ // 배열 마지막
        if(data.isLast === true) hasNextGame = 'f'; // 마지막 데이터면
        else hasNextGame = 'n'; // 그냥 마지막 수집건
      }else hasNextGame = 'y'; // 배열 중간
      if(dbValue === 'y') hasNextGame = 'y'; // DB Y
      if(dbValue === 'f' && hasNextGame === 'n') hasNextGame = 'f'; // DB F

      userGame.hasNextGame.set(game.gameId.toString(), hasNextGame);
    });
  }

  userGame.dataUpdatedAt = new Date();
  return userGame.save();
}

export default mongoose.model('UserGame', UserGame);

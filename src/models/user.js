import mongoose from 'mongoose';
const { Schema } = mongoose;

import gamePreview from './gamePreview.js';

const User = new Schema({
  _id: Number,
  userNum: { type: Number, unique: true, required: true },
  nickname: { type: String, index: true, required: true },
  beforeNickname: [{
    lastseenAt: Date,
    nickname: String,
    _id: false
  }],
  userRank: {
    type: Map,
    of: Array,
    default: {}
  },
  userStats: {
    type: Map,
    of: Array,
    default: {}
  },
  userGames: [gamePreview],
  dataUpdatedAt: { type: Date, default: new Date() },
}, { timestamps: true });

// Model methods

User.statics.findByUserNum = function (userNum) {
  return this.findById(userNum).exec();
};

User.statics.findByNickname = function (nickname) {
  return this.findOne({nickname}).exec();
};

User.statics.upsert = async function (data) {
  let user = await this.findById(data.userNum).exec();
  if(!user) user = new this({
    '_id': data.userNum,
    userNum: data.userNum,
    nickname: '##UNKNOWN##',
  });

  if(data.nickname && user.nickname !== data.nickname){
    if(user.nickname !== '##UNKNOWN##')
      user.beforeNickname.push(
        {
          lastseenAt: user.dataUpdatedAt,
          nickname: user.nickname
        }
      );
    user.nickname = data.nickname;
  }

  if(data.userRank){
    const seasonId = data.userRank.seasonId;
    user.userRank.set(seasonId, data.userRank.rank);
  }
  if(data.userStats){
    const seasonId = data.userStats.seasonId;
    user.userStats.set(seasonId, data.userStats.stats);
  }

  if(data.userGames){
    //최근 10게임만 저장
    let newGames = data.userGames.slice(0, 10);
    newGames.push(...user.userGames);
    const uGames = newGames.reduce((acc, cur) => {
      if(!acc.some(cu => cu.gameId === cur.gameId)) acc.push(cur);
      return acc;
    }, []);
    uGames.sort((a, b) => {
      return b.gameId - a.gameId;
    });
    user.userGames = uGames.slice(0, 10);
  }

  user.dataUpdatedAt = new Date();
  return user.save();
}

export default mongoose.model('User', User);

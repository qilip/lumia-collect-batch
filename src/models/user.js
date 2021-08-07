import mongoose from 'mongoose';
const { Schema } = mongoose;

const User = new Schema({
  userNum: { type: Number, index: true, required: true },
  nickname: { type: String, unique: true, required: true },
  beforeNickname: [{ any: {} }],
  userRankStat: [{ any: {} }],
  recentGames: [{ any: {} }],
  collectedGamesId: [{ any: {} }]
}, { timestamps: true, strict: false });

// Model methods

User.statics.findByNickname = function (nickname) {
  return this.findOne({nickname}).exec();
};

User.statics.findByUserNum = function (userNum) {
  return this.findOne({userNum}).exec();
};

User.statics.create = function (userData) {
  const user = new this(userData);
  return user.save();
};

User.statics.update = function (userDoc, newData) {
  if(newData.nickname && userDoc.nickname !== newData.nickname){
    userDoc.beforeNickname.push(
      {
        lastTime: userDoc.updatedAt,
        nickname: userDoc.nickname
      }
    );
    userDoc.nickname = newData.nickname;
    userDoc.markModified('beforeNickname');
  }
  
  if(newData.userRankStat){
    userDoc.userRankStat.push(...newData.userRankStat);
    userDoc.markModified('userRankStat');
  }
  
  if(newData.recentGames){
    newData.recentGames.push(...userDoc.recentGames);
    userDoc.recentGames = [...new Set(newData.recentGames)];
    userDoc.markModified('recentGames');
  }
  
  if(newData.collectedGamesId){
    newData.collectedGamesId.push(...userDoc.collectedGamesId);
    userDoc.collectedGamesId = [...new Set(newData.collectedGamesId)];
    userDoc.markModified('collectedGamesId');
  }
  
  return userDoc.save();
};

User.statics.changeNickname = function (userDoc, nickname) {
  userDoc.nickname = nickname;
  userDoc.save();
};

export default mongoose.model('User', User);

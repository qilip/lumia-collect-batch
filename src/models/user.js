import mongoose from 'mongoose';
const { Schema } = mongoose;

const User = new Schema({
  userNum: { type: Number, unique: true, required: true },
  nickname: { type: String, index: true, required: true },
  beforeNickname: [{
    lastseenAt: Date,
    nickname: String,
    _id: false
  }],
  userRankStat: [{ 
    updatedAt: Date,
    seasonId: Number,
    solo: { type:Array, default: [], _id: false },
    duo: { type:Array, default: [], _id: false },
    squad: { type:Array, default: [], _id: false },
    userStats: { type:Array, default: [], _id: false },
    _id: false
  }],
  recentGames: { type:Array, default: [], _id: false },
  collectedGameId: {
    type: Map,
    of: String,
    default: {}
  }
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
    if(userDoc.nickname !== '##UNKNOWN##')
      userDoc.beforeNickname.push(
        {
          lastseenAt: userDoc.updatedAt,
          nickname: userDoc.nickname
        }
      );
    userDoc.nickname = newData.nickname;
    userDoc.markModified('beforeNickname');
  }
  
  if(newData.userRankStat){
    userDoc.userRankStat.push(newData.userRankStat);
    userDoc.markModified('userRankStat');
  }

  if(newData.collectedGameId){
    newData.collectedGameId.map((cur, idx) => {
      const value = userDoc.collectedGameId.get(cur.gameId);
      if(value){
        if(cur.hasNext === 'f')
          userDoc.collectedGameId.set(cur.gameId, cur.hasNext);
        else if(value === 'n' && cur.hasNext ==='y')
          userDoc.collectedGameId.set(cur.gameId, cur.hasNext);
      }else{
        userDoc.collectedGameId.set(cur.gameId, cur.hasNext);
        userDoc.recentGames.push(newData.recentGames[idx]);
      }
    });
    
    userDoc.markModified('recentGames');
    userDoc.markModified('collectedGameId');
  }
  
  return userDoc.save();
};

export default mongoose.model('User', User);

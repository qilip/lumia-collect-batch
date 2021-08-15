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
  userRank: {
    type: Map,
    of: {
      solo: {},
      duo: {},
      squad: {},
      _id: false
    },
    default: {}
  },
  userStats: {
    type: Map,
    of: Array,
    default: {}
  },
  recentGames: { type: Array, default: [], _id: false },
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
  
  if(newData.userRank){
    const seasonId = newData.userRank.seasonId;
    userDoc.userRank.set(seasonId, newData.userRank.rank);
    userDoc.markModified('userRank');
  }
  if(newData.userStats){
    const seasonId = newData.userStats.seasonId;
    userDoc.userStats.set(seasonId, newData.userStats.userStats);
    userDoc.markModified('userStats');
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

// User.statics.upsert = function (userNum, userData){
//   const filter = { userNum };
//   let update = {};
//   if(userData.nickname){
//     Object.assign(update, { nickname: userData.nickname });
//     if(userData.nickname !== '##UNKNOWN##')
//       Object.assign(update, { $push: {
//         beforeNickname: {
//           firstSeenAt: Date(),
//           nickname: userData.nickname
//         }
//       } });
//   }
//   if(userData.userRank){
//     const seasonId = userData.userRank.seasonId;
//     // 게터세터 어캄??
//   }
//   return User.findOneAndUpdate(filter, update, {
//     new: true,
//     upsert: true,
//     lean: true // 되나?
//   }).exec();
// };

export default mongoose.model('User', User);

import mongoose from 'mongoose';
const { Schema } = mongoose;

const TopRank = new Schema({
  seasonId: Number,
  matchingTeamMode: Number,
  topRanks: Array
}, { timestamps: true });

TopRank.statics.upsert = async function (topRankData) {
  const existRank = await this.findOne({
    seasonId: topRankData.seasonId,
    matchingTeamMode: topRankData.matchingTeamMode
  }).exec();
  if(existRank){
    if(topRankData.topRanks)
      existRank.topRanks = topRankData.topRanks;
    return existRank.save();
  }
  const TopRank = new this(topRankData);
  return TopRank.save();
};

export default mongoose.model('TopRank', TopRank);

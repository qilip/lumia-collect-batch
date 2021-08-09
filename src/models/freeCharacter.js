import mongoose from 'mongoose';
const { Schema } = mongoose;

const FreeCharacter = new Schema({
  matchingMode: Number,
  characters: [Number],
}, { timestamps: true, strict: false });

FreeCharacter.statics.create = async function (freeCharactersData) {
  const sortedCharacters = freeCharactersData.characters.slice().sort((a,b)=>a-b);
  const lastFreeCharacers = await this.findOne().sort({ _id: -1 }).lean().exec();
  if(lastFreeCharacers &&
    JSON.stringify(lastFreeCharacers.characters) === JSON.stringify(sortedCharacters)
    && lastFreeCharacers.matchingMode === freeCharactersData.matchingMode
  ){
    return;
  }else{
    const freeCharacters = new this({
      matchingMode: freeCharactersData.matchingMode,
      characters: sortedCharacters
    });
    return freeCharacters.save();
  }
};

export default mongoose.model('FreeCharacter', FreeCharacter);

import mongoose from 'mongoose';
const { Schema } = mongoose;

const Metadata = new Schema({
  dataName: { type: String, required: true, unique: true },
  data: { type: {}, _id: false }
}, { timestamps: true, strict: false });

Metadata.statics.upsert = async function (metaData) {
  
  const Metadata = new this(metaData);
  return Metadata.save();
};

Metadata.statics.updateData = async function (dataName, newData) {
  // atomic 하게 바꾸기
  let update = {};
  if(newData){
    Object.assign(update, newData);
  }
  return this.findOneAndUpdate({dataName}, update, {
    new: true
  }).exec();
};

export default mongoose.model('Metadata', Metadata);

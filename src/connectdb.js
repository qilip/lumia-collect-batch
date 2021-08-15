import mongoose from 'mongoose';

export default async () => {
  async function connect(){
    try{
      await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        serverSelectionTimeoutMS: 5000
      })
      .then(console.log('MongoDB Connected'));
    }catch(e){
      console.log(e);
    }
  }
  await connect();
  mongoose.connection.on('disconnected', connect);
};

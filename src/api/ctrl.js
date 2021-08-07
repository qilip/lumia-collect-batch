import * as er from './er.js';
import User from '../models/user.js'

export async function getUserNum(nickname){
  const existNickname = await User.findByNickname(nickname);
    
  let res;
  try{
    res = await er.getUserNum(nickname);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const userNum = res.data.user.userNum;
    const existUserNum = await User.findByUserNum(userNum);
    if(!existNickname && !existUserNum){
      
    }else if(existNickname && existUserNum){
      
    }else{
      
    }
  }else{
    console.log(res.message);
  }
}

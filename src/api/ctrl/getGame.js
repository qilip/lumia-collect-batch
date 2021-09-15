import * as er from '../er.js';
import Game from '../../models/game.js';

export async function getGame(gameId){
  let res;
  try{
    res = await er.getGame(gameId);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const saved = await Game.upsert(res.data);
    if(saved) console.log(gameId + ' gamedata saved or updated');
  }else{
    return res;
  }
}

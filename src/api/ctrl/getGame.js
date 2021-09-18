import * as er from '../er.js';
import Game from '../../models/game.js';

import { getOrgGame, getGamePreview } from './util.js';
import saveUser from './saveUser.js';

export async function getGame(gameId){
  const exist = await Game.exists({ _id: gameId });
  if(exist) return;
  let res;
  try{
    res = await er.getGame(gameId);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    res.data.map((game) => {
      saveUser({
        userNum: game.userNum,
        nickname: game.nickname,
        userGames: [getGamePreview(game)],
      });
    });
    const orgGame = getOrgGame(res.data);
    const saved = await Game.upsert(orgGame);
    if(saved) console.log(gameId + ' gamedata saved or updated');
  }else{
    return res;
  }
}

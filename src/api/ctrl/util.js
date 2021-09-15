import * as er from '../er.js';
import GameData from '../../models/gameData.js';

export async function getCurrentSeason(){
  let season = await GameData.findByMetaType('Season');
  if(!season){
    try{
      const res = await er.getGameData('Season');
      if(res.erCode === 200){
        season = await GameData.create({
          metaType: 'Season',
          data: res.data
        });
        if(season) console.log('Season GameData saved or updated');
      }else{
        throw new Error('get Season data failed');
      }
    }catch(e){
      console.error(e);
    }
  }

  return season.data.data.find(cur =>
    new Date(cur.seasonStart) <= new Date() && new Date() <= new Date(cur.seasonEnd)
  ).seasonID;
}

export function getGamePreview(game){
  return {
    gameId: game.gameId,
    seasonId: game.seasonId,
    matchingMode: game.matchingMode,
    matchingTeamMode: game.matchingTeamMode,
    versionMajor: game.versionMajor,
    versionMinor: game.versionMinor,
    startDtm: game.startDtm,
    serverName: game.serverName,
    characterNum: game.characterNum,
    skinCode: game.skinCode,
    characterLevel: game.characterLevel,
    gameRank: game.gameRank,
    playerKill: game.playerKill,
    playerAssistant: game.playerAssistant,
    monsterKill: game.monsterKill,
    bestWeapon: game.bestWeapon,
    bestWeaponLevel: game.bestWeaponLevel,
    equipment: game.equipment,
    damageToPlayer: game.damageToPlayer,
    routeIdOfStart: game.routeIdOfStart,
  };
}

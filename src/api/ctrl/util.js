import * as er from '../er.js';
import GameData from '../../models/gameData.js';
import Queue from '../../models/queue.js';
import Route from '../../models/route.js';

export async function getCurrentSeason(){
  let season = await GameData.findByMetaType('Season');
  if(!season){
    try{
      const res = await er.getGameData('Season');
      if(res.erCode === 200){
        season = await GameData.upsert({
          metaType: 'Season',
          data: res.data
        });
        // if(season) console.log('Season GameData saved or updated');
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

// 원본 er에서 데이터 정리후 반환
export function getOrgGame(games){
  const orgGame = {
    gameId: games[0].gameId,
    seasonId: games[0].seasonId,
    matchingMode: games[0].matchingMode,
    matchingTeamMode: games[0].matchingTeamMode,
    versionMajor: games[0].versionMajor,
    versionMinor: games[0].versionMinor,
    serverName: games[0].serverName,
    startDtm: games[0].startDtm,
    botAdded: games[0].botAdded,
    mmrAvg: games[0].mmrAvg,
    games: [],
  };
  games.map(game => {
    const {gameId, seasonId, matchingMode,
    matchingTeamMode, versionMajor,
    versionMinor, serverName, startDtm,
    botAdded, mmrAvg, ...data} = game;
    orgGame.games.push(data);
  });
  return orgGame;
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

export function getOrgRoute(route){
  const {id, ...routeInfo} = route.route.recommendWeaponRoute;
  const {recommendWeaponRouteId=id, skillPath='', ...routeDesc} = route.route?.recommendWeaponRouteDesc ?? {
    routeDesc: '',
  };
  return {
    routeId: id,
    ...routeInfo,
    skillPath,
    routeDesc,
  };
}

export async function addGameQueue(gameIds){
  return Queue.upsert({
    jobName: 'getGame',
    priority: 8,
    data: gameIds,
  });
}

export async function addRouteQueue(routeIds){
  const newRoutes = (await Promise.all(
    routeIds.map(async (cur) => {
      const existRoute = await Route.findByRouteId(cur);
      if(!existRoute && cur > 0) return cur;
    })
  )).reduce((acc, cur) => {
    if(cur) acc.push( {routeId: cur} );
    return acc;
  }, []);
  return Queue.upsert({
    jobName: 'getRoute',
    priority: 8,
    data: newRoutes,
  });
}

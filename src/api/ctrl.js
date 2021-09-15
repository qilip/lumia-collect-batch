import * as er from './er.js';
import User from '../models/user.js';
import Route from '../models/route.js';
import FreeCharacter from '../models/freeCharacter.js';
import GameData from '../models/gameData.js';
import TopRank from '../models/topRank.js';

// TODO: name Refactor
import * as ctrlUtil from './ctrl/util.js';
import * as ctrlGame from './ctrl/getGame.js';
import * as ctrlUser from './ctrl/user.js';

async function getCurrentSeason(){
  return ctrlUtil.getCurrentSeason();
}

export async function getUserNum(nickname){
  return ctrlUser.getUserNum(nickname);
}

export async function getUserRank(userNum, seasonId){
  return ctrlUser.getUserRank(userNum, seasonId);
}

export async function getUserStats(userNum, seasonId){
  return ctrlUser.getUserStats(userNum, seasonId);
}

export async function getUserSeason(userNum, seasonId){
  return ctrlUser.getUserSeason(userNum, seasonId);
}

export async function getUserGames(userNum, start){
  return ctrlUser.getUserGames(userNum, start);
}

export async function getUserRecentGames(userNum, start, limit){
  return ctrlUser.getUserRecentGames(userNum, start, limit);
}

export async function getGame(gameId){
  return ctrlGame.getGame(gameId);
}

export async function getRoute(routeId){
  let res;
  try{
    res = await er.getRoute(routeId);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const saved = await Route.create(res.data);
    if(saved) console.log(routeId + ' route saved or updated');
  }else{
    return res;
  }
}

export async function getFreeCharacters(matchingMode){
  let res;
  try{
    res = await er.getFreeCharacters(matchingMode);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const saved = await FreeCharacter.create({
      matchingMode,
      characters: res.data.freeCharacters
    });
    if(saved) console.log(matchingMode + ' FreeCharacter saved');
  }else{
    return res;
  }
}

export async function getUserUpdate(userNum){
  // userSeason 현재시즌, userStat 일겜, 최근경기
  const seasonId = await getCurrentSeason();
  try{
    // User 동시수정 문제때문에 순차수집 아몰랑 나중에 고쳐
    await getUserSeason(userNum, seasonId);
    await getUserStats(userNum, 0);
    await getUserGames(userNum);
  }catch(e){
    console.error(e);
  }
}

export async function getUserGamesInRange(userNum, start, end){
  // start 부터 end 까지 수집
  return ctrlUser.getUserGamesInRange(userNum, start, end);
}

export async function getTopRanks(seasonId, matchingTeamMode){
  // 랭킹
  if(seasonId === undefined || seasonId === null)
    seasonId = await getCurrentSeason();
  let res;
  try{
    res = await er.getTopRanks(seasonId, matchingTeamMode);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const saved = await TopRank.create({
      seasonId,
      matchingTeamMode,
      topRanks: res.data.topRanks
    });
    if(saved) console.log(`seasonId ${seasonId}, matchingTeammode ${matchingTeamMode} TopRank saved or updated`);
  }
}

export async function getRecommendRoute(start){
  // 추천 루트목록
}

export async function getGameData(metaType){
  let res;
  try{
    res = await er.getGameData(metaType);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const saved = await GameData.create({
      metaType: metaType,
      data: res.data
    });
    if(saved) console.log(metaType + ' GameData saved or updated');
  }else{
    return res;
  }
}

export async function getL10nData(language){
  let res;
  try{
    res = await er.getL10nData(language);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const saved = await GameData.create({
      metaType: 'l10n-' + language,
      data: res.data
    });
    if(saved) console.log(language + ' l10n saved or updated');
  }else{
    return res;
  }
}

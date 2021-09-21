import * as er from './er.js';
import Route from '../models/route.js';
import FreeCharacter from '../models/freeCharacter.js';
import GameData from '../models/gameData.js';
import TopRank from '../models/topRank.js';

// TODO: name Refactor
export * from './ctrl/util.js';
export * from './ctrl/getGame.js';
export * from './ctrl/user.js';

import { getCurrentSeason, getOrgRoute } from './ctrl/util.js';

export async function getRoute(routeId){
  let res;
  try{
    res = await er.getRoute(routeId);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 404) return;
  if(res.erCode === 200){
    const saved = await Route.upsert(getOrgRoute(res.data));
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
    const saved = await FreeCharacter.upsert({
      matchingMode,
      characters: res.data.freeCharacters
    });
    if(saved) console.log(matchingMode + ' FreeCharacter saved');
  }else{
    return res;
  }
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
    const saved = await TopRank.upsert({
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
    const saved = await GameData.upsert({
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
    const saved = await GameData.upsert({
      metaType: 'l10n-' + language,
      data: res.data
    });
    if(saved) console.log(language + ' l10n saved or updated');
  }else{
    return res;
  }
}

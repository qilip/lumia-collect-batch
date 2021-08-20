import * as er from './er.js';
import User from '../models/user.js';
import Game from '../models/game.js';
import Route from '../models/route.js';
import FreeCharacter from '../models/freeCharacter.js';
import GameData from '../models/gameData.js';

async function getCurrentSeason(){
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
    if(existNickname){
      if(existNickname.userNum !== userNum){
        User.update(existNickname, { nickname: '##UNKNOWN##'});
      }
      return;
    }
    const existUserNum = await User.findByUserNum(userNum);
    if(existUserNum){
      User.update(existUserNum, { nickname: nickname });
      return;
    }
    const saved = await User.create({ nickname, userNum });
    if(saved) console.log(nickname + ' UserNum saved');
  }else{
    return res;
  }
}

export async function getUserRank(userNum, seasonId){
  if(seasonId === undefined || seasonId === null)
    seasonId = await getCurrentSeason();
  let user = await User.findByUserNum(userNum);
  if(!user){
    user = await User.create({ nickname:'##UNKNOWN##', userNum });
  }
  let res;
  try{
    res = await er.getUserRank(userNum, seasonId);
  }catch(e){
    return res;
  }
  if(res.statusCode === 200){
    let userRank = {
      seasonId: seasonId.toString(),
      rank: {}
    };
    if(res.data.solo) userRank.rank.solo = res.data.solo;
    if(res.data.duo) userRank.rank.duo = res.data.duo;
    if(res.data.squad) userRank.rank.squad = res.data.squad;
    const saved = await User.update(user, {
      userRank
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userRank saved');
  }else{
    return res;
  }
}

export async function getUserStats(userNum, seasonId){
  if(seasonId === undefined || seasonId === null)
    seasonId = await getCurrentSeason();
  let user = await User.findByUserNum(userNum);
  if(!user){
    user = await User.create({ nickname:'##UNKNOWN##', userNum });
  }
  let res;
  try{
    res = await er.getUserStats(userNum, seasonId);
  }catch(e){
    return res;
  }
  if(res.erCode === 200){
    let userStats = {
      seasonId: seasonId.toString(),
      userStats: []
    };
    if(res.data.userStats) userStats.userStats = res.data.userStats;
    const saved = await User.update(user, {
      userStats
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userStats saved');
  }else{
    return res;
  }
}

export async function getUserSeason(userNum, seasonId){
  if(seasonId === undefined || seasonId === null)
    seasonId = await getCurrentSeason();
  let user = await User.findByUserNum(userNum);
  if(!user){
    user = await User.create({ nickname:'##UNKNOWN##', userNum });
  }
  let res;
  try{
    res = await er.getUserSeason(userNum, seasonId);
  }catch(e){
    console.error(e);
  }
  if(res.statusCode === 200){
    let userRank = {
      seasonId: seasonId.toString(),
      rank: {}
    };
    if(res.data.solo) userRank.rank.solo = res.data.solo;
    if(res.data.duo) userRank.rank.duo = res.data.duo;
    if(res.data.squad) userRank.rank.squad = res.data.squad;
    
    let userStats = {
      seasonId: seasonId.toString(),
      userStats: []
    };
    if(res.data.userStats) userStats.userStats = res.data.userStats;
    const saved = await User.update(user, {
      userRank,
      userStats
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userSeason saved');
  }else{
    return res;
  }
}

export async function getUserGames(userNum, start){
  let user = await User.findByUserNum(userNum);
  if(!user){
    user = await User.create({ nickname:'##UNKNOWN##', userNum });
  }
  let res;
  try{
    res = await er.getUserGames(userNum, start);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const recentGames = res.data.games;
    const gameCount = recentGames.length-1;
    if(gameCount && start) user.collectedGameId.set(start.toString(), 'y');
    const collectedGameId = recentGames.map((game, idx) => {
      return {
        gameId: game.gameId.toString(),
        hasNext: gameCount === idx ? 'n' : 'y'
      };
    });
    if(res.data.last === true) collectedGameId[gameCount].hasNext = 'f';
    const saved = await User.update(user, {
      recentGames,
      collectedGameId
    });
    if(saved) console.log(userNum + ' userGames saved');
  }else{
    return res;
  }
}

export async function getUserRecentGames(userNum, start, limit){
  let user = await User.findByUserNum(userNum);
  if(!user){
    user = await User.create({ nickname:'##UNKNOWN##', userNum });
  }
  let res;
  try{
    res = await er.getUserRecentGames(userNum, start, limit);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const recentGames = res.data.games;
    const gameCount = recentGames.length-1;
    if(gameCount) user.collectedGameId.set(start.toString(), 'y');
    const collectedGameId = recentGames.map((game, idx) => {
      return {
        gameId: game.gameId.toString(),
        hasNext: gameCount === idx ? 'n' : 'y'
      };
    });
    if(res.data.last === true) collectedGameId[gameCount].hasNext = 'f';
    const saved = await User.update(user, {
      recentGames,
      collectedGameId
    });
    if(saved) console.log(userNum + ' userRecentGames saved');
  }else{
    return res;
  }
}

export async function getGame(gameId){
  let res;
  try{
    res = await er.getGame(gameId);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const saved = await Game.create(res.data);
    if(saved) console.log(gameId + ' gamedata saved or updated');
  }else{
    return res;
  }
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

export async function getUserAllGame(userNum){
  // 수집된 게임까지, n 있으면 그 뒤도 채워서 전체수집
}

export async function getTopRank(seasonId, matchingTeamMode){
  // 랭킹
}

export async function getRecommendRoute(){
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

import * as er from './er.js';
import User from '../models/user.js';
import Game from '../models/game.js';
import Route from '../models/route.js';
import FreeCharacter from '../models/freeCharacter.js';

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
    const saved = await User.update(user, {
      userRankStat: {
        updatedAt: Date.now(),
        seasonId: res.data.seasonId,
        solo: res.data.solo,
        duo: res.data.duo,
        squad: res.data.squad
      }
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userRank saved');
  }else{
    return res;
  }
}

export async function getUserStats(userNum, seasonId){
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
    const saved = await User.update(user, {
      userRankStat: {
        updatedAt: Date.now(),
        seasonId: res.data.seasonId,
        userStats: res.data.userStats
      }
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userStats saved');
  }else{
    return res;
  }
}

export async function getUserSeason(userNum, seasonId){
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
    const saved = await User.update(user, {
      userRankStat: {
        updatedAt: Date.now(),
        seasonId: res.data.seasonId,
        solo: res.data.solo,
        duo: res.data.duo,
        squad: res.data.squad,
        userStats: res.data.userStats
      }
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

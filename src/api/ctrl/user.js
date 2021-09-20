import * as er from '../er.js';
import User from '../../models/user.js';

import { getCurrentSeason, getGamePreview, addGameQueue } from './util.js';
import saveUser from './saveUser.js';

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
        saveUser({
          userNum: existNickname.userNum,
          nickname: '##UNKNOWN##',
        });
      }
      return;
    }

    const saved = await saveUser({ nickname, userNum });
    if(saved) console.log(nickname + ' UserNum saved');
  }else{
    return res;
  }
}

export async function getUserRank(userNum, seasonId){
  seasonId = seasonId ?? await getCurrentSeason();
  let res;
  try{
    res = await er.getUserRank(userNum, seasonId);
  }catch(e){
    return res;
  }
  if(res.statusCode === 200){
    const userRank = {
      seasonId: seasonId.toString(),
      rank: [],
    };
    if(res.data.userRank) userRank.rank = res.data.userRank;
    //TODO: 불필요한 정보 삭제
    const saved = await saveUser({
      userNum,
      userRank,
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userRank saved');
  }else{
    return res;
  }
}

export async function getUserStats(userNum, seasonId){
  seasonId = seasonId ?? await getCurrentSeason();
  let res;
  try{
    res = await er.getUserStats(userNum, seasonId);
  }catch(e){
    return res;
  }
  if(res.erCode === 200){
    const userStats = {
      seasonId: seasonId.toString(),
      stats: [],
    };
    // TODO: 불필요한 정보 삭제
    if(res.data.userStats) userStats.stats = res.data.userStats;
    const saved = await saveUser({
      userNum,
      userStats,
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userStats saved');
  }else{
    return res;
  }
}

export async function getUserSeason(userNum, seasonId){
  seasonId = seasonId ?? await getCurrentSeason();
  let res;
  try{
    res = await er.getUserSeason(userNum, seasonId);
  }catch(e){
    console.error(e);
  }
  if(res.statusCode === 200){
    const userRank = {
      seasonId: seasonId.toString(),
      rank: [],
    };
    const userStats = {
      seasonId: seasonId.toString(),
      stats: [],
    };
    if(res.data.userRank) userRank.rank = res.data.userRank;
    if(res.data.userStats) userStats.stats = res.data.userStats;
    const saved = await saveUser({
      userNum,
      userRank,
      userStats,
    });
    if(saved) console.log(userNum + ' season: ' + seasonId + ' userSeason saved');
  }else{
    return res;
  }
}

export async function getUserGames(userNum, start){
  let res;
  try{
    res = await er.getUserGames(userNum, start);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const recentGames = res.data.games;
    const userGames = recentGames.map(game => {
      return getGamePreview(game);
    });
    const gameIds = recentGames.map(game => {
      return { gameId: game.gameId };
    });
    addGameQueue(gameIds);
    const saved = await saveUser({
      userNum,
      userGames,
      start,
      isLast: res.data.isLast,
    });
    if(saved) console.log(userNum + ' userGames saved');
  }else{
    return res;
  }
}

export async function getUserRecentGames(userNum, start, limit){
  let res;
  try{
    res = await er.getUserRecentGames(userNum, start, limit);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const recentGames = res.data.games;
    const userGames = recentGames.map(game => {
      return getGamePreview(game);
    });
    const gameIds = recentGames.map(game => {
      return { gameId: game.gameId };
    });
    addGameQueue(gameIds);
    const saved = await saveUser({
      userNum,
      userGames,
      start,
      isLast: res.data.isLast,
    });
    if(saved) console.log(userNum + ' userRecentGames saved');
  }else{
    return res;
  }
}

export async function getUserGamesInRange(userNum, start, end){
  // start 부터 end 까지 수집
  let res;
  try{
    res = await er.getUserGamesInRange(userNum, start, end);
  }catch(e){
    console.error(e);
  }
  if(res.erCode === 200){
    const recentGames = res.data.games;
    const userGames = recentGames.map(game => {
      return getGamePreview(game);
    });
    const gameIds = recentGames.map(game => {
      return { gameId: game.gameId };
    });
    addGameQueue(gameIds);
    const saved = await saveUser({
      userNum,
      userGames,
      start,
      isLast: res.data.isLast,
    });
    if(saved) console.log(userNum + ' userGamesInRange saved');
  }else{
    return res;
  }
}

export async function getUserUpdate(userNum){
  // userSeason 현재시즌, userStat 일겜, 최근경기
  const seasonId = await getCurrentSeason();
  try{
    getUserSeason(userNum, seasonId);
    getUserStats(userNum, 0);
    getUserGames(userNum);
  }catch(e){
    console.error(e);
  }
}

export async function getUserFullUpdate(userNum){
  // userSeason 현재시즌, userStat 일겜, 최근모든경기
  const seasonId = getCurrentSeason();
  try{
    const user = await User.findById(userNum, 'userGames').lean().exec();
    let end = 1;
    if(user?.userGames[0]) end = user.userGames[0]?.gameId;

    getUserSeason(userNum, await seasonId);
    getUserStats(userNum, 0);
    getUserGamesInRange(userNum, null, end);
  }catch(e){
    console.error(e);
  }
}

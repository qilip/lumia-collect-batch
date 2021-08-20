import axios from 'axios';

const er = axios.create({
  baseURL: 'https://open-api.bser.io/v1',
  timeout: 4000,
  headers: {
    'accept': 'application/json',
    'x-api-key': process.env.ER_KEY
  }
});

er.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);

er.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date();
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime;
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date();
    error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
    return Promise.reject(error);
  }
);


export async function getUserNum(nickname){
  if(!nickname) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/user/nickname', { params: { query: nickname } });
    console.log('getUserNum Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'user': res.data.user }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getUserRank(userNum, seasonId){
  if(!userNum || seasonId === undefined || seasonId === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await Promise.allSettled([
      er.get(`/rank/${userNum}/${seasonId}/1`),
      er.get(`/rank/${userNum}/${seasonId}/2`),
      er.get(`/rank/${userNum}/${seasonId}/3`)
    ]);
    const data = res.map(
      (res, idx) => {
        if(res.status === 'fulfilled'){
          console.log('getUserRank[' + idx + '] Response Time:' + res.value.duration);
          return res.value.data.userRank || null;
        }else{
          console.log('getUserRank[' + idx + '] Fail Response Time:' + res.reason.duration);
          console.log(res.reason.data.message);
          return null;
        }
      }
    );
    return {
      'statusCode': 200,
      'message': 'Success',
      'data': {
        seasonId,
        'solo': data[0],
        'duo': data[1],
        'squad': data[2]
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getUserStats(userNum, seasonId){
  if(!userNum || seasonId === undefined || seasonId === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get(`user/stats/${userNum}/${seasonId}`);
    console.log('getUserStats Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'userStats': res.data.userStats }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getUserGames(userNum, start){
  if(!userNum) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    let res;
    if(start){
      res = await er.get('/user/games/' + userNum, { params: { next: start } });
    }else{
      res = await er.get('/user/games/' + userNum);
    }
    console.log('getUserGames Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': {
        'games': res.data.userGames,
        'last': res.data.next > 0 ? false : true
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getGame(gameId){
  if(!gameId) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/games/' + gameId);
    // console.log('getGame Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 
        'gameId': gameId,
        'games': res.data.userGames
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getRoute(routeId){
  if(!routeId) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/weaponRoutes/recommend/' + routeId);
    console.log('getRoute Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,      
      'data': {
        'routeId': routeId,
        'route': res.data.result
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getFreeCharacters(matchingMode){
  if(!matchingMode) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/freeCharacters/' + matchingMode);
    console.log('getFreeCharacters Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'freeCharacters': res.data.freeCharacters }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect Server error'
    };
  }
}


export async function getUserRecentGames(userNum, start, limit){
  if(!userNum || !limit) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    let games = [];
    let next = start;
    let i = 0;
    let res;
    while(games.length < limit && next !== -1 && i < limit){
      if(next){
        res = await er.get('/user/games/' + userNum, { params: { next } });
      }else{
        res = await er.get('/user/games/' + userNum);
      }
      console.log('getUserGames[' + (i/10) + '] Response Time: ' + res.duration);
      if(res.data.code !== 200) return { 'erCode': res.data.code, 'message': res.data.message };
      games.push(...res.data.userGames);
      next = res.data.next || -1;
      i += 10;
    }
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': {
        'games': games,
        'last': res.data.next > 0 ? false : true
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }  
}

export async function getUserSeason(userNum, seasonId){
  if(!userNum || seasonId === undefined || seasonId === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await Promise.allSettled([
      er.get(`/rank/${userNum}/${seasonId}/1`),
      er.get(`/rank/${userNum}/${seasonId}/2`),
      er.get(`/rank/${userNum}/${seasonId}/3`),
	    er.get(`user/stats/${userNum}/${seasonId}`)
    ]);
    const data = res.map(
      (res, idx) => {
        if(res.status === 'fulfilled'){
          console.log('getUserSeason[' + idx + '] Response Time:' + res.value.duration);
          return res.value.data.userRank || null;
        }else{
          console.log('getUserSeason[' + idx + '] Fail Response Time:' + res.reason.duration);
          console.log(res.reason.data.message);
          return null;
        }
      }
    );
    return {
      'statusCode': 200,
      'message': 'Success',
      'data': {
        seasonId,
        'solo': data[0],
        'duo': data[1],
        'squad': data[2],
        'userStats': data[3]
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getGameData(metaType){
  if(!metaType)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/data/' + metaType);
    console.log('getGameData Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,      
      'data': {
        'data': res.data.data
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

export async function getTopRank(seasonId, matchingTeamMode){
  // 랭킹
}

export async function getRecommendRoute(){
  // 추천 루트목록
}

export async function getL10nData(language){
  // TODO: 버전 추출?
  if(!language)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/l10n/' + language);
    console.log('getL10nData Response Time: ' + res.duration);
    let l10nData = null;
    if(res.data.code === 200){
      l10nData = await axios.get(
        res.data.data.l10Path,
        { timeout: 4000 }
      );
    }
    return {
      'erCode': l10nData.status || res.data.code,
      'message': l10nData.statusText || res.data.message,
      'data': {
        'data': l10nData.data
      }
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

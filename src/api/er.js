import axios from 'axios';
import er from './er/createAxios.js';

export * from './er/getGame.js';
export * from './er/userGame.js';

export async function getUserNum(nickname){
  if(!nickname) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/user/nickname', { params: { query: nickname } });
    // console.log('getUserNum Response Time: ' + res.duration);
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
          // console.log('getUserRank[' + idx + '] Response Time:' + res.value.duration);
          return res.value.data.userRank || null;
        }else{
          // console.log('getUserRank[' + idx + '] Fail Response Time:' + res.reason.duration);
          console.log(res.reason.data.message);
          return null;
        }
      }
    );
    const userRank = [...data];
    return {
      'statusCode': 200,
      'message': 'Success',
      'data': {
        seasonId,
        userRank,
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
    // console.log('getUserStats Response Time: ' + res.duration);
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

export async function getRoute(routeId){
  if(!routeId) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/weaponRoutes/recommend/' + routeId);
    // console.log('getRoute Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': { 'route': res.data.result }
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
    // console.log('getFreeCharacters Response Time: ' + res.duration);
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
          // console.log('getUserSeason[' + idx + '] Response Time:' + res.value.duration);
          return res.value.data.userRank || null;
        }else{
          // console.log('getUserSeason[' + idx + '] Fail Response Time:' + res.reason.duration);
          console.log(res.reason.data.message);
          return null;
        }
      }
    );
    const userRank = [data[0], data[1], data[2]];
    return {
      'statusCode': 200,
      'message': 'Success',
      'data': {
        seasonId,
        userRank,
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
    // console.log('getGameData Response Time: ' + res.duration);
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

export async function getTopRanks(seasonId, matchingTeamMode){
  // 랭킹
  if(!matchingTeamMode || seasonId === undefined || seasonId === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get(`/rank/top/${seasonId}/${matchingTeamMode}`);
    // console.log('getTopRank Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': {
        'topRanks': res.data.topRanks
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

export async function getRecommendRoute(start){
  // 추천 루트목록
  try{
    let res;
    if(!start) res = await er.get('/weaponRoutes/recommend');
    else res = await er.get('/', { params: { next: start }});
    // console.log('getRecommendRoute Response Time: ' + res.duration);
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': {
        'result': res.data.result,
        'next': res.data.next
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

export async function getL10nData(language){
  // TODO: 파일명의 버전정보 저장하기?
  if(!language)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/l10n/' + language);
    // console.log('getL10nData Response Time: ' + res.duration);
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

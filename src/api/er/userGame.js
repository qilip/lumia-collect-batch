import er from './createAxios.js';

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
        'isLast': res.data.next > 0 ? false : true
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
        'isLast': res.data.next > 0 ? false : true
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

export async function getUserGamesInRange(userNum, start, end){
  if(!userNum || end === undefined || end === null)
    return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    let games = [];
    let next = start;
    let res;
    let loop = 0;
    while(next === null || (next > end && next !== -1)){
      if(next){
        res = await er.get('/user/games/' + userNum, { params: { next } });
      }else{
        res = await er.get('/user/games/' + userNum);
      }
      console.log('getGamesInRange[' + loop + '] Response Time: ' + res.duration);
      if(res.data.code !== 200) return { 'erCode': res.data.code, 'message': res.data.message };
      games.push(...res.data.userGames);
      next = res.data.next || -1;
      loop++;
    }
    return {
      'erCode': res.data.code,
      'message': res.data.message,
      'data': {
        'games': games,
        'isLast': res.data.next > 0 ? false : true
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

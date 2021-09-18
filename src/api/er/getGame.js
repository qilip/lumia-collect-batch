import er from './createAxios.js';

export async function getGame(gameId){
  if(!gameId) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/games/' + gameId);
    // console.log('getGame Response Time: ' + res.duration);
    if(res.data.code != 200) return { erCode: res.data.code, message: res.data.message };

    return {
      erCode: res.data.code,
      message: res.data.message,
      data: res.data.userGames,
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

import er from './createAxios.js';

export async function getGame(gameId){
  if(!gameId) return { 'statusCode': 400, 'message': 'parameter empty' };
  try{
    const res = await er.get('/games/' + gameId);
    // console.log('getGame Response Time: ' + res.duration);
    if(res.data.code != 200) return { erCode: res.data.code, message: res.data.message };

    const userGames = res.data.userGames;
    const curGame = {
      gameId: userGames[0].gameId,
      seasonId: userGames[0].seasonId,
      matchingMode: userGames[0].matchingMode,
      matchingTeamMode: userGames[0].matchingTeamMode,
      versionMajor: userGames[0].versionMajor,
      versionMinor: userGames[0].versionMinor,
      serverName: userGames[0].serverName,
      startDtm: userGames[0].startDtm,
      botAdded: userGames[0].botAdded,
      mmrAvg: userGames[0].mmrAvg,
      games: userGames,
    };
    curGame.games.map(userGame => {
      delete userGame.gameId;
      delete userGame.seasonId;
      delete userGame.matchingMode;
      delete userGame.matchingTeamMode;
      delete userGame.versionMajor;
      delete userGame.versionMinor;
      delete userGame.serverName;
      delete userGame.startDtm;
      delete userGame.botAdded;
      delete userGame.mmrAvg;
    });

    return {
      erCode: res.data.code,
      message: res.data.message,
      data: curGame,
    };
  }catch(e){
    console.error(e);
    return {
      'statusCode': 500,
      'message': 'Lumia Collect server error'
    };
  }
}

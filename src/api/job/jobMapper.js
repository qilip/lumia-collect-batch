import * as ctrl from '../ctrl.js';

const jobMapper = {
  getUserNum: p => ctrl.getUserNum(p.nickname),
  getUserRank: p => ctrl.getUserRank(p.userNum, p.seasonId),
  getUserStats: p => ctrl.getUserStats(p.userNum, p.seasonId),
  getUserSeason: p => ctrl.getUserSeason(p.userNum, p.seasonId),
  getUserGames: p => ctrl.getUserGames(p.userNum, p.start),
  getUserRecentGames: p => ctrl.getUserRecentGames(p.userNum, p.start, p.limit),
  getGame: p => ctrl.getGame(p.gameId),
  getRoute: p => ctrl.getRoute(p.routeId),
  getFreeCharacters: p => ctrl.getFreeCharacters(p.matchingMode),
  getGameData: p => ctrl.getGameData(p.metaType),
  getUserUpdate: p => ctrl.getUserUpdate(p.userNum),
  getUserGamesInRange: p => ctrl.getUserGamesInRange(p.userNum, p.start, p.end),
  getTopRanks: p => ctrl.getTopRanks(p.seasonId, p.matchingTeamMode),
  getRecommendRoute: p => ctrl.getRecommendRoute(p.start),
  getL10nData: p => ctrl.getL10nData(p.language),
  getUserFullUpdate: p => ctrl.getUserFullUpdate(p.userNum),
};

const jobWeight = {
  getUserNum: p => 1,
  getUserRank: p => 3,
  getUserStats: p => 1,
  getUserSeason: p => 4,
  getUserGames: p => 1,
  getUserRecentGames: p => 1, // 어차피 한번에 하나 가져오니..
  getGame: p => 1,
  getRoute: p => 1,
  getFreeCharacters: p => 1,
  getGameData: p => 1,
  getUserUpdate: p => 6,
  getUserGamesInRange: p => 1,
  getTopRanks: p => 1,
  getRecommendRoute: p => 1,
  getL10nData: p => 1,
  getUserFullUpdate: p => 6,
};

export { jobMapper, jobWeight };

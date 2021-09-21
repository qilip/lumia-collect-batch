import Bottleneck from 'bottleneck';
import cuid from 'cuid';
import User from '../../models/user.js';
import UserGame from '../../models/userGame.js';

/**
 * * User 데이터 DB 저장 처리
 * @data userNum이 포함된 추가할 데이터
 * - userNum
 * - nickname
 * - userRank
 * - userStats
 * - userGames
 */

const userLimiter = new Bottleneck.Group({
  reservoir: 100,
  reservoirIncreaseAmount: 50,
  reservoirIncreaseInterval: 1000,
  reservoirIncreaseMaximum: 100,
  maxConcurrent: 1,
  minTime: 10,
});

export default async function saveUser(data){
  const userNum = data.userNum;
  const option = {
    priority: 3,
    weight: 1,
    expiration: 6000000, // 10min
    id: 'saveUser-' + userNum + '-' + cuid(),
  }
  const existNickname = await User.findByNickname(data.nickname);
  if(existNickname && existNickname.userNum !== data.userNum){
    const res = await userLimiter.key(userNum.toString()).schedule(option, async () => {
        const re = User.upsert({
          userNum: existNickname.userNum,
          nickname: '##UNKNOWN##',
        });
      return await re;
    });
  };

  const res = await userLimiter.key(userNum.toString()).schedule(option, async () => {
    const re = Promise.all([
      User.upsert(data),
      UserGame.upsert(data),
    ]);
    return await re;
  });
  if(res.state === 'rejected') throw res;
}

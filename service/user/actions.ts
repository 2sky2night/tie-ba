import type { UserInfo } from './types';
import ArticleModel from '../../model/article';
import UserModel from '../../model/user';
import BarModel from '../../model/bar';

const article = new ArticleModel()
const user = new UserModel()
const bar = new BarModel()

/**
 * 通过遍历用户id列表,查询:
 * 1.对应的用户信息
 * 2.当前用户对其关注状态
 * 3.该用户的粉丝关注数量
 * 4.查询用户帖子数量
 * 5.查询用户关注吧的数量、创建吧的数量
 * @param userIdList 用户id列表
 * @param currentUid 当前登录的用户id
 * @returns 
 */
export async function getUserListById (userIdList: number[], currentUid: number | undefined) {
  try {
    const userList: UserInfo[] = []
    for (let i = 0; i < userIdList.length; i++) {
      // 1.查询用户数据
      const [ userInfo ] = await user.selectByUid(userIdList[ i ])
      // 2.查询当前用户对此用户的状态
      const isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, userIdList[ i ])).length ? true : false;
      const isFollowedMe = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(userIdList[ i ], currentUid)).length ? true : false;
      // 3.查询粉丝、关注数量
      const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(userIdList[ i ])
      const [ followUserCount ] = await user.selectByUidScopedFollowCount(userIdList[ i ])
      // 4.查询关注吧的数量
      const [ followBarCount ] = await bar.selectFollowByUidCount(userIdList[ i ])
      // 5.查询帖子数量
      const [ articleCount ] = await article.countInArticleTableByUid(userIdList[ i ])
      // 6.查询创建吧的数量
      const [barCount] = await bar.countInBarTableByUid(userIdList[ i ])
      userList.push({
        ...userInfo,
        is_followed: isFollowedUser,
        is_fans: isFollowedMe,
        fans_count: fansCount.total,
        follow_user_count: followUserCount.total,
        follow_bar_count: followBarCount.total,
        create_bar_count: barCount.total,
        article_count:articleCount.total
      })
    }
    return Promise.resolve(userList)
  } catch (error) {
    return Promise.reject(error)
  }
}
import type { UserInfo } from './types';
import ArticleModel from '../../model/article';
import UserModel from '../../model/user';
import BarModel from '../../model/bar';
import { UserWithout } from '../../model/user/types';

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
      const [ barCount ] = await bar.countInBarTableByUid(userIdList[ i ])
      userList.push({
        ...userInfo,
        is_followed: isFollowedUser,
        is_fans: isFollowedMe,
        fans_count: fansCount.total,
        follow_user_count: followUserCount.total,
        follow_bar_count: followBarCount.total,
        create_bar_count: barCount.total,
        article_count: articleCount.total
      })
    }
    return Promise.resolve(userList)
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * 通过遍历用户信息，查询：
 * 1.当前用户对其关注状态
 * 2.该用户的粉丝、关注数量
 * 3.该用户关注吧、创建吧的数量
 * 4.该创建帖子的数量
 * @param userList 
 * @param currentUid 
 * @returns 
 */
export async function getUserList (userList: UserWithout[], currentUid: number | undefined) {
  try {
    const list: UserInfo[] = []
    for (let i = 0; i < userList.length; i++) {
      // 1.查询当前用户对该用户的关注状态
      const isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, userList[ i ].uid)).length ? true : false
      const isFollowedMe = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(userList[ i ].uid, currentUid)).length ? true : false
      // 2.该用户的粉丝数量、关注数量
      const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(userList[ i ].uid)
      const [ followUserCount ] = await user.selectByUidScopedFollowCount(userList[ i ].uid)
      // 3.获取该用户关注吧、创建吧的数量
      const [ followBarCount ] = await bar.selectFollowByUidCount(userList[ i ].uid)
      const [ barCount ] = await bar.countInBarTableByUid(userList[ i ].uid)
      // 4.查询该用户创建帖子的数量
      const [ articleCount ] = await article.countInArticleTableByUid(userList[ i ].uid)
      list.push({
        ...userList[ i ],
        is_followed: isFollowedUser,
        is_fans: isFollowedMe,
        fans_count: fansCount.total,
        follow_user_count: followUserCount.total,
        follow_bar_count: followBarCount.total,
        create_bar_count: barCount.total,
        article_count: articleCount.total
      })
    }
    return Promise.resolve(list)
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * 获取用户收到的赞数 评论总数和文章总数 (需要先查询当前用户是否存在才能调用该方法) 
 * @param uid 用户id
 */
export async function getUserLikeCount(uid: number) {
  try {
    const articleList = await article.selectInArticleTableByUid(uid)
    const commentList = await article.selectInCommentTableByUid(uid)
    let likeCount = 0
    for (let i = 0; i < articleList.length; i++){
      const [count] = await article.countInLikeArticleTableByAid(articleList[i].aid)
      likeCount+=count.total
    }
    for (let i = 0; i < commentList.length; i++){
      const [count] = await article.countInLikeCommentTabeByCid(commentList[i].cid)
      likeCount += count.total
    }
    return Promise.resolve(likeCount)
  } catch (error) {
    return Promise.reject(error)
  }
}
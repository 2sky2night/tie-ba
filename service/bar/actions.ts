// models
import ArticleModel from "../../model/article"
import UserModel from "../../model/user"
import BarModel from "../../model/bar"
// types
import type { BarInfo } from './types'
import type { Bar } from '../../model/bar/types'

const article = new ArticleModel()
const user = new UserModel()
const bar = new BarModel()

/**
 * 通过吧的id列表 查询吧信息：
 * 1.查询吧的详情信息
 * 2.吧被关注的数量、帖子数量
 * 3.吧主的信息
 * 4.当前用户对吧的关注状态 以及吧主的关注状态
 * @param barIdList 吧的id列表
 * @param currentUid 当前登录的用户id
 */
export async function getBarListWithId (barIdList: number[], currentUid: number | undefined) {
  const list: BarInfo[] = []
  try {
    for (let i = 0; i < barIdList.length; i++) {
      const bid = barIdList[ i ]
      // 1.查询吧的详情信息
      const [ barInfo ] = await bar.selectByBid(bid)
      // 2.查询吧被关注的数量
      const [ followedCount ] = await bar.selectFollowByBidCount(bid)
      // 3.查询该吧的发帖数量
      const [ articleCount ] = await article.countInArticleTableByBid(bid)
      // 4.查询吧主的信息
      // 若当前吧主信息已经查询过了 则直接服用数据
      const userExist = list.find(ele => ele.uid === barInfo.uid)
      const userInfo = userExist ?  {uid:userExist.uid,username:userExist.user.username,createTime:userExist.user.createTime,avatar:userExist.user.avatar} : (await user.selectByUid(barInfo.uid))[ 0 ]
      let isFollowedUser = false
      let isFollowedMe = false
      // 5.查询当前用户对吧主的关注状态

      if (userExist) {
        // 若记录过 则直接复用数据
        isFollowedUser = userExist.user.is_followed
        isFollowedMe=userExist.user.is_fans
      } else {
        // 若没有记录过当前吧主 需要查询关注状态        
        isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, userInfo.uid)).length ? true : false
        isFollowedMe = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(userInfo.uid, currentUid)).length ? true : false
      }
      // 6.当前用户对吧的关注状态
      const isFollowedBar = currentUid === undefined ? false : (await bar.selectFollowByUidAndBid(bid, currentUid)).length ? true : false


      list.push({
        ...barInfo,
        article_count: articleCount.total,
        user_follow_count: followedCount.total,
        is_followed: isFollowedBar,
        user: {
          ...userInfo,
          is_followed: isFollowedUser,
          is_fans: isFollowedMe
        }
      })
    }
    return Promise.resolve(list)
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * 通过吧信息列表 查询该吧的其他信息：
 * 1.吧被关注的数量、帖子数量
 * 2.吧主的信息
 * 3.当前用户对吧的关注状态 以及吧主的关注状态
 * @param barList 吧信息列表
 * @param currentUid 当前登录的用户id
 * @returns 
 */
export async function getBarList (barList: Bar[],currentUid:number|undefined) {
  const list: BarInfo[] = []
  try {
    for (let i = 0; i < barList.length; i++) {

      const bid = barList[ i ].bid
      const uid = barList[ i ].uid
      
      // 1.查询吧被关注的数量
      const [ followedCount ] = await bar.selectFollowByBidCount(bid)
      // 2.查询该吧的发帖数量
      const [ articleCount ] = await article.countInArticleTableByBid(bid)
      // 3.查询吧主的信息
      // 若当前吧主信息已经查询过了 则直接复用数据
      const userExist = list.find(ele => ele.uid === uid)
      const userInfo = userExist ?  {uid:userExist.uid,username:userExist.user.username,createTime:userExist.user.createTime,avatar:userExist.user.avatar} : (await user.selectByUid(uid))[ 0 ]
      let isFollowedUser = false
      let isFollowedMe = false
      // 4.查询当前用户对吧主的关注状态

      if (userExist) {
        // 若记录过 则直接复用数据
        isFollowedUser = userExist.user.is_followed
        isFollowedMe=userExist.user.is_fans
      } else {
        // 若没有记录过当前吧主 需要查询关注状态        
        isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, userInfo.uid)).length ? true : false
        isFollowedMe = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(userInfo.uid, currentUid)).length ? true : false
      }
      // 5.当前用户对吧的关注状态
      const isFollowedBar = currentUid === undefined ? false : (await bar.selectFollowByUidAndBid(bid, currentUid)).length ? true : false

      list.push({
        ...barList[i],
        article_count: articleCount.total,
        user_follow_count: followedCount.total,
        is_followed: isFollowedBar,
        user: {
          ...userInfo,
          is_followed: isFollowedUser,
          is_fans: isFollowedMe
        }
      })

    }
    return Promise.resolve(list)
  } catch (error) {
    return Promise.reject(error)
  }
}
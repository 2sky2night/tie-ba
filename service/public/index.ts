import ArticleModel from '../../model/article'
import UserModel from '../../model/user'
import BarModel from '../../model/bar'

const article = new ArticleModel()
const bar = new BarModel()
const user = new UserModel()


class PublicService {
  /**
   * 搜索
   */
  async search () {

  }
  /**
 * 通过username搜索用户关注列表
 * 1.用户是否存在
 * 2.查询模糊匹配后的关注用户总数
 * 3.查询模糊匹配的关注列表
 * 4.查询这些用户的其他信息,以及当前用户对该用户的关注状态
 * @param uid 
 * @param currentUid 
 * @param limit 
 * @param offset 
 */
  async searchUserFollow (uid: number, currentUid: number | undefined, keywords: string, limit: number, offset: number) {
    try {
      // 1.查询用户是否存在
      const resExist = await user.selectByUid(uid)
      // 不存在
      if (!resExist.length) return Promise.resolve(0)
      // 2.存在 获取关注用户总数
      const [ count ] = await user.countSearchUserFollowByUsername(uid, keywords)
      // 3.获取用户列表
      const userList = await user.searchUserFollowByUsername(uid, keywords, limit, offset)
      // 4.遍历用户列表 查询用户信息
      const userInfoList: any[] = []
      for (let i = 0; i < userList.length; i++) {
        // 查询该用户的粉丝总数
        const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(userList[ i ].uid)
        // 查询该用户的关注总数
        const [ followUserCount ] = await user.selectByUidScopedFollowCount(userList[ i ].uid)
        // 查询该用户关注吧的总数
        const [ followBarCount ] = await bar.countInBarTableByUid(userList[ i ].uid)
        // 查询该用户的文章总数
        const [ articleCount ] = await article.countInArticleTableByUid(userList[ i ].uid)
        // 查询创建吧的数量
        const [ barCount ] = await bar.countInBarTableByUid(userList[ i ].uid)
        // 查询当前用户对该用户的关注状态
        const isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, userList[ i ].uid)).length ? true : false
        const isFollowedMe = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(userList[ i ].uid, currentUid)).length ? true : false
        userInfoList.push({
          ...userList[ i ],
          follow_user_count: followUserCount.total,
          follow_bar_count: followBarCount.total,
          fans_count: fansCount.total,
          create_bar_count: barCount.total,
          article_count: articleCount.total,
          is_followed: isFollowedUser,
          is_fans: isFollowedMe
        })
      }
      return Promise.resolve({
        list: userInfoList,
        limit,
        offset,
        total: count.total,
        has_more: count.total > limit + offset
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 通过username搜索用户粉丝列表
   * 1.用户是否存在
   * 2.查询模糊匹配后的粉丝总数
   * 3.查询模糊匹配的关注列表
   * 4.查询这些用户的其他信息 以及当前用户对该用户的关注状态
   * @param uid 
   * @param currentUid 
   * @param keywords 
   * @param limit 
   * @param offset 
   */
  async searchFansList (uid: number, currentUid: number | undefined, keywords: string, limit: number, offset: number) {
    try {
      // 1.用户是否存在
      const resExist = await user.selectByUid(uid)
      // 不存在
      if (!resExist.length) return Promise.resolve(0)
      // 2.存在 查询模糊匹配后的粉丝总数
      const [ count ] = await user.countSearchUserFansByUsername(uid, keywords)
      // 查询模糊匹配后的粉丝列表
      const userList = await user.searchUserFansByUsername(uid, keywords, limit, offset)
      // 4.遍历用户列表 查询用户信息
      const userInfoList: any[] = []
      for (let i = 0; i < userList.length; i++) {
        // 查询该用户的粉丝总数
        const [ fansCount ] = await user.selectByUidFollowedScopedFollowCount(userList[ i ].uid)
        // 查询该用户的关注总数
        const [ followUserCount ] = await user.selectByUidScopedFollowCount(userList[ i ].uid)
        // 查询该用户关注吧的总数
        const [ followBarCount ] = await bar.countInBarTableByUid(userList[ i ].uid)
        // 查询该用户的文章总数
        const [ articleCount ] = await article.countInArticleTableByUid(userList[ i ].uid)
        // 查询创建吧的数量
        const [ barCount ] = await bar.countInBarTableByUid(userList[ i ].uid)
        // 查询当前用户对该用户的关注状态
        const isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, userList[ i ].uid)).length ? true : false
        const isFollowedMe = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(userList[ i ].uid, currentUid)).length ? true : false
        userInfoList.push({
          ...userList[ i ],
          follow_user_count: followUserCount.total,
          follow_bar_count: followBarCount.total,
          fans_count: fansCount.total,
          create_bar_count: barCount.total,
          article_count: articleCount.total,
          is_followed: isFollowedUser,
          is_fans: isFollowedMe
        })
      }
      return Promise.resolve({
        list: userInfoList,
        limit,
        offset,
        total: count.total,
        has_more: count.total > limit + offset
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default PublicService
// models
import ArticleModel from '../../model/article'
import UserModel from '../../model/user'
import BarModel from '../../model/bar'
// 封装的处理函数
import { getUserList } from '../user/actions'
import { getArticleList, getCommentList } from '../article/actions'
import { getBarList } from '../bar/actions'

const article = new ArticleModel()
const bar = new BarModel()
const user = new UserModel()


class PublicService {
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
   * @param uid 用户id
   * @param currentUid 当前登录的用户id
   * @param keywords 搜索关键词
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
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
  /**
   * 搜索用户
   * @param currentUid 当前登录的用户id
   * @param keywords 搜索关键词
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   */
  async searchUser (currentUid: number | undefined, keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      // 获取用户列表
      const userList = await user.searchInUserTableByUsername(keywords, limit, offset, desc)
      // 获取用户总数
      const [ count ] = await user.countSearchInUserTableByUsername(keywords)
      // 遍历用户列表 查询用户其他信息
      const list = await getUserList(userList, currentUid)
      return Promise.resolve({
        list,
        offset,
        limit,
        desc,
        total: count.total,
        has_more: count.total > offset + limit,
        type: 'user'
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 搜索帖子标题
   * @param currentUid  当前登录的用户id
   * @param keywords 搜索关键词
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   */
  async searchArticleTitle (currentUid: number | undefined, keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      // 查询匹配上的总数
      const [ count ] = await article.countSearchInAricleTableByTitle(keywords)
      // 查询某一页匹配上的帖子列表
      const articleList = await article.searchInArticleTableByTitle(keywords, limit, offset, desc)
      // 遍历帖子列表 查询相关信息
      const list = await getArticleList(articleList, currentUid)
      return Promise.resolve({
        list,
        offset,
        limit,
        desc,
        total: count.total,
        has_more: count.total > offset + limit,
        type: 'article_title'
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 搜索帖子内容
   * @param currentUid 当前登录的用户id
   * @param keywords 搜索关键词
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   * @returns 
   */
  async searchArticleContent (currentUid: number | undefined, keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      // 查询匹配到的总数
      const [ count ] = await article.countSearchInAricleTableByContent(keywords)
      // 查询匹配到的帖子列表
      const articleList = await article.searchInArticleTableByContent(keywords, limit, offset, desc)
      // 遍历帖子列表查询相关信息
      const list = await getArticleList(articleList, currentUid)
      return Promise.resolve({
        list,
        offset,
        limit,
        desc,
        total: count.total,
        has_more: count.total > offset + limit,
        type: 'article_content'
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 搜索评论内容
   * @param currentUid 当前登录的用户id
   * @param keywords 搜索关键词
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   */
  async searchCommentContent (currentUid: number | undefined, keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      // 查询总数
      const [ count ] = await article.countSearchInCommentTableByContent(keywords)
      // 查询某一页匹配上的评论列表
      const commentList = await article.searchInCommentTableByContent(keywords, limit, offset, desc)
      // 遍历评论列表 查询评论相关的信息
      const list = await getCommentList(commentList, currentUid)
      return Promise.resolve({
        list,
        limit,
        offset,
        desc,
        total: count.total,
        has_more: count.total > limit + offset,
        type: 'comment'
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 搜索吧
   * @param currentUid  当前登录的用户id
   * @param keywords 搜索关键词
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   */
  async searchBar (currentUid: number | undefined, keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      // 查询匹配的吧总数
      const [ count ] = await bar.countSearchInBarTableByBname(keywords)
      // 查询匹配上的某一页数据
      const barList = await bar.searchInBarTableByBname(keywords, limit, offset, desc)
      // 遍历吧数据 查询其他信息
      const list = await getBarList(barList, currentUid)
      return Promise.resolve({
        list,
        limit,
        offset,
        total: count.total,
        desc,
        has_more: count.total > offset + limit,
        type: 'bar'
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default PublicService
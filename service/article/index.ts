// models
import ArticleModel from '../../model/article';
import BarModel from '../../model/bar'
import UserModel from '../../model/user'
// types
import type { ArticleBaseItem, CommentBaseItem, InserCommentBody, InsertArticleBody } from '../../model/article/types';

// 统一封装的处理函数
import { getArticleList, getArticleListWithId, getCommentList, getCommentListWithOutLikeCount, getCommentReplyInfoList } from './actions'
import { getUserListById } from '../user/actions';

const user = new UserModel()
const article = new ArticleModel()
const bar = new BarModel()

class ArticleService {
  /**
   * 创建帖子
   * @param data 
   * @returns 0所在吧不存在 1发帖成功
   */
  async createArticle (data: InsertArticleBody): Promise<1 | 0> {
    try {
      // 1.需要先查询发帖所在的吧是否存在
      const res = await bar.selectByBid(data.bid)
      if (res.length) {
        // 吧存在 就创建对应的帖子
        await article.insertInArticleTable(data)
        return Promise.resolve(1)
      } else {
        // 吧不存在
        return Promise.resolve(0)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取文章详情数据
   1.通过查询参数aid获取帖子详情数据
    2.通过帖子详情数据的uid查询帖子创建者详情数据，以及当前登录用户对帖子创建者的关注状态
    3.通过帖子详情数据的bid查询帖子所属吧的详情数据
    4.通过aid来查询帖子点赞数量，以及当前登录用户对帖子的点赞状态
    5.通过aid来查询帖子的收藏数量，以及当前登录用户对帖子的收藏状态
    6.通过aid来查询帖子的评论总数(评论总数+回复总数)
   * @param aid 
   * @returns 
   */
  async getArticleInfo (aid: number, uid: number | undefined) {
    try {
      // 1.查询文章是否存在
      const [ articleInfo ] = await article.selectInArticleTableByAid(aid)
      if (articleInfo) {
        // 文章存在

        // 2.查询该文章的创建者 以及当前登录的用户对创建者的关注状态
        const [ resUserCreateArticle ] = await user.selectByUid(articleInfo.uid)
        const userInfo = {
          ...resUserCreateArticle,
          is_followed: uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, resUserCreateArticle.uid)).length > 0,
          is_fans: uid === undefined ? false : (await user.selectByUidAndUidIsFollow(resUserCreateArticle.uid, uid)).length > 0
        }

        // 3.查询该帖子所属的吧详情信息
        const [ resBar ] = await bar.selectByBid(articleInfo.bid)
        const barInfo = resBar

        // 4.查询该帖子的点赞数量 以及当前用户点赞的状态
        const [ resLikeCount ] = await article.countInLikeArticleTableByAid(aid)
        const isLiked = uid === undefined ? false : (await article.selectInLikeArticleTableByAidAndUid(uid, aid)).length > 0

        // 5.查询该帖子的收藏数量 以及当前用户收藏的状态
        const [ resStarCount ] = await article.countInStarArticleTableByAid(aid)
        const isStar = uid === undefined ? false : (await article.selectInStarArticleTableByUidAndAid(uid, aid)).length > 0

        // 6.处理帖子配图问题
        const photo: string[] = []
        if (articleInfo.photo !== null) {
          // 若帖子有配图 则需要转换成数组
          articleInfo.photo.split(',').forEach(ele => photo.push(ele))
        }

        // 7.查询帖子的评论总数
        const [ commentsCount ] = await article.countInCommentTableByAid(aid)
        // 回复算不算评论？？？
        // const [ replyCount ] = await article.getArticleAllReplyCount(aid)

        return Promise.resolve({
          aid: articleInfo.aid,
          title: articleInfo.title,
          content: articleInfo.content,
          bid: articleInfo.bid,
          uid: articleInfo.uid,
          photo: articleInfo.photo === null ? null : photo,
          createTime: articleInfo.createTime,
          like_count: resLikeCount.total,
          is_liked: isLiked,
          star_count: resStarCount.total,
          is_star: isStar,
          comment_count: commentsCount.total,
          user: userInfo,
          bar: barInfo
        })

      } else {
        // 文章不存在
        return Promise.resolve(0)
      }

    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 用户点赞帖子 
   * 1.查询对应文章是否存在
   * 2.若文章存在即查询是否有对应的点赞记录了
   * 3.有就不能点赞 没有则插入记录
   * @param uid 用户id
    * @param aid 帖子id
   * @returns -1：文章不存在 0：已经点赞了 1：点赞成功
   */
  async likeArticle (uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.查询文章是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 文章不存在
        return Promise.resolve(-1)
      }
      // 2.查询用户是否已经点赞了
      const resIsLike = await article.selectInLikeArticleTableByAidAndUid(uid, aid)
      if (resIsLike.length) {
        // 已经点赞了不能重复点赞
        return Promise.resolve(0)
      } else {
        // 未点赞 即可插入记录
        await article.insertInLikeArticleTable(uid, aid)
        return Promise.resolve(1)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 用户取消点赞帖子
   * 1.查询帖子是否存在
   * 2.查询帖子是否被点赞过
   * 3.若被点赞过则删除记录
   * @param uid 用户id
   * @param aid 帖子id
   * @returns -1：文章不存在 0：没有点赞记录 1：取消点赞成功
   */
  async cancelLikeArticle (uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.查询文章是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 文章不存在
        return Promise.resolve(-1)
      }
      // 2.查询用户是否已经点赞了
      const resIsLike = await article.selectInLikeArticleTableByAidAndUid(uid, aid)
      if (resIsLike.length) {
        // 已经点赞了 则删除记录
        await article.deleteInLikeArticleTableByAidAndUid(uid, aid)
        return Promise.resolve(1)
      } else {
        // 未点赞 则不能删除记录
        return Promise.resolve(0)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 收藏帖子
   * 1.通过aid查询帖子是否存在
   * 2.通过aid和uid查询帖子是否已经收藏了
   * 3.通过验证即可插入记录收藏帖子
   * @param uid 用户id
   * @param aid 帖子id
   * @returns -1：帖子不存在 0：重复收藏 1：收藏成功
   */
  async starArticle (uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.通过aid查询帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 收藏的帖子不存在
        return Promise.resolve(-1)
      }
      // 2.通过aid和uid查询是否收藏了帖子
      const resIsStar = await article.selectInStarArticleTableByUidAndAid(uid, aid)
      if (resIsStar.length) {
        // 已经收藏了 则不能重复收藏
        return Promise.resolve(0)
      } else {
        // 未收藏 则插入记录
        await article.insertInStarArticleTable(uid, aid)
        return Promise.resolve(1)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 取消收藏帖子
   * 1.通过aid查询帖子是否存在
   * 2.通过aid和uid查询用户是否收藏过帖子
   * 3.若收藏过则取消收藏
   * @param uid 用户id
   * @param aid 帖子id
   * @returns -1:帖子不存咋 0:未收藏过 1:取消收藏成功
   */
  async cancelStarArticle (uid: number, aid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.通过uid来查询该帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 若帖子不存在 则不能收藏
        return Promise.resolve(-1)
      }
      // 2.通过uid和aid来查询用户是否收藏过帖子
      const resIsStar = await article.selectInStarArticleTableByUidAndAid(uid, aid)
      console.log(resIsStar)
      if (resIsStar.length) {
        // 若存在记录说明用户收藏过帖子 则可以取消收藏
        await article.deleteInStarArticleTableByAidAndUid(aid, uid)
        return Promise.resolve(1)
      } else {
        // 不存在记录 说明用户没有收藏过帖子 不能取消收藏
        return Promise.resolve(0)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 创建评论
   * 1.通过aid查询对应的帖子是否存在
   * 2.在评论表中插入记录
   * @param data 
   * @returns 0:帖子不存在 1:发送评论成功
   */
  async createComment (data: InserCommentBody): Promise<0 | 1> {
    try {
      const resExist = await article.selectInArticleTableByAid(data.aid)
      if (!resExist.length) {
        // 帖子不存在
        return Promise.resolve(0)
      } else {
        // 帖子存在
        await article.insertInCommentTable(data)
        return Promise.resolve(1)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 删除评论
   * 1.通过cid查询帖子是否存在
   * 2.评论创建者可以删除评论,若评论创建者是当前用户则可以删除评论
   * 3.楼主也可以删除评论,若当前用户的id===当前评论所属的帖子的创建者id则可以删除评论
   * @param cid 
   * @param uid 
   * @returns -1:评论不存在 0:不是评论创建者和楼主 1:评论创建者删除评论 2:楼主删除评论
   */
  async deleteComment (cid: number, uid: number): Promise<-1 | 0 | 1 | 2> {
    try {

      // 1.查询评论是否存在
      const [ comment ] = await article.selectInCommentTableByCid(cid)
      if (comment === undefined) {
        // 评论不存在
        return Promise.resolve(-1)
      }

      // 2.检验是否可以删除评论
      if (comment.uid === uid) {
        // 2.1若该评论的创建者是当前登录的用户则可以删除记录
        await article.deleteInCommentTableByCid(cid)
        return Promise.resolve(1)
      } else {
        // 2.2不是评论的创建者 需要检查当前登录的用户是否为帖子的楼主
        const [ articleInfo ] = await article.selectInArticleTableByAid(comment.aid)

        if (articleInfo.uid === uid) {
          //2.2.1 若删除评论的用户为该帖子的创建者则可以删除记录
          await article.deleteInCommentTableByCid(cid)
          return Promise.resolve(2)
        } else {
          // 2.2.2既不是评论创建者也不是楼主则不能删除评论
          return Promise.resolve(0)
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 点赞评论
   * 1.通过cid查询评论是否存在
   * 2.通过cid和uid查询用户是否点赞过评论
   * 3.未点赞则插入记录 点赞过则不能重复点赞
   * @param cid 
   * @param uid 
   * @returns -1:评论不存在 0:已经点赞过了 1:点赞成功
   */
  async likeComment (cid: number, uid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.通过cid来查询评论是否存在
      const [ comment ] = await article.selectInCommentTableByCid(cid)
      if (comment === undefined) {
        // 评论不存在
        return Promise.resolve(-1)
      } else {
        // 评论存在
        // 2.查询用户是否点赞过评论
        const resExist = await article.selectInLikeCommentTableByCidAndUid(cid, uid)
        if (resExist.length) {
          // 点赞过了 不能重复点赞
          return Promise.resolve(0)
        } else {
          // 未点赞 插入记录
          await article.insertInLikeCommentTable(cid, uid)
          return Promise.resolve(1)
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
 * 取消点赞评论
 * 1.通过cid查询评论是否存在
 * 2.通过cid和uid查询用户是否点赞过评论
 * 3.未点赞则不能取消点赞评论 点赞过则删除记录
 * @param cid 
 * @param uid 
 * @returns -1:评论不存在 0:未点赞过评论 1:取消点赞成功
 */
  async cancelLikeComment (cid: number, uid: number): Promise<-1 | 0 | 1> {
    try {
      // 1.通过cid来查询评论是否存在
      const [ comment ] = await article.selectInCommentTableByCid(cid)
      if (comment === undefined) {
        // 评论不存在
        return Promise.resolve(-1)
      } else {
        // 评论存在
        // 2.查询用户是否点赞过评论
        const resExist = await article.selectInLikeCommentTableByCidAndUid(cid, uid)
        if (resExist.length) {
          // 点赞过 则删除点赞记录
          await article.deleteInLikeCommentTableByCidAndUid(cid, uid)
          return Promise.resolve(1)
        } else {
          // 未点赞过 则不能取消点赞
          return Promise.resolve(0)
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 查询某个帖子的评论数据 (分页)
   * 1.查询帖子是否存在
   * 2.查询该帖子的评论总数
   * 3.查询某一页的评论列表
   * 4.遍历评论列表 ,获取评论的创建者信息关注状态以及评论点赞的状态以及评论点赞的总数
   * @param aid 
   * @param uid 
   * @param limit 
   * @param offset 
   */
  async getArticleCommentList (aid: number, uid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.查询帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 不存在
        return Promise.resolve(0)
      }
      // 2.存在则通过aid查询该帖子的评论总数
      const [ count ] = await article.countInCommentTableByAid(aid)
      // 3.查询当前页的评论列表
      const commentList = await article.selectInCommentTableByAidLimit(aid, limit, offset, desc)
      // 4.遍历评论列表,查询相关数据
      const list = await getCommentList(commentList, uid)

      return Promise.resolve({
        list,
        total: count.total,
        offset,
        limit,
        has_more: count.total > offset + limit,
        desc
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取用户点赞的帖子列表
   * 1.查询用户是否存在
   * 2.查询用户点赞的帖子总数
   * 3.获取某一页的点赞帖子列表，
   * 3.5通过点赞帖子列表的aid 来获取对应帖子的详情数据列表
   * 4.查询这些帖子的创建者
   * 5.查询帖子的点赞总数、收藏总数、评论总数
   * 5.5 查询帖子所属的吧
   * 6.当前用户对楼主的关注状态
   * 7.当前用户对帖子的点赞、收藏状态
   * 7.5 当前用户对帖子所属对应吧的关注状态
   * 8.计算是否还有更多 若总数<offset+limit则没有更多了
   * @param uid 用户id
   * @param currentUid 当前登录的用户id 
   * @param limit pageSize
   * @param offset 从第几条开始获取数据
   * @param desc 根据点赞的时间升序还是降序
   * @returns 
   */
  async getUserLikeArticleList (uid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.获取用户信息
      const [ userInfo ] = await user.selectByUid(uid)
      if (!userInfo) {
        // 用户不存在
        return Promise.resolve(0)
      }
      // 2.获取用户点赞帖子的总数
      const [ total ] = await article.countInLikeArticleTableByUid(uid)
      // 3.获取点赞帖子列表
      const likeArticleList = (await article.selectInLikeArticleTableByUidLimit(uid, limit, offset, desc)).map(ele => ele.aid)
      // 3.5 获取帖子信息列表
      const articleList = await getArticleListWithId(likeArticleList, currentUid)

      return Promise.resolve({
        list: articleList,
        total: total.total,
        limit,
        offset,
        has_more: total.total > offset + limit,
        desc
      })

    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取用户收藏列表
   * 1.查询用户是否存在
   * 2.查询用户收藏的总数
   * 3.查询用户收藏帖子的记录
   * 4.根据这些记录查询帖子详情数据：帖子点赞、收藏、评论数量，当前用户对帖子的点赞、收藏状态，以及帖子创建者信息、当前用户对楼主的关注状态、粉丝状态，帖子所属吧的信息，当前用户是否关注吧？
   * 5.计算是否还有更多 total>offset+limit
   * @param uid 用户id
   * @param currentUid 当前登录的用户id 
   * @param limit 需要多少条数据
   * @param offset 从第几条开始获取数据
   * @param desc 是否降序 根据时间降序
   */
  async getUserStarArticleList (uid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.查询用户记录
      const [ userInfor ] = await user.selectByUid(uid)
      // 用户不存在
      if (!userInfor) return Promise.resolve(0)
      // 2.查询用户收藏的帖子总数
      const [ count ] = await article.countInStarArticleTableByUid(uid)
      // 3.查询收藏的帖子记录
      const articleStarList = (await article.selectInStarArticleTableByUidLimit(uid, limit, offset, desc)).map(ele => ele.aid)
      // 4.根据收藏的帖子记录查询帖子详情信息
      const articleInforList = await getArticleListWithId(articleStarList, currentUid)

      return Promise.resolve({
        list: articleInforList,
        offset,
        limit,
        total: count.total,
        has_more: count.total > offset + limit,
        desc
      })


    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取点赞帖子的用户列表
   * 1.查询帖子是否存在
   * 2.查询点赞帖子的总数
   * 3.查询点赞帖子列表
   * 4.遍历列表 查询用户数据
   * @param aid 帖子id 
   * @param currentUid 当前登录的用户 
   * @param limit 多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 降序还是升序
   */
  async getArticleLikedUserList (aid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      // 不存在
      if (!resExist.length) return Promise.resolve(0)
      // 2.存在 查询点赞总数
      const [ likeCount ] = await article.countInLikeArticleTableByAid(aid)
      // 3.查询用户点赞列表
      const likeList = (await article.selectInLikeArticleTableByAidLimit(aid, limit, offset, desc)).map(ele => ele.uid)
      // 4.遍历点赞列表 获取用户信息
      const userList = await getUserListById(likeList, currentUid)

      return Promise.resolve({
        list: userList,
        limit,
        offset,
        total: likeCount.total,
        has_more: likeCount.total > limit + offset,
        desc
      })

    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取收藏帖子的用户列表
   * @param aid 帖子id
   * @param currentUid 当前登录的用户 
   * @param limit 获取多少体数据
   * @param offset  从多少偏移量开始获取数据
   * @param desc 根据收藏时间降序还是升序
   */
  async getStarArticleUserList (aid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      // 不存在
      if (!resExist.length) return Promise.resolve(0)
      // 2.存在 查询收藏总数
      const [ starCount ] = await article.countInStarArticleTableByAid(aid)
      // 3.查询用户收藏列表
      const starList = (await article.selectInStarArticleTableByAidLimit(aid, limit, offset, desc)).map(ele => ele.uid)
      // 4.遍历收藏列表 获取用户信息
      const userList = await getUserListById(starList, currentUid)

      return Promise.resolve({
        list: userList,
        limit,
        offset,
        total: starCount.total,
        has_more: starCount.total > limit + offset,
        desc
      })

    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取用户发送的帖子列表 （分页限制）
   * 1.查询用户是否存在
   * 2.查询用户发帖总数
   * 3.查询对应的帖子列表
   * 4.查询遍历帖子列表 1.获取帖子点赞数量、收藏数量、评论数量 2.当前用户对帖子的点赞、收藏状态
   * 5.查询楼主信息，查询当前用户对楼主的状态
   * 6.查询吧的信息，查询当前用户对吧的状态
   * @param uid 用户id
   * @param currentUid 当前用户的id
   * @param limit 多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据发帖时间降序还是升序
   */
  async getUserArticleList (uid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.查询用户是否存在
      const resExist = await user.selectByUid(uid)
      // 用户不存在
      if (!resExist.length) return Promise.resolve(0)
      // 2.接口存在 获取帖子列表
      const articleList = await article.selectInArticleTableByUidLimit(uid, limit, offset, desc)
      // 3.遍历帖子列表 查询相关帖子信息
      const list = await getArticleList(articleList, currentUid)
      // 4.查询帖子总数
      const [ articleCount ] = await article.countInArticleTableByUid(uid)

      return Promise.resolve({
        list,
        limit,
        offset,
        total: articleCount.total,
        has_more: articleCount.total > offset + limit,
        desc
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 删除帖子
   * 1.查询帖子是否存在
   * 2.查询帖子创建者是否为本人
   * 3.是即可删除帖子
   * @param aid 帖子id
   * @param uid 用户id
   */
  async deleteArticle (aid: number, uid: number) {
    try {
      const [ articleInfo ] = await article.selectInArticleTableByAid(aid)
      if (!articleInfo) {
        // 文章不存在
        return Promise.resolve(-1)
      } else {
        if (articleInfo.uid === uid) {
          // 若帖子作者为当前用户 即可删除
          await article.delectInArticleTableByAid(aid)
          return Promise.resolve(1)
        } else {
          // 不是帖子的作者
          return Promise.resolve(0)
        }
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 浏览帖子列表
   * @param uid 当前登录的用户id
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据帖子创建时间升序还是降序
   * @returns 
   */
  async getArticleList (uid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.获取帖子总数
      const [ count ] = await article.countInArticleTable()
      // 2.获取帖子列表
      const articleList = await article.selectInArticleTableLimit(limit, offset, desc)
      // 3.遍历帖子列表 查询对应帖子信息
      const list = await getArticleList(articleList, uid)
      return Promise.resolve({
        list,
        offset,
        limit,
        desc,
        total: count.total,
        has_more: count.total > limit + offset
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 发现热帖
   * 1.查询x天内评论最多的帖子列表中的某一页
   * 2.查询x天内评论最多的帖子列表总数
   * @param uid 当前登录的用户id
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param day 多少天之前的帖子
   */
  async getHotArticleList (uid: number | undefined, limit: number, offset: number, day: number) {
    try {
      // 查询近x天评论最多的帖子总数
      const [ count ] = await article.countFindHotArticle(day)
      // 查询近x天评论最多的帖子列表
      const articleList = await article.findHotArticle(day, limit, offset)
      const list = await getArticleList(articleList, uid)
      return Promise.resolve({
        list,
        total: count.total,
        limit,
        offset,
        day,
        has_more: count.total > limit + offset
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 发现热评
   * 1.查询热门评论的总数
   * 2.查询热评论列表
   * 3.遍历评论列表 查询该评论的其他信息
   * @param uid 当前登录的用户id
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param day  多少天之前的评论
   */
  async getHotCommentList (uid: number | undefined, limit: number, offset: number, day: number) {
    try {
      const [ count ] = await article.countFindHotComment(day)
      const commentList = await article.findHotComment(day, limit, offset)
      const list = await getCommentList(commentList, uid)
      return Promise.resolve({
        list,
        offset,
        limit,
        total: count.total,
        day,
        has_more: count.total > limit + offset
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 发现帖子 查询当前用户所有关注者的发帖列表(根据发帖时间降序排序)
   * @param uid 当前登录的用户id
   * @param limit 返回多少条数据
   * @param offset 多少偏移量开始获取数据
   * @returns 
   */
  async getDiscoverArticleList (uid: number, limit: number, offset: number) {
    try {
      // 查询所有关注者发帖的总数
      const [ count ] = await article.countDiscoverArticle(uid)
      // 查询这些关注者某一页的帖子 (根据帖子创建者时间降序排列帖子)
      const articleList = await article.discoverAricle(uid, limit, offset, true)
      // 查询这些帖子的其他信息
      const list = await getArticleList(articleList, uid)
      return Promise.resolve({
        list,
        total: count.total,
        offset,
        limit,
        has_more: count.total > limit + offset
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 查询帖子的热门评论
   * @param aid 
   * @param currentUid 
   * @param limit 
   * @param offset 
   * @param desc
   */
  async getArticleHotComment (aid: number, currentUid: number | undefined, limit: number, offset: number, desc: boolean) {
    try {
      // 1.帖子是否存在
      const resExist = await article.selectInArticleTableByAid(aid)
      if (!resExist.length) {
        // 帖子不存在
        return Promise.resolve(0)
      }
      // 2.帖子存在 获取帖子所有的评论
      const _commentList = await article.selectInCommentTableByAid(aid)
      const commentList = _commentList.map(ele => ({ ...ele, like_count: 0, reply_count: 0 }))
      // 3.遍历评论 查询评论所有的点赞数量和回复数量 来进行综合(点赞数量+回复数量)排序
      for (let i = 0; i < commentList.length; i++) {
        const [ likeCount ] = await article.countInLikeCommentTabeByCid(commentList[ i ].cid)
        // 保存该评论的点赞总数
        commentList[ i ].like_count = likeCount.total
        const [ replyCount ] = await article.countInReplyTableByCid(commentList[ i ].cid)
        // 保存该评论的回复数量
        commentList[ i ].reply_count = replyCount.total
      }
      // 4.遍历记录回复总数和点赞总数的评论列表 根据点赞和评论总数进行降序排序
      if (desc) {
        // 降序    
        for (let i = 0; i < commentList.length; i++) {
          for (let j = 0; j < commentList.length - 1; j++) {
            if (commentList[ j ].like_count + commentList[ j ].reply_count < commentList[ j + 1 ].like_count + commentList[ j + 1 ].reply_count) {
              const temp = commentList[ j ]
              commentList[ j ] = commentList[ j + 1 ]
              commentList[ j + 1 ] = temp
            }
          }
        }
      } else {
        // 升序
        for (let i = 0; i < commentList.length; i++) {
          for (let j = 0; j < commentList.length - 1; j++) {
            if (commentList[ j ].like_count + commentList[ j ].reply_count > commentList[ j + 1 ].like_count + commentList[ j + 1 ].reply_count) {
              const temp = commentList[ j ]
              commentList[ j ] = commentList[ j + 1 ]
              commentList[ j + 1 ] = temp
            }
          }
        }
      }
      // 5.根据接口请求的limit和offset进行截取 评论列表
      const _list = commentList.slice(offset, offset + limit)
      // 遍历列表获取评论相关信息
      const list = await getCommentListWithOutLikeCount(_list, currentUid)

      return Promise.resolve({
        list,
        total: commentList.length,
        offset,
        limit,
        has_more: limit + offset < commentList.length
      })

    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 通过aid（帖子id）列表获取帖子列表详情信息
   * @param aidList 
   * @param currentUid 
   */
  async getArticleByAidList (aidList: number[], currentUid: number | undefined) {
    try {
      // 帖子列表
      const _list: (ArticleBaseItem | { aid: number; not_found: true })[] = []
      // 遍历检查每个帖子是否存在
      for (let i = 0; i < aidList.length; i++) {
        const [ item ] = await article.selectInArticleTableByAid(aidList[ i ])
        //不存在 则响应错误信息
        if (item === undefined) {
          _list.push({
            aid: aidList[ i ],
            not_found: true
          })
        } else {
          _list.push(item)
        }
      }
      // 可以找到的数据列表
      const _foundList = _list.filter(ele => Reflect.get(ele, 'not_found') === undefined) as ArticleBaseItem[]
      // 获取这些可以找到的帖子列表的详情数据
      const foundList = await getArticleList(_foundList, currentUid)
      const list: any[] = []
      // 按照原有查询的顺序 将可以找到的数据列表与不能找到的数据列表进行合并
      for (let i = 0; i < _list.length; i++) {
        //@ts-ignore
        if (_list[ i ].not_found === true) {
          // 是不存在的帖子记录
          list.push(_list[ i ])
        } else {
          // 是存在帖子记录的 需要通过在foundList查找对应aid并保存到list
          const item = foundList.find(ele => ele.aid === (_list[ i ].aid))
          if (item) {
            list.push(item)
          } else {
            list.push({
              aid: _list[ i ].aid,
              not_found: true
            })
          }
        }
      }
      return Promise.resolve({
        list,
        total: list.length
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 回复评论
   * @param uid 用户id 
   * @param cid 评论id
   * @param content 回复评论的内容
   */
  async replyComment (uid: number, cid: number, content: string) {
    try {
      // 评论是否存在
      const [ commentItem ] = await article.selectInCommentTableByCid(cid)
      if (!commentItem) {
        // 评论不存在
        return Promise.resolve(0)
      }
      // 评论存在 插入回复记录
      await article.insertInReplyTable(uid, cid, content, 1, cid)
      return Promise.resolve(1)
    } catch (error) {
      return Promise.reject(error)
    }

  }
  /**
   * 对回复进行回复
   * @param uid 用户id
   * @param rid 回复id
   * @param content 回复内容
   * @param cid 评论的id
   * @returns -1回复不存在 0评论中不存在该回复 1回复成功
   */
  async replyReply (uid: number, rid: number, content: string, cid: number) {
    try {
      // 查询回复是否存在
      const [ replyItem ] = await article.selectInReplyTableByRid(rid)
      if (!replyItem) {
        // 回复不存在
        return Promise.resolve(-1)
      }
      // 查询该评论是否有该回复
      const resExist = await article.selectInReplyTableByRidAndCid(rid, cid)
      if (!resExist.length) {
        // 该评论中不存在该回复
        return Promise.resolve(0)
      }
      // 存在 则回复回复成功 插入回复内容
      await article.insertInReplyTable(uid, rid, content, 2, cid)
      return Promise.resolve(1)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 用户点赞回复
   * @param uid 用户id
   * @param rid 回复id
   * @returns -1回复不存在 0已经点过赞了 1点赞成功
   */
  async likeReply (uid: number, rid: number): Promise<-1 | 0 | 1> {
    try {
      // 回复是否存在
      const [ replyItem ] = await article.selectInReplyTableByRid(rid)
      if (!replyItem) {
        // 回复不存在
        return Promise.resolve(-1)
      }
      // 当前用户是否已经点赞过了？
      const [ likeItem ] = await article.selectInLikeReplyTable(uid, rid)
      if (likeItem) {
        // 已经点赞过回复了 不能重复点赞
        return Promise.resolve(0)
      } else {
        // 未点过赞 则可以插入点赞记录        
        await article.insertInLikeReplyTable(uid, rid)
        return Promise.resolve(1)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 取消点赞回复
   * @param uid 用户id
   * @param rid 回复id
   * @returns -1回复不存在 0未点赞过回复 1取消回复成功
   */
  async cancelLikeReply (uid: number, rid: number): Promise<-1 | 0 | 1> {
    try {
      // 回复是否存在
      const [ replyItem ] = await article.selectInReplyTableByRid(rid)
      if (!replyItem) {
        // 不存在
        return Promise.resolve(-1)
      }
      // 是否存在点赞记录
      const [ likeItem ] = await article.selectInLikeReplyTable(uid, rid)
      if (likeItem) {
        // 存在点赞记录 则可以删除
        await article.deleteInLikeReplyTable(uid, rid)
        return Promise.resolve(1)
      } else {
        // 不存在点赞记录 不能删除
        return Promise.resolve(0)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取评论的回复列表 分页展示
   * @param cid 评论id
   * @param uid 当前登录的用户
   * @param limit 条目
   * @param offset 从offset开始获取数据
   */
  async getCommentReplyList (cid: number, uid: undefined | number, limit: number, offset: number) {
    try {
      // 该评论是否存在
      const [ commentItem ] = await article.selectInCommentTableByCid(cid)
      if (!commentItem) {
        // 评论不存在
        return Promise.resolve(0)
      }
      // 评论存在 查询评论相关数据
      const [ userInfo ] = await user.selectByUid(commentItem.uid)
      const [ likeCount ] = await article.countInLikeCommentTabeByCid(cid)
      const isLiked = uid === undefined ? false : (await article.selectInLikeCommentTableByCidAndUid(cid, uid)).length > 0
      // 查询回复列表数据
      const _list = await article.selectInReplyTableByCidLimit(cid, limit, offset)
      // 获取回复列表的详情数据
      const list = await getCommentReplyInfoList(_list, uid)
      // 获取评论的所有回复数量
      const [ count ] = await article.countInReplyTableByCid(cid)

      return Promise.resolve({
        comment: {
          cid: commentItem.cid,
          content: commentItem.content,
          createTime: commentItem.createTime,
          aid: commentItem.aid,
          uid: commentItem.uid,
          photo: commentItem.photo === null ? null : commentItem.photo.split(','),
          like_count: likeCount.total,
          is_liked: isLiked,
          user: userInfo
        },
        list,
        limit,
        offset,
        total: count.total,
        has_more: limit + offset < count.total,
        // desc: true
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default ArticleService
// models
import ArticleModel from '../../model/article';
import BarModel from '../../model/bar'
import UserModel from '../../model/user'
// types
import type { InserCommentBody, InsertArticleBody, CommentItem, ArticleBaseItem } from '../../model/article/types';
import type { UserInfo } from '../../model/user/types';
import { BarInfo } from '../../model/bar/types';

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
    3.通过帖子详情数据的bid查询帖子所属吧的详情数据，以及当前登录用户对吧的关注状态
    4.通过aid来查询帖子点赞数量，以及当前登录用户对帖子的点赞状态
    5.通过aid来查询帖子的收藏数量，以及当前登录用户对帖子的收藏状态
    6.通过aid来查询帖子的评论总数
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
        const userInfo: UserInfo = {
          ...resUserCreateArticle,
          is_followed: uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, resUserCreateArticle.uid)).length > 0
        }

        // 3.查询该帖子所属的吧详情信息 以及当前登录用户对吧的关注状态 以及吧主的详情信息以及吧主的关注状态
        const [ resBar ] = await bar.selectByBid(articleInfo.bid)
        const [ resUserCreateBar ] = await user.selectByUid(resBar.uid)
        const barInfo: BarInfo = {
          ...resBar,
          // 对当前吧的关注状态
          is_followed: uid === undefined ? false : (await bar.selectFollowByUidAndBid(resBar.bid, uid)).length > 0,
          user: {
            ...resUserCreateBar,
            // 对当前吧主的关注状态
            is_followed: uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, resUserCreateBar.uid)).length > 0
          }
        }

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
  async getArticleCommentList (aid: number, uid: number | undefined, limit: number, offset: number) {
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
      const commentList = await article.selectInCommentTableByAidLimit(aid, limit, offset)
      // 4.遍历评论列表,查询相关数据
      const resList: CommentItem[] = []
      for (let i = 0; i < commentList.length; i++) {
        // 4.1 查询用户数据
        const [ userInfo ] = await user.selectByUid(commentList[ i ].uid)
        // 4.2查询当前登录的用户对该评论创建者的关注状态
        const isFollowed = uid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, commentList[ i ].uid)).length ? true : false
        // 4.3查询当前登录的用户对该评论的点赞状态
        const isLiked = uid === undefined ? false : (await article.selectInLikeCommentTableByCidAndUid(commentList[ i ].cid, uid)).length ? true : false
        // 4.4查询当前评论的点赞总数
        const [ count ] = await article.countInLikeCommentTabeByCid(commentList[ i ].cid)
        // 4.5 需要对评论的图片单独进行处理
        const photo: string[] = []
        if (commentList[ i ].photo !== null) {
          commentList[ i ].photo.split(',').map(ele => photo.push(ele))
        }
        resList.push({
          cid: commentList[ i ].cid,
          content: commentList[ i ].content,
          createTime: commentList[ i ].createTime,
          aid: commentList[ i ].aid,
          uid: commentList[ i ].uid,
          photo: commentList[ i ].photo ? photo : null,
          user: { ...userInfo, is_followed: isFollowed },
          is_liked: isLiked,
          like_count: count.total
        })
      }

      return Promise.resolve({
        list: resList,
        total: count.total,
        offset,
        limit,
        has_more: count.total > limit * offset + limit
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
   * 8.计算是否还有更多 若总数<limit*offset+limit则没有更多了
   * @param uid 用户id
   * @param currentUid 当前登录的用户id 
   * @param limit pageSize
   * @param offset 从第几页开始获取数据
   * @returns 
   */
  async getUserLikeArticleList (uid: number, currentUid: number | undefined, limit: number, offset: number) {
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
      const likeArticleList = await article.selectInLikeArticleTableByUidLimit(uid, limit, offset, true)
      // 3.5 获取帖子信息列表
      const articleList: any[] = []
      for (let i = 0; i < likeArticleList.length; i++) {
        const aid = likeArticleList[ i ].aid
        const [ articleInfo ] = await article.selectInArticleTableByAid(aid)
        // 获取当前帖子被点赞数量
        const [ likeCount ] = await article.countInLikeArticleTableByAid(aid)
        // 获取当前用户对帖子点赞的状态
        const isLiked = currentUid === undefined ? false : (await article.selectInLikeArticleTableByAidAndUid(currentUid, aid)).length ? true : false
        // 获取当前帖子被收藏的数量
        const [ starCount ] = await article.countInStarArticleTableByAid(aid)
        // 获取当前用户对帖子的收藏状态
        const isStar = currentUid === undefined ? false : (await article.selectInStarArticleTableByUidAndAid(currentUid, aid)).length ? true : false
        // 获取帖子被评论的总数
        const [ commentCount ] = await article.countInCommentTableByAid(aid)
        // 获取帖子的创建者信息
        const [ userInfo ] = await user.selectByUid(uid)
        // 获取当前用户对楼主的关注状态
        const isFollowedUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(currentUid, uid)).length ? true : false;
        // 获取楼主对当前用户的关注状态
        const isFansUser = currentUid === undefined ? false : (await user.selectByUidAndUidIsFollow(uid, currentUid)).length ? true : false;
        // 获取帖子所属的吧 以及当前用户对吧的关注状态
        const [ barInfo ] = await bar.selectByBid(articleInfo.bid)
        // 获取当前用户是否关注吧
        const isFollowedBar = currentUid === undefined ? false : (await bar.selectFollowByUidAndBid(articleInfo.bid, currentUid)).length ? true : false

        articleList.push({
          ...articleInfo,
          like_count: likeCount.total,
          is_liked: isLiked,
          star_count: starCount.total,
          is_star: isStar,
          comment_count: commentCount.total,
          user: {
            ...userInfo,
            is_followed: isFollowedUser,
            is_fans: isFansUser
          },
          bar: {
            ...barInfo,
            is_followed: isFollowedBar
          }
        })
      }

      return Promise.resolve({
        list: articleList,
        total: total.total,
        limit,
        offset,
        has_more: total.total < limit * offset + limit ? true : false
      })

    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default ArticleService
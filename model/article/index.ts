import type { OkPacket } from 'mysql'
import type { ArticleBaseItem, InsertArticleBody, ArticleLikeBaseItem, ArticleStarBaseItem, InserCommentBody, CommentBaseItem, LikeCommentBaseItem } from './types'
import type { CountRes } from '../../types'
import BaseModel from '../base/index'
import { getNowTimeString } from '../../utils/tools/time'

/**
 * 在某个表用 in
 * 查询某个字段用 by
 */

/**
 * 帖子模型
 */
class ArticleModel extends BaseModel {
  /**
   * 在帖子表中 插入一条记录
   * @param data 
   * @returns 
   */
  async insertInArticleTable (data: InsertArticleBody) {
    try {
      const sqlString = data.photo ?
        `INSERT INTO article(content, createTime, bid, uid, title,photo) VALUES ('${ data.content }', '${ getNowTimeString() }', ${ data.bid }, ${ data.uid }, '${ data.title }','${ data.photo }')` :
        `INSERT INTO article(content, createTime, bid, uid, title) VALUES ('${ data.content }', '${ getNowTimeString() }', ${ data.bid }, ${ data.uid }, '${ data.title }')`
      const res = await this.runSql<OkPacket>(sqlString)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('插入数据失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过aid来获取对应记录
   * @param aid 帖子id
   * @returns 对应帖子的数据
   */
  async selectInArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过吧id来查询该吧下的帖子数量
   * @param bid 吧id
   * @returns 该吧下的发帖数量
   */
  async countInArticleTableByBid (bid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article where bid=${ bid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过uid来查询该用户发帖数量
   * @param uid 用户id
   * @returns 
   */
  async countInArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article where uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过uid来查询用户所有的帖子记录
   * @param uid 用户id
   * @returns 
   */
  async selectInArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过uid来查询用户发送的帖子列表 （分页限制）
   * @param uid 用户id
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取查询
   * @param desc 升序还是降序
   * @returns 
   */
  async selectInArticleTableByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where uid=${ uid } ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 删除帖子
   * @param aid 帖子id
   * @returns 
   */
  async delectInArticleTableByAid(aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from article where aid=${aid}`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('删除帖子失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 根据创建时间来浏览帖子 (分页限制)
   * @param limit 获取多少条数据
   * @param offset 多少便宜量
   * @param desc 根据创建时间升序或降序
   * @returns 
   */
  async selectInArticleTableLimit(limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article order by createTime ${desc?'desc':'asc'} limit ${limit} offset ${offset}`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 查询帖子总数
   * @returns 
   */
  async countInArticleTable() {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 插入一条记录
   * @param uid 
   * @param aid 
   * @returns 
   */
  async insertInLikeArticleTable (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`INSERT INTO user_like_article(aid, uid, createTime) VALUES (${ aid }, ${ uid }, '${ getNowTimeString() }')`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('插入数据失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过aid和uid查询该用户是否点赞该帖子
   * @param uid 
   * @param aid 
   * @returns 
   */
  async selectInLikeArticleTableByAidAndUid (uid: number, aid: number) {
    try {
      const res = await this.runSql<ArticleLikeBaseItem[]>(`select * from user_like_article where uid=${ uid } and aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过uid和aid删除用户点赞帖子的记录
   * @param uid 用户id
   * @param aid 帖子id
   * @returns 
   */
  async deleteInLikeArticleTableByAidAndUid (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_like_article where uid=${ uid } and aid=${ aid }`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('删除点赞帖子的记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过aid来查询点赞文章的数量
   * @param aid 帖子id
   */
  async countInLikeArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_article where aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过uid来查询用户点赞文章的总数量
   * @param uid 用户id
   * @returns 
   */
  async countInLikeArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_article where uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过uid获取用户点赞的帖子 （分页限制）
   * @param uid 用户id
   * @param limit 获取多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc true降序 false升序
   * @returns 
   */
  async selectInLikeArticleTableByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleLikeBaseItem[]>(`select * from user_like_article where uid=${ uid } ORDER BY createTime ${ desc ? 'DESC' : 'ASC' } limit ${ limit } OFFSET ${ offset }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过aid来查询点赞帖子的用户 （分页限制）
   * @param aid 帖子id
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   * @returns 
   */
  async selectInLikeArticleTableByAidLimit (aid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleLikeBaseItem[]>(`select * from user_like_article where aid=${ aid } ORDER BY createTime ${ desc ? 'DESC' : 'ASC' } limit ${ limit } OFFSET ${ offset }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子表中 通过uid和aid插入一条记录
   * @param uid 用户id
   * @param aid 帖子id
   * @returns 
   */
  async insertInStarArticleTable (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`INSERT INTO user_star_article(uid, aid, createTime) VALUES (${ uid }, ${ aid }, '${ getNowTimeString() }')`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('插入收藏帖子记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子表中 通过uid和aid来查询用户收藏该帖子的记录
   * @param uid 帖子id
   * @param aid 用户id
   * @returns 
   */
  async selectInStarArticleTableByUidAndAid (uid: number, aid: number) {
    try {
      const res = await this.runSql<ArticleStarBaseItem[]>(`select * from user_star_article where uid=${ uid } and aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过uid和aid来删除用户收藏帖子的记录
   * @param aid 帖子id
   * @param uid 用户id
   * @returns 
   */
  async deleteInStarArticleTableByAidAndUid (aid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_star_article where uid=${ uid } and aid=${ aid }`)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject('删除收藏帖子的记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过aid来查询帖子被收藏的数量
   * @param aid 用户id
   * @returns 
   */
  async countInStarArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_star_article where aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过uid来获取用户收藏帖子的总数
   * @param uid 用户id 
   * @returns 
   */
  async countInStarArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_star_article where uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过uid来查询用户收藏的帖子 （分页限制）
   * @param uid 用户id
   * @param limit 一次查询多少条数据
   * @param offset 从偏移量多少开始查询
   * @param desc 降序还是升序
   */
  async selectInStarArticleTableByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleStarBaseItem[]>(`SELECT * FROM user_star_article where uid=${ uid } ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过aid来查询收藏帖子的用户
   * @param aid 用户id
   * @param limit 一次查询多少条数据
   * @param offset  从偏移量多少开始查询
   * @param desc 降序还是升序
   * @returns 
   */
  async selectInStarArticleTableByAidLimit (aid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleStarBaseItem[]>(`SELECT * FROM user_star_article where aid=${ aid } ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 插入一条记录
   * @param data 评论的请求体
   * @returns 
   */
  async insertInCommentTable (data: InserCommentBody) {
    const sqlString = data.photo ?
      `INSERT INTO comment(content, createTime, aid, uid, photo) VALUES ('${ data.content }', '${ getNowTimeString() }', ${ data.aid }, ${ data.uid },'${ data.photo }')`
      :
      `INSERT INTO comment(content, createTime, aid, uid) VALUES ('${ data.content }', '${ getNowTimeString() }', ${ data.aid }, ${ data.uid })`
    try {
      const res = await this.runSql<OkPacket>(sqlString)
      if (res.affectedRows) {
        // 插入记录成功
        return Promise.resolve()
      } else {
        // 插入记录失败
        await Promise.reject('插入评论记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过aid来查询该帖子的评论 (分页限制)
   * @param aid 帖子id
   * @returns 
   */
  async selectInCommentTableByAidLimit (aid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`select * from comment where aid=${ aid } order by createTime ${ desc ? 'desc' : 'asc' } limit ${ limit } offset ${ offset }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   *  在评论表中 通过aid查询该帖子的评论总数
   * @param aid 帖子id
   * @returns 
   */
  async countInCommentTableByAid (aid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*)  as total from comment where aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过uid查询该用户的评论总数
   * @param uid 用户id
   * @returns 
   */
  async countInCommentTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*)  as total from comment where uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过cid来删除一条评论
   * @param cid 评论的id
   * @returns 
   */
  async deleteInCommentTableByCid (cid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from comment where cid=${ cid }`)
      if (res.affectedRows) {
        // 删除成功
        return Promise.resolve()
      } else {
        await Promise.reject('删除评论失败')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过cid来查询评论记录
   * @param cid 
   * @returns 
   */
  async selectInCommentTableByCid (cid: number) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`select * from comment where cid=${ cid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过uid来查询用户所有的评论记录
   * @param uid 
   * @returns 
   */
  async selectInCommentTableByUid (uid: number) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`select * from comment where uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过uid来查询用户点赞评论的总数
   * @param uid 
   * @returns 
   */
  async countInLikeCommentTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_comment where uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 插入一条记录
   * @param cid 评论id
   * @param uid 用户id
   * @returns 
   */
  async insertInLikeCommentTable (cid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>(`INSERT INTO user_like_comment(cid, uid, createTime) VALUES (${ cid }, ${ uid }, '${ getNowTimeString() }')`)
      if (res.affectedRows) {
        // 插入记录成功
        return Promise.resolve()
      } else {
        // 插入记录失败
        await Promise.reject('插入点赞评论记录失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid和uid删除评论记录
   * @param cid 评论的id
   * @param uid 用户的id
   */
  async deleteInLikeCommentTableByCidAndUid (cid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_like_comment where cid=${ cid } and uid=${ uid }`)
      if (res.affectedRows) {
        // 删除记录成功
        return Promise.resolve()
      } else {
        // 删除记录失败
        await Promise.reject('删除点赞评论失败!')
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid和uid查询点赞评论记录
   * @param cid 评论id
   * @param uid 用户id
   */
  async selectInLikeCommentTableByCidAndUid (cid: number, uid: number) {
    try {
      const res = await this.runSql<LikeCommentBaseItem[]>(`select * from user_like_comment where cid=${ cid } and uid=${ uid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid查询该评论的点赞数量
   * @param cid 
   * @returns 
   */
  async countInLikeCommentTabeByCid (cid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_comment where cid=${ cid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default ArticleModel

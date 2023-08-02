import type { OkPacket } from 'mysql'
import type { ArticleBaseItem, InsertArticleBody, ArticleLikeBaseItem, ArticleStarBaseItem, InserCommentBody, CommentBaseItem, LikeCommentBaseItem, ReplyBaseItem, UserLikeReplyItem } from './types'
import type { CountRes } from '../../types'
import BaseModel from '../base/index'
import { getNowTimeString, getDaysBeforeTimeString, getTimeString } from '../../utils/tools/time'
import tips from '../../config/tips'

/**
 * 在某个表用 in
 * 查询某个字段用 by
 */

/**
 * 帖子模型
 */
class ArticleModel extends BaseModel {
  /**
   * 在帖子表中 插入一条记录 --占位符sql
   * @param data 
   * @returns 
   */
  async insertInArticleTable (data: InsertArticleBody) {
    try {
      const [ sqlString, placeholder ] = data.photo ? [
        'INSERT INTO article(content, createTime, bid, uid, title,photo) VALUES (?, ?, ?, ?, ?,?)', [ data.content, getNowTimeString(), data.bid, data.uid, data.title, data.photo ]
      ] : [ 'INSERT INTO article(content, createTime, bid, uid, title) VALUES (?, ?, ?, ?, ?)', [ data.content, getNowTimeString(), data.bid, data.uid, data.title ] ]
      const res = await this.runSql<OkPacket>(sqlString, placeholder)
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject(tips.insertFailed('帖子'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过aid来获取对应记录 --占位符sql
   * @param aid 帖子id
   * @returns 对应帖子的数据
   */
  async selectInArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where aid=?`, [ aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过吧id来查询该吧下的帖子数量 --占位符sql
   * @param bid 吧id
   * @returns 该吧下的发帖数量
   */
  async countInArticleTableByBid (bid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article where bid=?`, [ bid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过帖子标题来模糊搜索帖子列表 --占位符sql
   * @param keywords 关键词
   * @param limit 返回多少体数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序或降序
   * @returns 
   */
  async searchInArticleTableByTitle (keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`SELECT * from article where title like ? ORDER BY createTime ${ desc ? 'desc' : 'asc' } LIMIT ? OFFSET ?`, [ `%${ keywords }%`, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过帖子标题来模糊查询帖子总数 --占位符sql
   * @param keywords 关键词
   * @returns 
   */
  async countSearchInAricleTableByTitle (keywords: string) {
    try {
      const res = await this.runSql<CountRes>('SELECT count(*) as total from article where title like ?', [ `%${ keywords }%` ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
  * 在帖子表中 通过帖子内容来模糊搜索帖子列表 --占位符sql
  * @param keywords 关键词
  * @param limit 返回多少体数据
  * @param offset 从多少偏移量开始获取数据
  * @param desc 根据创建时间升序或降序
  * @returns 
  */
  async searchInArticleTableByContent (keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`SELECT * from article where content like ? ORDER BY createTime ${ desc ? 'desc' : 'asc' } LIMIT ? OFFSET ?`, [ `%${ keywords }%`, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过帖子内容来模糊查询帖子总数 --占位符sql
   * @param keywords 关键词
   * @returns 
   */
  async countSearchInAricleTableByContent (keywords: string) {
    try {
      const res = await this.runSql<CountRes>('SELECT count(*) as total from article where content like ?', [ `%${ keywords }%` ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * 在帖子表中 通过uid来查询该用户发帖数量 --占位符sql
   * @param uid 用户id
   * @returns 
   */
  async countInArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article where uid=?`, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 发现帖子 查询关注者发送的帖子 --占位符sql
   * @param uid 当前用户
   * @param limit 多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据帖子创建的时间升序或降序
   * @returns 
   */
  async discoverAricle (uid: number, limit: number, offset: number, desc: boolean) {
    try {
      const sqlString = `select * from article where uid in (select uid_is_followed from user_follow_user where uid = ?) ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`
      const res = await this.runSql<ArticleBaseItem[]>(sqlString, [ uid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 查询所有关注者的发帖数量 --占位符sql
   * @param uid 当前用户
   * @returns 
   */
  async countDiscoverArticle (uid: number) {
    try {
      const sqlString = 'select count(*) as total from article where uid in (select uid_is_followed from user_follow_user where uid=?)'
      const res = await this.runSql<CountRes>(sqlString, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过uid来查询用户所有的帖子记录 --占位符sql
   * @param uid 用户id
   * @returns 
   */
  async selectInArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where uid=?`, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 通过uid来查询用户发送的帖子列表 （分页限制） --占位符sql
   * @param uid 用户id
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取查询
   * @param desc 升序还是降序
   * @returns 
   */
  async selectInArticleTableByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where uid=? ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`, [ uid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 删除帖子 --占位符sql
   * @param aid 帖子id
   * @returns 
   */
  async delectInArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from article where aid=?`, [ aid ])
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject(tips.deleteFailed('帖子'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 根据创建时间来浏览帖子 (分页限制) --占位符sql
   * @param limit 获取多少条数据
   * @param offset 多少便宜量
   * @param desc 根据创建时间升序或降序
   * @returns 
   */
  async selectInArticleTableLimit (limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article order by createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`, [ limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 查询帖子总数
   * @returns 
   */
  async countInArticleTable () {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 查询近x天来评论最多的帖子列表 (分页限制) --占位符sql
   * @param day 多少天之前
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始查询数据
   * @returns 帖子列表
   */
  async findHotArticle (day: number, limit: number, offset: number) {
    try {
      const sqlString = `select article.* from article,(select count(*) as total,aid from comment GROUP BY aid) as temp where article.aid=temp.aid and createTime BETWEEN '${ getDaysBeforeTimeString(day) }' and '${ getTimeString(new Date()) }' ORDER BY total desc  limit ? OFFSET ?`
      const res = await this.runSql<ArticleBaseItem[]>(sqlString, [ limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 查询近x天来评论最多的帖子列表总数
   * @param day 多少天之前
   * @returns 总数
   */
  async countFindHotArticle (day: number) {
    try {
      const sqlString = `select count(*) as total from article,(select count(*) as total,aid from comment GROUP BY aid) as temp where article.aid=temp.aid and createTime BETWEEN '${ getDaysBeforeTimeString(day) }' and '${ getTimeString(new Date()) }'`
      const res = await this.runSql<CountRes>(sqlString)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 插入一条记录  --占位符sql
   * @param uid 
   * @param aid 
   * @returns 
   */
  async insertInLikeArticleTable (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>('INSERT INTO user_like_article(aid, uid, createTime) VALUES (?,?,?)', [ aid, uid, getNowTimeString() ])
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject(tips.insertFailed('点赞帖子'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过aid和uid查询该用户是否点赞该帖子 --占位符sql
   * @param uid 
   * @param aid 
   * @returns 
   */
  async selectInLikeArticleTableByAidAndUid (uid: number, aid: number) {
    try {
      const res = await this.runSql<ArticleLikeBaseItem[]>(`select * from user_like_article where uid=? and aid=?`, [ uid, aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过uid和aid删除用户点赞帖子的记录 --占位符sql
   * @param uid 用户id
   * @param aid 帖子id
   * @returns 
   */
  async deleteInLikeArticleTableByAidAndUid (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_like_article where uid=? and aid=?`, [ uid, aid ])
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject(tips.deleteFailed('点赞帖子'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过aid来查询点赞文章的数量 --占位符sql
   * @param aid 帖子id
   */
  async countInLikeArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_article where aid=?`, [ aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过uid来查询用户点赞文章的总数量 --占位符sql
   * @param uid 用户id
   * @returns 
   */
  async countInLikeArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_article where uid=?`, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过uid获取用户点赞的帖子 （分页限制） --占位符sql
   * @param uid 用户id
   * @param limit 获取多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc true降序 false升序
   * @returns 
   */
  async selectInLikeArticleTableByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleLikeBaseItem[]>(`select * from user_like_article where uid=? ORDER BY createTime ${ desc ? 'DESC' : 'ASC' } limit ? OFFSET ?`, [ uid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞帖子表中 通过aid来查询点赞帖子的用户 （分页限制） --占位符sql
   * @param aid 帖子id
   * @param limit 返回多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   * @returns 
   */
  async selectInLikeArticleTableByAidLimit (aid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleLikeBaseItem[]>(`select * from user_like_article where aid=? ORDER BY createTime ${ desc ? 'DESC' : 'ASC' } limit ? OFFSET ?`, [ aid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子表中 通过uid和aid插入一条记录  --占位符sql
   * @param uid 用户id
   * @param aid 帖子id
   * @returns 
   */
  async insertInStarArticleTable (uid: number, aid: number) {
    try {
      const res = await this.runSql<OkPacket>('INSERT INTO user_star_article(uid, aid, createTime) VALUES (?, ?, ?)', [ uid, aid, getNowTimeString() ])
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject(tips.insertFailed('收藏帖子'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子表中 通过uid和aid来查询用户收藏该帖子的记录 --占位符sql
   * @param uid 帖子id
   * @param aid 用户id
   * @returns 
   */
  async selectInStarArticleTableByUidAndAid (uid: number, aid: number) {
    try {
      const res = await this.runSql<ArticleStarBaseItem[]>(`select * from user_star_article where uid=? and aid=?`, [ uid, aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过uid和aid来删除用户收藏帖子的记录 --占位符sql
   * @param aid 帖子id
   * @param uid 用户id
   * @returns 
   */
  async deleteInStarArticleTableByAidAndUid (aid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_star_article where uid=? and aid=?`, [ uid, aid ])
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        await Promise.reject(tips.deleteFailed('收藏帖子'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过aid来查询帖子被收藏的数量 --占位符sql
   * @param aid 用户id
   * @returns 
   */
  async countInStarArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_star_article where aid=?`, [ aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过uid来获取用户收藏帖子的总数 --占位符sql
   * @param uid 用户id 
   * @returns 
   */
  async countInStarArticleTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_star_article where uid=?`, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过uid来查询用户收藏的帖子 （分页限制） --占位符sql
   * @param uid 用户id
   * @param limit 一次查询多少条数据
   * @param offset 从偏移量多少开始查询
   * @param desc 降序还是升序
   */
  async selectInStarArticleTableByUidLimit (uid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleStarBaseItem[]>(`SELECT * FROM user_star_article where uid=? ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`, [ uid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在收藏帖子中 通过aid来查询收藏帖子的用户 --占位符sql
   * @param aid 用户id
   * @param limit 一次查询多少条数据
   * @param offset  从偏移量多少开始查询
   * @param desc 降序还是升序
   * @returns 
   */
  async selectInStarArticleTableByAidLimit (aid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleStarBaseItem[]>(`SELECT * FROM user_star_article where aid=? ORDER BY createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`, [ aid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 插入一条记录 --占位符sql
   * @param data 评论的请求体
   * @returns 
   */
  async insertInCommentTable (data: InserCommentBody) {
    const [ sqlString, placeholder ] = data.photo ?
      [ 'INSERT INTO comment(content, createTime, aid, uid, photo) VALUES (?, ?, ?, ?, ?)', [ data.content, getNowTimeString(), data.aid, data.uid, data.photo ] ]
      :
      [ 'INSERT INTO comment(content, createTime, aid, uid) VALUES (?, ?, ?, ?)', [ data.content, getNowTimeString(), data.aid, data.uid ] ]
    try {
      const res = await this.runSql<OkPacket>(sqlString, placeholder)
      if (res.affectedRows) {
        // 插入记录成功
        return Promise.resolve()
      } else {
        // 插入记录失败
        await Promise.reject(tips.insertFailed('评论'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过评论的内容模糊搜索 --占位符sql
   * @param keywords 关键字
   * @param limit 返回多少体数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序降序
   * @returns 
   */
  async searchInCommentTableByContent (keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`SELECT * FROM comment where content like ? ORDER BY createTime ${ desc ? 'desc' : 'asc' } LIMIT ? OFFSET ?`, [ `%${ keywords }%`, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过评论内容模糊匹配评论总数 --占位符sql
   * @param keywords 关键字
   * @returns 
   */
  async countSearchInCommentTableByContent (keywords: string) {
    try {
      const res = await this.runSql<CountRes>('select count(*) as total from comment where content like ?', [ `%${ keywords }%` ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过aid来查询该帖子的评论 (分页限制) --占位符sql
   * @param aid 帖子id
   * @returns 
   */
  async selectInCommentTableByAidLimit (aid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`select * from comment where aid=? order by createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`, [ aid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 查询热门评论（根据点赞评论的数量对评论降序排序，并指定查询某个时间段的评论） --占位符sql
   * @param day 多少天前的评论
   * @param limit 取多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @returns 
   */
  async findHotComment (day: number, limit: number, offset: number) {
    try {
      const sqlString = `select comment.* from comment,(select count(*) as total,cid from user_like_comment GROUP BY cid) as temp where comment.cid=temp.cid and createTime BETWEEN '${ getDaysBeforeTimeString(day) }' and '${ getTimeString(new Date()) }' ORDER BY total desc limit ? offset ?`
      const res = await this.runSql<CommentBaseItem[]>(sqlString, [ limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 查询热门评论的总数量
   * @param day 多少天前的评论
   * @returns 
   */
  async countFindHotComment (day: number) {
    try {
      const sqlString = `select count(*) as total from comment,(select count(*) as total,cid from user_like_comment GROUP BY cid) as temp where comment.cid=temp.cid and createTime BETWEEN '${ getDaysBeforeTimeString(day) }' and '${ getTimeString(new Date()) }'`
      const res = await this.runSql<CountRes>(sqlString)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   *  在评论表中 通过aid查询该帖子的评论总数  --占位符sql
   * @param aid 帖子id
   * @returns 
   */
  async countInCommentTableByAid (aid: number) {
    try {
      const res = await this.runSql<CountRes>('select count(*) as total from comment where aid=?', [ aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过uid查询该用户的评论总数 --占位符sql
   * @param uid 用户id
   * @returns 
   */
  async countInCommentTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*)  as total from comment where uid=?`, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过cid来删除一条评论 --占位符sql
   * @param cid 评论的id
   * @returns 
   */
  async deleteInCommentTableByCid (cid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from comment where cid=?`, [ cid ])
      if (res.affectedRows) {
        // 删除成功
        return Promise.resolve()
      } else {
        await Promise.reject(tips.deleteFailed('帖子'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过cid来查询评论记录 --占位符sql
   * @param cid 
   * @returns 
   */
  async selectInCommentTableByCid (cid: number) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`select * from comment where cid=?`, [ cid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过uid来查询用户所有的评论记录 --占位符sql
   * @param uid 
   * @returns 
   */
  async selectInCommentTableByUid (uid: number) {
    try {
      const res = await this.runSql<CommentBaseItem[]>(`select * from comment where uid=?`, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过uid来查询用户点赞评论的总数 --占位符sql
   * @param uid 
   * @returns 
   */
  async countInLikeCommentTableByUid (uid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_comment where uid=?`, [ uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 插入一条记录 --占位符sql
   * @param cid 评论id
   * @param uid 用户id
   * @returns 
   */
  async insertInLikeCommentTable (cid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>('INSERT INTO user_like_comment(cid, uid, createTime) VALUES (?,?,?)', [ cid, uid, getNowTimeString() ])
      if (res.affectedRows) {
        // 插入记录成功
        return Promise.resolve()
      } else {
        // 插入记录失败
        await Promise.reject(tips.insertFailed('点赞评论'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid和uid删除评论记录 --占位符sql
   * @param cid 评论的id
   * @param uid 用户的id
   */
  async deleteInLikeCommentTableByCidAndUid (cid: number, uid: number) {
    try {
      const res = await this.runSql<OkPacket>('delete from user_like_comment where cid=? and uid=?', [ cid, uid ])
      if (res.affectedRows) {
        // 删除记录成功
        return Promise.resolve()
      } else {
        // 删除记录失败
        await Promise.reject(tips.deleteFailed('点赞评论'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid和uid查询点赞评论记录 --占位符sql
   * @param cid 评论id
   * @param uid 用户id
   */
  async selectInLikeCommentTableByCidAndUid (cid: number, uid: number) {
    try {
      const res = await this.runSql<LikeCommentBaseItem[]>(`select * from user_like_comment where cid=? and uid=?`, [ cid, uid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞评论表中 通过cid查询该评论的点赞数量 --占位符sql
   * @param cid 
   * @returns 
   */
  async countInLikeCommentTabeByCid (cid: number) {
    try {
      const res = await this.runSql<CountRes>('select count(*) as total from user_like_comment where cid=?', [ cid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在评论表中 通过aid获取该帖子中的评论 --占位符sql
   * @param aid 帖子id
   * @returns 
   */
  async selectInCommentTableByAid (aid: number) {
    try {
      const res = await this.runSql<CommentBaseItem[]>('select * from comment where aid = ?', [ aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 分页查询该吧的帖子列表 --占位符sql
   * @param bid 吧id
   * @param limit 获取多少条数据
   * @param offset 偏移量
   * @param desc 根据创建时间降序
   * @returns 
   */
  async selectInArticleTableByBidLimit (bid: number, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where bid=? order by createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`, [ bid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 获取该吧的所有帖子 --占位符sql
   * @param bid 吧id
   */
  async selectInArticleTableByBid (bid: number) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>('select * from article where bid = ?', [ bid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 模糊匹配帖子标题和帖子内容 （分页限制） --占位符sql
   * @param keywords 关键词
   * @param limit 查询多少条数据
   * @param offset 从多少偏移量开始获取数据
   * @param desc 根据创建时间升序或降序
   * @returns 
   */
  async selectInArticleTableLikeTitleOrContentLimit (keywords: string, limit: number, offset: number, desc: boolean) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from article where content like ? or title like ? order by createTime ${ desc ? 'desc' : 'asc' } limit ? offset ?`, [ `%${ keywords }%`, `%${ keywords }%`, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在帖子表中 模糊匹配搜索帖子标题和帖子内容的总数 --占位符sql
   * @param keywords 
   * @returns 
   */
  async countInArticleTableLikeTitleOrContent (keywords: string) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article where content like ? or title like ?`, [ `%${ keywords }%`, `%${ keywords }%` ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在回复评论表 添加一条回复 --占位符sql
   * @param uid 用户id
   * @param id 回复id或评论id 代表了回复的对象
   * @param content 回复内容
   * @param type 回复的类型 1回复评论 2对回复进行回复
   * @param cid 回复的id
   * @returns 
   */
  async insertInReplyTable (uid: number, id: number, content: string, type: 1 | 2, cid: number) {
    try {
      const res = await this.runSql<OkPacket>(`INSERT INTO user_reply_comment (uid,id,type,content,createTime,cid) VALUES (?,?,?,?,?,?)`, [ uid, id, type, content, getNowTimeString(), cid ])
      if (res.affectedRows) {
        Promise.resolve(res)
      } else {
        Promise.reject(tips.insertFailed('回复'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在回复评论表中 通过rid查询该回复记录 --占位符sql
   * @param rid 回复id
   */
  async selectInReplyTableByRid (rid: number) {
    try {
      const res = await this.runSql<ReplyBaseItem[]>(`select * from user_reply_comment where rid=?`, [ rid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在回复评论表中 通过rid和cid查询评论中是否存在该回复 --占位符sql
   * @param rid 
   * @param cid 
   */
  async selectInReplyTableByRidAndCid (rid: number, cid: number) {
    try {
      const res = await this.runSql<ReplyBaseItem[]>(`select * from user_reply_comment where cid=? and rid=?`, [ cid, rid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在用户点赞回复表中 插入一条记录 --占位符sql
   * @param uid 用户id
   * @param rid 回复id
   * @returns 
   */
  async insertInLikeReplyTable (uid: number, rid: number) {
    try {
      const res = await this.runSql<OkPacket>('insert into user_like_reply (uid,rid,createTime) values (?,?,?)', [ uid, rid, getNowTimeString() ])
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        return Promise.reject(tips.insertFailed('点赞回复'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在用户点赞回复表中 删除一条记录 --占位符sql
   * @param uid  用户id
   * @param rid 回复id
   * @returns 
   */
  async deleteInLikeReplyTable (uid: number, rid: number) {
    try {
      const res = await this.runSql<OkPacket>(`delete from user_like_reply where uid=? and rid=?`, [ uid, rid ])
      if (res.affectedRows) {
        return Promise.resolve()
      } else {
        return Promise.reject(tips.deleteFailed('点赞回复'))
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在用户点赞回复表中 查询用户点赞过该回复的记录 --占位符sql
   * @param uid 用户id
   * @param rid 回复id
   */
  async selectInLikeReplyTable (uid: number, rid: number) {
    try {
      const res = await this.runSql<UserLikeReplyItem[]>(`select * from user_like_reply where uid=? and rid=?`, [ uid, rid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在回复表中 分页获取评论的回复(包括所有属于该评论的回复 对于评论的回复+回复的回复) --占位符sql
   * @param cid 评论id
   * @param limit 查询多少条数据
   * @param offset 从多少偏移量开始获取数据
   */
  async selectInReplyTableByCidLimit (cid: number, limit: number, offset: number) {
    try {
      const res = await this.runSql<ReplyBaseItem[]>(`select * from user_reply_comment where cid=? limit ? offset ?`, [ cid, limit, offset ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在回复表中 查询该评论的所有回复 --占位符sql
   * @param cid 评论id
   * @returns 
   */
  async selectInReplyTableByCid (cid: number) {
    try {
      const res = await this.runSql<ReplyBaseItem[]>(`select * from user_reply_comment where cid=?`, [ cid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在回复表中 查询评论的总回复数量(包括所有属于该评论的回复 对于评论的回复+回复的回复) --占位符sql
   * @param cid 评论id
   * @returns 
   */
  async countInReplyTableByCid (cid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_reply_comment where cid=?`, [ cid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 在点赞回复表中 通过回复id来查询点赞总数 --占位符sql
   * @param rid 回复id
   */
  async countInLikeReplyTableByRid (rid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from user_like_reply where rid=?`, [ rid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取帖子的回复总数 --占位符sql
   * @param aid 
   * @returns 
   */
  async getArticleAllReplyCount (aid: number) {
    try {
      const res = await this.runSql<CountRes>('select count(*) as total from user_reply_comment where cid in (select cid from comment WHERE aid=?)', [ aid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  /**
   * 获取当前评论所有回复的点赞数量 （没有的则说明该回复的点赞数量为0) --占位符sql
   * @param cid 评论id
   */
  async getCommentReplyCount (cid: number) {
    try {
      const res = await this.runSql<{ rid: number, total: number }[]>('select count(rid) as total,rid from user_like_reply where rid in (select rid from user_reply_comment where cid=?) GROUP BY rid', [ cid ])
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
export default ArticleModel

import type { OkPacket } from 'mysql'
import type { ArticleBaseItem, InsertArticleBody, ArticleLikeBaseItem, ArticleStarBaseItem } from './types'
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
  async CountInArticleTableByBid (bid: number) {
    try {
      const res = await this.runSql<CountRes>(`select count(*) as total from article where bid=${ bid }`)
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
   * 在收藏帖子表中 通过uid和aid插入一条记录
   * @param uid 用户id
   * @param aid 帖子
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
   * @param uid 
   * @param aid 
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
}

export default ArticleModel

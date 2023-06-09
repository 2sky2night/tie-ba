import type { OkPacket } from 'mysql'
import type { ArticleBaseItem, InsertArticleBody } from './types'
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
}

export default ArticleModel

import type { OkPacket } from 'mysql'
import type { ArticleBaseItem, CreateArticleBody } from './types'
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
   * 在帖子表中插入一条记录
   * @param data 
   * @returns 
   */
  async insertInArticleTable (data: CreateArticleBody) {
    try {
      const photo = data.photo ? data.photo : null
      const res = await this.runSql<OkPacket>(`INSERT INTO acrticle(content, createTime, bid, uid, title,photo) VALUES ('${ data.content }', '${ getNowTimeString() }', ${ data.bid }, ${ data.uid }, '${ data.title }',${ photo })`)
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
   * 通过aid来获取对应记录
   * @param aid 
   * @returns 
   */
  async selectInArticleTableByAid (aid: number) {
    try {
      const res = await this.runSql<ArticleBaseItem[]>(`select * from acrticle where aid=${ aid }`)
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default ArticleModel

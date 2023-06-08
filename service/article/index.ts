// models
import ArticleModel from '../../model/article';
import BarModel from '../../model/bar'
// types
import type { InsertArticleBody } from '../../model/article/types';


const article = new ArticleModel()
const bar = new BarModel()

class ArticleService {
  /**
   * 创建帖子
   * @param data 
   * @returns 0所在吧不存在 1发帖成功
   */
  async createArticle(data: InsertArticleBody): Promise<1 | 0> {
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
   * 获取文章详情数据 (未完成)
   
   1.通过查询参数aid获取帖子详情数据

    2.通过帖子详情数据的uid查询帖子创建者详情数据，以及当前登录用户对帖子创建者的关注状态

    3.通过帖子详情数据的bid查询帖子所属吧的详情数据，以及当前登录用户对吧的关注状态

    4.通过aid来查询帖子点赞数量，以及当前登录用户对帖子的点赞状态

    5.通过aid来查询帖子的收藏数量，以及当前登录用户对帖子的收藏状态

    6.文章的评论数据需要调用其他接口来进行业务处理。
   * @param aid 
   * @returns 
   */
  async getArticleInfo(aid: number) {
    try {
      const res = await article.selectInArticleTableByAid(aid)
      if (res.length) {
        return Promise.resolve(res)
      }
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export default ArticleService
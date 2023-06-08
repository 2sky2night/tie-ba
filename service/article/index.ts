import ArticleModel from '../../model/article';
import type { CreateArticleBody } from '../../model/article/types';

const article = new ArticleModel()

class ArticleService {
  /**
   * 创建文章
   * @param data 
   * @returns 
   */
  async createArticle (data: CreateArticleBody) {
    try {
      await article.insertInArticleTable(data)
      return Promise.resolve()
    } catch (error) {
      Promise.reject(error)
    }
  }
  /**
   * 获取文章详情数据
   * @param aid 
   * @returns 
   */
  async getArticle (aid: number) {
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